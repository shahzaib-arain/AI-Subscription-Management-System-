package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.dto.response.SubscriptionResponse;
import com.smartwallet.neuropay.entity.Merchant;
import com.smartwallet.neuropay.entity.Subscription;
import com.smartwallet.neuropay.entity.User;
import com.smartwallet.neuropay.enums.BillingCycle;
import com.smartwallet.neuropay.enums.SubscriptionStatus;
import com.smartwallet.neuropay.exception.ResourceNotFoundException;
import com.smartwallet.neuropay.repository.SubscriptionRepository;
import com.smartwallet.neuropay.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubscriptionServiceImplTest {

    @Mock
    private SubscriptionRepository subscriptionRepository;
    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private DetectionService detectionService;
    @Mock
    private BudgetCapService budgetCapService;

    private SubscriptionServiceImpl subscriptionService;
    private User owner;
    private User someoneElse;

    @BeforeEach
    void setUp() {
        subscriptionService = new SubscriptionServiceImpl(subscriptionRepository, transactionRepository,
                detectionService, budgetCapService);
        owner = User.builder().id(1L).email("owner@example.com").build();
        someoneElse = User.builder().id(2L).email("someone-else@example.com").build();
    }

    private Subscription subscriptionOwnedBy(User user) {
        return Subscription.builder()
                .id(100L)
                .user(user)
                .merchant(Merchant.builder().id(1L).name("Netflix").build())
                .amount(new BigDecimal("15.99"))
                .currency("USD")
                .billingCycle(BillingCycle.MONTHLY)
                .status(SubscriptionStatus.ACTIVE)
                .build();
    }

    @Test
    void pauseSubscription_setsStatusToPaused_whenTheCallerOwnsIt() {
        Subscription subscription = subscriptionOwnedBy(owner);
        when(subscriptionRepository.findById(100L)).thenReturn(Optional.of(subscription));
        when(subscriptionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        SubscriptionResponse response = subscriptionService.pauseSubscription(owner, 100L).getData();

        assertThat(response.getStatus()).isEqualTo("PAUSED");
    }

    @Test
    void resumeSubscription_setsStatusToActive() {
        Subscription subscription = subscriptionOwnedBy(owner);
        subscription.setStatus(SubscriptionStatus.PAUSED);
        when(subscriptionRepository.findById(100L)).thenReturn(Optional.of(subscription));
        when(subscriptionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        SubscriptionResponse response = subscriptionService.resumeSubscription(owner, 100L).getData();

        assertThat(response.getStatus()).isEqualTo("ACTIVE");
    }

    @Test
    void cancelSubscription_setsStatusToCancelled() {
        Subscription subscription = subscriptionOwnedBy(owner);
        when(subscriptionRepository.findById(100L)).thenReturn(Optional.of(subscription));
        when(subscriptionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        SubscriptionResponse response = subscriptionService.cancelSubscription(owner, 100L).getData();

        assertThat(response.getStatus()).isEqualTo("CANCELLED");
    }

    @Test
    void pauseSubscription_throwsNotFound_whenTheSubscriptionBelongsToSomeoneElse() {
        Subscription subscription = subscriptionOwnedBy(owner);
        when(subscriptionRepository.findById(100L)).thenReturn(Optional.of(subscription));

        // someoneElse must never be able to touch owner's subscription, and the
        // error must not reveal that the ID belongs to a real subscription.
        assertThatThrownBy(() -> subscriptionService.pauseSubscription(someoneElse, 100L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(subscriptionRepository, never()).save(any());
    }

    @Test
    void pauseSubscription_throwsNotFound_whenTheSubscriptionDoesNotExist() {
        when(subscriptionRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> subscriptionService.pauseSubscription(owner, 999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getUserSubscriptions_runsDetectionAndBudgetCheck_beforeReturningTheList() {
        Subscription subscription = subscriptionOwnedBy(owner);
        when(subscriptionRepository.findByUserIdOrderByNextPaymentDateAsc(owner.getId()))
                .thenReturn(List.of(subscription));

        List<SubscriptionResponse> response = subscriptionService.getUserSubscriptions(owner).getData();

        verify(detectionService).ensureDataForUser(owner);
        verify(budgetCapService).checkAndFlag(eq(owner), eq(List.of(subscription)));
        assertThat(response).hasSize(1);
        assertThat(response.get(0).getMerchantName()).isEqualTo("Netflix");
    }

    @Test
    void getSubscriptionHistory_returnsEmptyList_whenTheSubscriptionHasNoMerchant() {
        Subscription subscription = subscriptionOwnedBy(owner);
        subscription.setMerchant(null);
        when(subscriptionRepository.findById(100L)).thenReturn(Optional.of(subscription));

        var history = subscriptionService.getSubscriptionHistory(owner, 100L).getData();

        assertThat(history).isEmpty();
        verifyNoInteractions(transactionRepository);
    }
}
