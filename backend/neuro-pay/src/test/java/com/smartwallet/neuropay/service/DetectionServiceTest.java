package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.entity.Merchant;
import com.smartwallet.neuropay.entity.Transaction;
import com.smartwallet.neuropay.entity.User;
import com.smartwallet.neuropay.enums.AlertSeverity;
import com.smartwallet.neuropay.enums.AlertType;
import com.smartwallet.neuropay.enums.BillingCycle;
import com.smartwallet.neuropay.enums.SubscriptionStatus;
import com.smartwallet.neuropay.enums.TransactionSource;
import com.smartwallet.neuropay.repository.SubscriptionRepository;
import com.smartwallet.neuropay.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DetectionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private TransactionSeederService transactionSeederService;
    @Mock
    private SubscriptionRepository subscriptionRepository;
    @Mock
    private AlertPublisherService alertPublisherService;

    private DetectionService detectionService;
    private User user;
    private LocalDateTime now;

    @BeforeEach
    void setUp() {
        detectionService = new DetectionService(transactionRepository, transactionSeederService,
                subscriptionRepository, alertPublisherService);
        user = User.builder().id(1L).email("test@example.com").build();
        now = LocalDateTime.now();
    }

    // --- isSignificantIncrease -------------------------------------------------

    @Test
    void isSignificantIncrease_trueAtExactlyFivePercent() {
        assertThat(detectionService.isSignificantIncrease(new BigDecimal("100.00"), new BigDecimal("105.00"))).isTrue();
    }

    @Test
    void isSignificantIncrease_falseJustBelowFivePercent() {
        assertThat(detectionService.isSignificantIncrease(new BigDecimal("100.00"), new BigDecimal("104.90"))).isFalse();
    }

    @Test
    void isSignificantIncrease_falseWhenPriceDropped() {
        assertThat(detectionService.isSignificantIncrease(new BigDecimal("100.00"), new BigDecimal("80.00"))).isFalse();
    }

    @Test
    void isSignificantIncrease_falseWhenPriceUnchanged() {
        assertThat(detectionService.isSignificantIncrease(new BigDecimal("100.00"), new BigDecimal("100.00"))).isFalse();
    }

    // --- inferCycle --------------------------------------------------------

    @Test
    void inferCycle_recognizesWeekly() {
        List<Transaction> group = txSeries(merchant("X"), "9.99", now, 7, 4);
        assertThat(detectionService.inferCycle(group)).isEqualTo(BillingCycle.WEEKLY);
    }

    @Test
    void inferCycle_recognizesMonthly() {
        List<Transaction> group = txSeries(merchant("X"), "9.99", now, 30, 4);
        assertThat(detectionService.inferCycle(group)).isEqualTo(BillingCycle.MONTHLY);
    }

    @Test
    void inferCycle_recognizesYearly() {
        List<Transaction> group = txSeries(merchant("X"), "9.99", now, 365, 2);
        assertThat(detectionService.inferCycle(group)).isEqualTo(BillingCycle.YEARLY);
    }

    // --- full pipeline, through the public entry point ----------------------

    @Test
    void ensureDataForUser_isANoOp_onceTransactionsAlreadyExist() {
        when(transactionRepository.findByUserIdOrderByTransactionDateDesc(user.getId()))
                .thenReturn(List.of(mock(Transaction.class)));

        detectionService.ensureDataForUser(user);

        verify(transactionSeederService, never()).seedTransactionsForUser(any());
        verifyNoInteractions(alertPublisherService);
    }

    @Test
    void ensureDataForUser_seedsThenRunsDetection_whenUserHasNoTransactionsYet() {
        Merchant established = merchant("Netflix");   // recurring, unremarkable
        Merchant priceHiker = merchant("Adobe CC");    // recurring, price just jumped
        Merchant dormant = merchant("Figma");          // recurring, but stale
        Merchant unknown = merchant("XZMedia");        // one-off, never repeats

        List<Transaction> established2 = txSeries(established, "9.99", now, 30, 2);         // spans 30 days — reads as "new"
        List<Transaction> priceIncrease = priceIncreaseSeries(priceHiker, "49.99", "54.99", now, 2); // newest 2 days ago, old ones 90+ days back
        List<Transaction> unused = txSeries(dormant, "15.00", now.minusDays(60), 30, 3);      // newest 60 days ago
        Transaction oneOff = tx(unknown, "29.99", now.minusHours(5));

        List<Transaction> all = new ArrayList<>();
        all.addAll(established2);
        all.addAll(priceIncrease);
        all.addAll(unused);
        all.add(oneOff);

        when(transactionRepository.findByUserIdOrderByTransactionDateDesc(user.getId()))
                .thenReturn(Collections.emptyList(), all);
        // save() just needs to return something usable as the alert's subscription arg.
        when(subscriptionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        detectionService.ensureDataForUser(user);

        verify(transactionSeederService).seedTransactionsForUser(user);

        // 4 merchant groups -> 3 subscriptions (the one-off never becomes one)
        verify(subscriptionRepository, times(3)).save(any());

        // Adobe CC's subscription should be saved FLAGGED; the other two ACTIVE.
        verify(subscriptionRepository).save(argThat(s ->
                s.getMerchant() == priceHiker && s.getStatus() == SubscriptionStatus.FLAGGED));
        verify(subscriptionRepository).save(argThat(s ->
                s.getMerchant() == established && s.getStatus() == SubscriptionStatus.ACTIVE));
        verify(subscriptionRepository).save(argThat(s ->
                s.getMerchant() == dormant && s.getStatus() == SubscriptionStatus.ACTIVE));

        // Netflix: new pattern (established within the last 40 days) — NEW_DETECTED only.
        verify(alertPublisherService).publish(eq(user), any(), eq(AlertType.NEW_DETECTED), eq(AlertSeverity.LOW),
                anyString(), contains("Netflix"));

        // Adobe CC: a real price hike — PRICE_INCREASE, and nothing else for this merchant.
        verify(alertPublisherService).publish(eq(user), any(), eq(AlertType.PRICE_INCREASE), eq(AlertSeverity.HIGH),
                anyString(), contains("Adobe CC"));

        // Figma: established long ago and not charged in 60 days — UNUSED only.
        verify(alertPublisherService).publish(eq(user), any(), eq(AlertType.UNUSED), eq(AlertSeverity.MEDIUM),
                anyString(), contains("Figma"));

        // XZMedia: a single unrecognized charge — FRAUD, no subscription attached.
        verify(alertPublisherService).publish(eq(user), isNull(), eq(AlertType.FRAUD), eq(AlertSeverity.HIGH),
                anyString(), contains("XZMedia"));

        // Exactly those four alerts — nothing extra (e.g. no stray NEW_DETECTED for Adobe/Figma).
        verify(alertPublisherService, times(4)).publish(any(), any(), any(), any(), anyString(), anyString());
    }

    // --- fixtures ------------------------------------------------------------

    private Merchant merchant(String name) {
        return Merchant.builder().id((long) name.hashCode()).name(name).category("Test").logoEmoji("🔔").build();
    }

    private Transaction tx(Merchant merchant, String amount, LocalDateTime date) {
        return Transaction.builder()
                .user(user)
                .merchant(merchant)
                .amount(new BigDecimal(amount))
                .currency("USD")
                .description(merchant.getName() + " charge")
                .transactionDate(date)
                .source(TransactionSource.SIMULATED)
                .build();
    }

    /** `occurrences` charges of the same amount, `intervalDays` apart, most recent `offsetFromNow` after `now`. */
    private List<Transaction> txSeries(Merchant merchant, String amount, LocalDateTime now, int intervalDays, int occurrences) {
        List<Transaction> rows = new ArrayList<>();
        for (int i = 0; i < occurrences; i++) {
            rows.add(tx(merchant, amount, now.minusDays((long) i * intervalDays)));
        }
        return rows;
    }

    private List<Transaction> priceIncreaseSeries(Merchant merchant, String oldAmount, String newAmount, LocalDateTime now, int oldOccurrences) {
        List<Transaction> rows = new ArrayList<>();
        rows.add(tx(merchant, newAmount, now.minusDays(2)));
        for (int i = 1; i <= oldOccurrences; i++) {
            rows.add(tx(merchant, oldAmount, now.minusDays(2 + (long) i * 30)));
        }
        return rows;
    }
}
