package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.dto.response.SubscriptionResponse;
import com.smartwallet.neuropay.entity.Merchant;
import com.smartwallet.neuropay.entity.Plan;
import com.smartwallet.neuropay.entity.Subscription;
import com.smartwallet.neuropay.entity.User;
import com.smartwallet.neuropay.enums.BillingCycle;
import com.smartwallet.neuropay.enums.SubscriptionStatus;
import com.smartwallet.neuropay.exception.ResourceNotFoundException;
import com.smartwallet.neuropay.exception.WalletOperationException;
import com.smartwallet.neuropay.repository.PlanRepository;
import com.smartwallet.neuropay.repository.SubscriptionRepository;
import com.smartwallet.neuropay.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MarketplaceServiceImplTest {

    @Mock
    private PlanRepository planRepository;
    @Mock
    private SubscriptionRepository subscriptionRepository;
    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private WalletService walletService;

    private MarketplaceServiceImpl marketplaceService;
    private User user;
    private Merchant netflix;
    private Plan standardPlan;

    @BeforeEach
    void setUp() {
        marketplaceService = new MarketplaceServiceImpl(planRepository, subscriptionRepository,
                transactionRepository, walletService);
        user = User.builder().id(1L).email("test@example.com").build();
        netflix = Merchant.builder().id(1L).name("Netflix").category("Entertainment").logoEmoji("🎬").build();
        standardPlan = Plan.builder().id(2L).merchant(netflix).name("Standard")
                .price(new BigDecimal("15.49")).currency("USD").billingCycle(BillingCycle.MONTHLY).popular(true).build();
    }

    @Test
    void subscribe_createsANewSubscription_whenTheUserHasNoneForThisMerchant() {
        when(planRepository.findById(2L)).thenReturn(Optional.of(standardPlan));
        when(subscriptionRepository.findByUserIdAndMerchantId(user.getId(), netflix.getId())).thenReturn(Optional.empty());
        when(subscriptionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        SubscriptionResponse response = marketplaceService.subscribe(user, 2L).getData();

        assertThat(response.getMerchantName()).isEqualTo("Netflix");
        assertThat(response.getAmount()).isEqualByComparingTo("15.49");
        assertThat(response.getStatus()).isEqualTo("ACTIVE");
    }

    @Test
    void subscribe_updatesTheExistingSubscription_insteadOfCreatingADuplicate() {
        Subscription existing = Subscription.builder()
                .id(50L).user(user).merchant(netflix)
                .amount(new BigDecimal("6.99")).currency("USD")
                .billingCycle(BillingCycle.MONTHLY).status(SubscriptionStatus.ACTIVE).build();
        when(planRepository.findById(2L)).thenReturn(Optional.of(standardPlan));
        when(subscriptionRepository.findByUserIdAndMerchantId(user.getId(), netflix.getId())).thenReturn(Optional.of(existing));
        when(subscriptionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        SubscriptionResponse response = marketplaceService.subscribe(user, 2L).getData();

        // Same row (id 50), just upgraded — not a second Netflix subscription.
        assertThat(response.getId()).isEqualTo(50L);
        assertThat(response.getAmount()).isEqualByComparingTo("15.49");
        verify(subscriptionRepository, times(1)).save(any());
    }

    @Test
    void subscribe_chargesTheWalletForExactlyThePlanPrice() {
        when(planRepository.findById(2L)).thenReturn(Optional.of(standardPlan));
        when(subscriptionRepository.findByUserIdAndMerchantId(anyLong(), anyLong())).thenReturn(Optional.empty());
        when(subscriptionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        marketplaceService.subscribe(user, 2L);

        verify(walletService).charge(eq(user), eq(new BigDecimal("15.49")), contains("Netflix"));
    }

    @Test
    void subscribe_recordsATransactionForPaymentHistory() {
        when(planRepository.findById(2L)).thenReturn(Optional.of(standardPlan));
        when(subscriptionRepository.findByUserIdAndMerchantId(anyLong(), anyLong())).thenReturn(Optional.empty());
        when(subscriptionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        marketplaceService.subscribe(user, 2L);

        verify(transactionRepository).save(argThat(t ->
                t.getMerchant() == netflix && t.getAmount().compareTo(new BigDecimal("15.49")) == 0));
    }

    @Test
    void subscribe_throwsResourceNotFound_whenThePlanDoesNotExist() {
        when(planRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> marketplaceService.subscribe(user, 999L))
                .isInstanceOf(ResourceNotFoundException.class);

        verifyNoInteractions(walletService, transactionRepository, subscriptionRepository);
    }

    @Test
    void subscribe_neverCreatesASubscriptionOrTransaction_whenTheChargeFails() {
        when(planRepository.findById(2L)).thenReturn(Optional.of(standardPlan));
        when(walletService.charge(any(), any(), anyString()))
                .thenThrow(new WalletOperationException("Insufficient balance."));

        assertThatThrownBy(() -> marketplaceService.subscribe(user, 2L))
                .isInstanceOf(WalletOperationException.class);

        verifyNoInteractions(transactionRepository);
        verify(subscriptionRepository, never()).save(any());
    }
}
