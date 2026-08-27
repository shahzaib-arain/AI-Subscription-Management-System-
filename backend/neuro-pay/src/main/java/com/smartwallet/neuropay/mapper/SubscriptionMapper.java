package com.smartwallet.neuropay.mapper;

import com.smartwallet.neuropay.dto.response.SubscriptionResponse;
import com.smartwallet.neuropay.entity.Subscription;

/**
 * The one place a Subscription entity ever becomes a SubscriptionResponse —
 * used by SubscriptionServiceImpl (listing/lifecycle actions) and
 * MarketplaceServiceImpl (after a purchase), so both return identically
 * shaped subscriptions instead of keeping their own copies of this mapping.
 */
public final class SubscriptionMapper {

    private SubscriptionMapper() {
    }

    public static SubscriptionResponse toResponse(Subscription subscription) {
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
