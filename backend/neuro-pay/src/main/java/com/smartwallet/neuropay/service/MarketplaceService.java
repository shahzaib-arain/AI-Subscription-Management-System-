package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.dto.response.ApiResponse;
import com.smartwallet.neuropay.dto.response.PlanResponse;
import com.smartwallet.neuropay.dto.response.SubscriptionResponse;
import com.smartwallet.neuropay.entity.User;

import java.util.List;

public interface MarketplaceService {
    ApiResponse<List<PlanResponse>> getPlans();

    /** Debits the wallet for the plan's price and activates/updates the matching subscription. */
    ApiResponse<SubscriptionResponse> subscribe(User user, Long planId);
}
