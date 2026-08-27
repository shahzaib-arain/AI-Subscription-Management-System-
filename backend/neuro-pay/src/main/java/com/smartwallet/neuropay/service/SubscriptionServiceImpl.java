package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.dto.response.ApiResponse;
import com.smartwallet.neuropay.dto.response.SubscriptionResponse;
import com.smartwallet.neuropay.dto.response.TransactionResponse;
import com.smartwallet.neuropay.entity.Subscription;
import com.smartwallet.neuropay.entity.User;
import com.smartwallet.neuropay.enums.SubscriptionStatus;
import com.smartwallet.neuropay.exception.ResourceNotFoundException;
import com.smartwallet.neuropay.repository.SubscriptionRepository;
import com.smartwallet.neuropay.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final TransactionRepository transactionRepository;
    private final DetectionService detectionService;

    @Override
    @Transactional
    public ApiResponse<List<SubscriptionResponse>> getUserSubscriptions(User user) {
        detectionService.ensureDataForUser(user);

        List<SubscriptionResponse> subscriptions = subscriptionRepository
                .findByUserIdOrderByNextPaymentDateAsc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();

        return ApiResponse.success("Subscriptions retrieved successfully.", subscriptions);
    }

    @Override
    @Transactional
    public ApiResponse<SubscriptionResponse> pauseSubscription(User user, Long subscriptionId) {
        return updateStatus(user, subscriptionId, SubscriptionStatus.PAUSED, "Subscription paused.");
    }

    @Override
    @Transactional
    public ApiResponse<SubscriptionResponse> resumeSubscription(User user, Long subscriptionId) {
        return updateStatus(user, subscriptionId, SubscriptionStatus.ACTIVE, "Subscription resumed.");
    }

    @Override
    @Transactional
    public ApiResponse<SubscriptionResponse> cancelSubscription(User user, Long subscriptionId) {
        return updateStatus(user, subscriptionId, SubscriptionStatus.CANCELLED, "Subscription cancelled.");
    }

    @Override
    public ApiResponse<List<TransactionResponse>> getSubscriptionHistory(User user, Long subscriptionId) {
        Subscription subscription = findOwnedSubscription(user, subscriptionId);
        if (subscription.getMerchant() == null) {
            return ApiResponse.success("Payment history retrieved successfully.", List.of());
        }

        List<TransactionResponse> history = transactionRepository
                .findByUserIdAndMerchantIdOrderByTransactionDateDesc(user.getId(), subscription.getMerchant().getId())
                .stream()
                .map(t -> TransactionResponse.builder()
                        .amount(t.getAmount())
                        .description(t.getDescription())
                        .transactionDate(t.getTransactionDate())
                        .build())
                .toList();

        return ApiResponse.success("Payment history retrieved successfully.", history);
    }

    // --- shared helpers — every status-changing action above routes through
    // these, so ownership checks and response mapping are each written once. ---

    private ApiResponse<SubscriptionResponse> updateStatus(User user, Long subscriptionId, SubscriptionStatus status, String message) {
        Subscription subscription = findOwnedSubscription(user, subscriptionId);
        subscription.setStatus(status);
        subscription = subscriptionRepository.save(subscription);
        return ApiResponse.success(message, toResponse(subscription));
    }

    private Subscription findOwnedSubscription(User user, Long subscriptionId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found."));
        // 404 rather than 403 on a mismatch — don't reveal that a subscription
        // ID belongs to someone else.
        if (!subscription.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Subscription not found.");
        }
        return subscription;
    }

    private SubscriptionResponse toResponse(Subscription subscription) {
        return SubscriptionResponse.builder()
                .id(subscription.getId())
                .merchantName(subscription.getMerchant() != null ? subscription.getMerchant().getName() : "Unknown")
                .logoEmoji(subscription.getMerchant() != null ? subscription.getMerchant().getLogoEmoji() : null)
                .amount(subscription.getAmount())
                .currency(subscription.getCurrency())
                .billingCycle(subscription.getBillingCycle().name())
                .nextPaymentDate(subscription.getNextPaymentDate())
                .status(subscription.getStatus().name())
                .category(subscription.getCategory())
                .build();
    }
}
