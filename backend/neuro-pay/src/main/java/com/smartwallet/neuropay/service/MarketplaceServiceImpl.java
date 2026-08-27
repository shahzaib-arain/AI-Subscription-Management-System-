package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.dto.response.ApiResponse;
import com.smartwallet.neuropay.dto.response.PlanResponse;
import com.smartwallet.neuropay.dto.response.SubscriptionResponse;
import com.smartwallet.neuropay.entity.Plan;
import com.smartwallet.neuropay.entity.Subscription;
import com.smartwallet.neuropay.entity.Transaction;
import com.smartwallet.neuropay.entity.User;
import com.smartwallet.neuropay.enums.SubscriptionStatus;
import com.smartwallet.neuropay.enums.TransactionSource;
import com.smartwallet.neuropay.exception.ResourceNotFoundException;
import com.smartwallet.neuropay.mapper.SubscriptionMapper;
import com.smartwallet.neuropay.repository.PlanRepository;
import com.smartwallet.neuropay.repository.SubscriptionRepository;
import com.smartwallet.neuropay.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketplaceServiceImpl implements MarketplaceService {

    private final PlanRepository planRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final TransactionRepository transactionRepository;
    private final WalletService walletService;

    @Override
    public ApiResponse<List<PlanResponse>> getPlans() {
        List<PlanResponse> plans = planRepository.findAll().stream()
                .map(this::toPlanResponse)
                .toList();
        return ApiResponse.success("Plans retrieved successfully.", plans);
    }

    @Override
    @Transactional
    public ApiResponse<SubscriptionResponse> subscribe(User user, Long planId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found."));

        String description = plan.getMerchant().getName() + " — " + plan.getName();
        walletService.charge(user, plan.getPrice(), "Subscribed to " + description);

        transactionRepository.save(Transaction.builder()
                .user(user)
                .merchant(plan.getMerchant())
                .amount(plan.getPrice())
                .currency(plan.getCurrency())
                .description(description + " (Marketplace)")
                .transactionDate(LocalDateTime.now())
                .source(TransactionSource.MANUAL)
                .build());

        Subscription subscription = subscriptionRepository
                .findByUserIdAndMerchantId(user.getId(), plan.getMerchant().getId())
                .orElseGet(() -> Subscription.builder().user(user).merchant(plan.getMerchant()).build());

        subscription.setAmount(plan.getPrice());
        subscription.setCurrency(plan.getCurrency());
        subscription.setBillingCycle(plan.getBillingCycle());
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setCategory(plan.getMerchant().getCategory());
        subscription.setNextPaymentDate(LocalDate.now().plusDays(plan.getBillingCycle().lengthInDays()));
        subscription = subscriptionRepository.save(subscription);

        log.info("User {} subscribed to {} for {}", user.getEmail(), description, plan.getPrice());
        return ApiResponse.success("Subscribed successfully.", SubscriptionMapper.toResponse(subscription));
    }

    private PlanResponse toPlanResponse(Plan plan) {
        return PlanResponse.builder()
                .id(plan.getId())
                .merchantName(plan.getMerchant().getName())
                .logoEmoji(plan.getMerchant().getLogoEmoji())
                .category(plan.getMerchant().getCategory())
                .planName(plan.getName())
                .description(plan.getDescription())
                .price(plan.getPrice())
                .currency(plan.getCurrency())
                .billingCycle(plan.getBillingCycle().name())
                .popular(plan.isPopular())
                .build();
    }
}
