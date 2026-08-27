package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.dto.response.ApiResponse;
import com.smartwallet.neuropay.dto.response.SpendAnalyticsResponse;
import com.smartwallet.neuropay.entity.User;

public interface AnalyticsService {
    ApiResponse<SpendAnalyticsResponse> getSpendAnalytics(User user);
}
