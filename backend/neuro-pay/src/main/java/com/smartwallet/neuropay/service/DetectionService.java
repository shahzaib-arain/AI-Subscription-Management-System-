package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.entity.*;
import com.smartwallet.neuropay.enums.*;
import com.smartwallet.neuropay.repository.SubscriptionRepository;
import com.smartwallet.neuropay.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Rule-based recurring-payment and anomaly detection — deliberately no ML
 * here. Scans a user's transaction history once, groups it by merchant, and
 * turns repeating charges into Subscription rows plus Alert rows (created
 * and delivered via AlertPublisherService) for anything that looks like a
 * price hike, an unused subscription, or a one-off charge from a merchant
 * with no established pattern.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DetectionService {

    private static final BigDecimal PRICE_INCREASE_THRESHOLD = new BigDecimal("0.05"); // 5%
    private static final int UNUSED_AFTER_DAYS = 45;
    private static final int NEW_PATTERN_WITHIN_DAYS = 40;

    private final TransactionRepository transactionRepository;
    private final TransactionSeederService transactionSeederService;
    private final SubscriptionRepository subscriptionRepository;
    private final AlertPublisherService alertPublisherService;

    /**
     * The one place data gets seeded and scanned — called lazily the first
     * time a user asks for their subscriptions or alerts. Safe to call
     * repeatedly: once transactions exist for a user, this is a no-op, so it
     * never produces duplicate subscriptions or alerts.
     */
    @Transactional
    public void ensureDataForUser(User user) {
        if (!transactionRepository.findByUserIdOrderByTransactionDateDesc(user.getId()).isEmpty()) {
            return;
        }
        transactionSeederService.seedTransactionsForUser(user);
        runDetection(user);
    }

    private void runDetection(User user) {
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByTransactionDateDesc(user.getId());
        LocalDateTime now = LocalDateTime.now();

        Map<Long, List<Transaction>> byMerchant = transactions.stream()
                .filter(t -> t.getMerchant() != null)
                .collect(Collectors.groupingBy(t -> t.getMerchant().getId()));

        for (List<Transaction> group : byMerchant.values()) {
            // findByUserIdOrderByTransactionDateDesc already sorted these — index 0 is newest.
            if (group.size() == 1) {
                flagUnrecognizedOneOff(user, group.get(0));
            } else {
                registerRecurringPattern(user, group, now);
            }
        }

        log.info("Detection run complete for user {}: {} merchant group(s) scanned", user.getEmail(), byMerchant.size());
    }

    private void registerRecurringPattern(User user, List<Transaction> group, LocalDateTime now) {
        Merchant merchant = group.get(0).getMerchant();
        Transaction latest = group.get(0);
        Transaction previous = group.get(1);
        Transaction earliest = group.get(group.size() - 1);

        BillingCycle cycle = inferCycle(group);
        LocalDate nextPaymentDate = latest.getTransactionDate().toLocalDate().plusDays(cycleLengthDays(cycle));
        boolean priceIncreased = isSignificantIncrease(previous.getAmount(), latest.getAmount());

        Subscription subscription = subscriptionRepository.save(Subscription.builder()
                .user(user)
                .merchant(merchant)
                .amount(latest.getAmount())
                .currency(latest.getCurrency())
                .billingCycle(cycle)
                .nextPaymentDate(nextPaymentDate)
                .status(priceIncreased ? SubscriptionStatus.FLAGGED : SubscriptionStatus.ACTIVE)
                .category(merchant.getCategory())
                .build());

        if (priceIncreased) {
            createPriceIncreaseAlert(user, subscription, merchant, previous.getAmount(), latest.getAmount());
        }

        if (Duration.between(earliest.getTransactionDate(), now).toDays() <= NEW_PATTERN_WITHIN_DAYS) {
            alertPublisherService.publish(user, subscription, AlertType.NEW_DETECTED, AlertSeverity.LOW,
                    "New subscription detected",
                    String.format("AI detected a new recurring charge from %s ($%s/%s).",
                            merchant.getName(), latest.getAmount(), cycle.name().toLowerCase()));
        }

        long daysSinceLastCharge = Duration.between(latest.getTransactionDate(), now).toDays();
        if (!priceIncreased && daysSinceLastCharge > UNUSED_AFTER_DAYS) {
            alertPublisherService.publish(user, subscription, AlertType.UNUSED, AlertSeverity.MEDIUM,
                    "Unused subscription",
                    String.format("You haven't been charged for %s in %d days. Consider pausing to save $%s/mo.",
                            merchant.getName(), daysSinceLastCharge, latest.getAmount()));
        }
    }

    private void flagUnrecognizedOneOff(User user, Transaction transaction) {
        String merchantName = transaction.getMerchant() != null ? transaction.getMerchant().getName() : "Unknown";
        alertPublisherService.publish(user, null, AlertType.FRAUD, AlertSeverity.HIGH,
                "Suspicious charge detected",
                String.format("An unrecognized merchant '%s' charged $%s — you don't have an existing subscription with this biller.",
                        merchantName, transaction.getAmount()));
    }

    private void createPriceIncreaseAlert(User user, Subscription subscription, Merchant merchant,
                                           BigDecimal previousAmount, BigDecimal latestAmount) {
        BigDecimal percent = latestAmount.subtract(previousAmount)
                .divide(previousAmount, 3, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
        alertPublisherService.publish(user, subscription, AlertType.PRICE_INCREASE, AlertSeverity.HIGH,
                "Price increase detected",
                String.format("%s increased from $%s to $%s/mo — a %s%% hike.",
                        merchant.getName(), previousAmount, latestAmount, percent.setScale(0, RoundingMode.HALF_UP)));
    }

    private boolean isSignificantIncrease(BigDecimal previousAmount, BigDecimal latestAmount) {
        if (latestAmount.compareTo(previousAmount) <= 0) return false;
        BigDecimal ratio = latestAmount.subtract(previousAmount).divide(previousAmount, 4, RoundingMode.HALF_UP);
        return ratio.compareTo(PRICE_INCREASE_THRESHOLD) >= 0;
    }

    private BillingCycle inferCycle(List<Transaction> group) {
        long totalDays = 0;
        int gaps = 0;
        for (int i = 0; i < group.size() - 1; i++) {
            totalDays += Duration.between(group.get(i + 1).getTransactionDate(), group.get(i).getTransactionDate()).toDays();
            gaps++;
        }
        long avgDays = gaps > 0 ? totalDays / gaps : 30;
        if (avgDays <= 14) return BillingCycle.WEEKLY;
        if (avgDays <= 200) return BillingCycle.MONTHLY;
        return BillingCycle.YEARLY;
    }

    private int cycleLengthDays(BillingCycle cycle) {
        return switch (cycle) {
            case WEEKLY -> 7;
            case MONTHLY -> 30;
            case YEARLY -> 365;
        };
    }
}
