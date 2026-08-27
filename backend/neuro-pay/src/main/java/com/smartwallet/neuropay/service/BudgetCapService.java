package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.entity.Subscription;
import com.smartwallet.neuropay.entity.User;
import com.smartwallet.neuropay.enums.AlertSeverity;
import com.smartwallet.neuropay.enums.AlertType;
import com.smartwallet.neuropay.enums.SubscriptionStatus;
import com.smartwallet.neuropay.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Checks a user's total active monthly subscription spend against their
 * self-set budget cap and raises one alert when it's crossed — re-checked
 * every time subscriptions are fetched, but never raises more than one
 * unread BUDGET_EXCEEDED alert at a time.
 */
@Service
@RequiredArgsConstructor
public class BudgetCapService {

    private final AlertRepository alertRepository;
    private final AlertPublisherService alertPublisherService;

    public void checkAndFlag(User user, List<Subscription> subscriptions) {
        BigDecimal cap = user.getBudgetCap();
        if (cap == null || cap.signum() <= 0) {
            return;
        }

        BigDecimal totalMonthly = subscriptions.stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.ACTIVE || s.getStatus() == SubscriptionStatus.FLAGGED)
                .map(this::monthlyEquivalent)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalMonthly.compareTo(cap) <= 0) {
            return;
        }

        boolean alreadyFlagged = alertRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .anyMatch(a -> a.getType() == AlertType.BUDGET_EXCEEDED && !a.isRead());
        if (alreadyFlagged) {
            return;
        }

        alertPublisherService.publish(user, null, AlertType.BUDGET_EXCEEDED, AlertSeverity.HIGH,
                "Monthly budget exceeded",
                String.format("Your active subscriptions now total $%s/mo, over your $%s/mo budget.",
                        totalMonthly.setScale(2, RoundingMode.HALF_UP), cap.setScale(2, RoundingMode.HALF_UP)));
    }

    // Mirrors the same cycle-normalization used on the frontend
    // (utils/subscription.ts:monthlyEquivalent) — kept in sync by convention
    // since Java and TypeScript can't share this logic directly.
    private BigDecimal monthlyEquivalent(Subscription subscription) {
        BigDecimal amount = subscription.getAmount();
        return switch (subscription.getBillingCycle()) {
            case WEEKLY -> amount.multiply(BigDecimal.valueOf(52)).divide(BigDecimal.valueOf(12), 4, RoundingMode.HALF_UP);
            case MONTHLY -> amount;
            case YEARLY -> amount.divide(BigDecimal.valueOf(12), 4, RoundingMode.HALF_UP);
        };
    }
}
