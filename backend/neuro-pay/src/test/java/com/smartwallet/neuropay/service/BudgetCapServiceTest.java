package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.entity.Alert;
import com.smartwallet.neuropay.entity.Subscription;
import com.smartwallet.neuropay.entity.User;
import com.smartwallet.neuropay.enums.AlertSeverity;
import com.smartwallet.neuropay.enums.AlertType;
import com.smartwallet.neuropay.enums.BillingCycle;
import com.smartwallet.neuropay.enums.SubscriptionStatus;
import com.smartwallet.neuropay.repository.AlertRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetCapServiceTest {

    @Mock
    private AlertRepository alertRepository;
    @Mock
    private AlertPublisherService alertPublisherService;

    private BudgetCapService budgetCapService;
    private User user;

    @BeforeEach
    void setUp() {
        budgetCapService = new BudgetCapService(alertRepository, alertPublisherService);
        user = User.builder().id(1L).email("test@example.com").build();
    }

    private Subscription activeSubscription(String amount) {
        return Subscription.builder()
                .user(user)
                .amount(new BigDecimal(amount))
                .currency("USD")
                .billingCycle(BillingCycle.MONTHLY)
                .status(SubscriptionStatus.ACTIVE)
                .build();
    }

    @Test
    void checkAndFlag_doesNothing_whenNoCapIsSet() {
        user.setBudgetCap(null);

        budgetCapService.checkAndFlag(user, List.of(activeSubscription("1000.00")));

        verifyNoInteractions(alertPublisherService);
    }

    @Test
    void checkAndFlag_doesNothing_whenSpendIsUnderTheCap() {
        user.setBudgetCap(new BigDecimal("100.00"));

        budgetCapService.checkAndFlag(user, List.of(activeSubscription("50.00")));

        verifyNoInteractions(alertPublisherService);
    }

    @Test
    void checkAndFlag_publishesAHighSeverityAlert_whenSpendCrossesTheCap() {
        user.setBudgetCap(new BigDecimal("50.00"));
        when(alertRepository.findByUserIdOrderByCreatedAtDesc(user.getId())).thenReturn(List.of());

        budgetCapService.checkAndFlag(user, List.of(activeSubscription("60.00")));

        verify(alertPublisherService).publish(eq(user), isNull(), eq(AlertType.BUDGET_EXCEEDED),
                eq(AlertSeverity.HIGH), anyString(), anyString());
    }

    @Test
    void checkAndFlag_doesNotDuplicate_whenAnUnreadBudgetAlertAlreadyExists() {
        user.setBudgetCap(new BigDecimal("50.00"));
        Alert existingUnread = Alert.builder().type(AlertType.BUDGET_EXCEEDED).read(false).build();
        when(alertRepository.findByUserIdOrderByCreatedAtDesc(user.getId())).thenReturn(List.of(existingUnread));

        budgetCapService.checkAndFlag(user, List.of(activeSubscription("60.00")));

        verifyNoInteractions(alertPublisherService);
    }

    @Test
    void checkAndFlag_publishesAgain_onceThePreviousBudgetAlertHasBeenRead() {
        user.setBudgetCap(new BigDecimal("50.00"));
        Alert existingRead = Alert.builder().type(AlertType.BUDGET_EXCEEDED).read(true).build();
        when(alertRepository.findByUserIdOrderByCreatedAtDesc(user.getId())).thenReturn(List.of(existingRead));

        budgetCapService.checkAndFlag(user, List.of(activeSubscription("60.00")));

        verify(alertPublisherService).publish(eq(user), isNull(), eq(AlertType.BUDGET_EXCEEDED),
                eq(AlertSeverity.HIGH), anyString(), anyString());
    }

    @Test
    void checkAndFlag_ignoresPausedAndCancelledSubscriptions_whenSummingSpend() {
        user.setBudgetCap(new BigDecimal("10.00"));
        Subscription paused = activeSubscription("100.00");
        paused.setStatus(SubscriptionStatus.PAUSED);
        Subscription cancelled = activeSubscription("100.00");
        cancelled.setStatus(SubscriptionStatus.CANCELLED);

        budgetCapService.checkAndFlag(user, List.of(paused, cancelled));

        verifyNoInteractions(alertPublisherService);
    }
}
