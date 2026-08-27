package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.dto.response.ApiResponse;
import com.smartwallet.neuropay.dto.response.SubscriptionResponse;
import com.smartwallet.neuropay.dto.response.TransactionResponse;
import com.smartwallet.neuropay.entity.User;

import java.util.List;

public interface SubscriptionService {
    ApiResponse<List<SubscriptionResponse>> getUserSubscriptions(User user);
    ApiResponse<SubscriptionResponse> pauseSubscription(User user, Long subscriptionId);
    ApiResponse<SubscriptionResponse> resumeSubscription(User user, Long subscriptionId);
    ApiResponse<SubscriptionResponse> cancelSubscription(User user, Long subscriptionId);
    ApiResponse<List<TransactionResponse>> getSubscriptionHistory(User user, Long subscriptionId);
}
