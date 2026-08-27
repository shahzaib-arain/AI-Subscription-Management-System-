package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.dto.request.BudgetCapRequest;
import com.smartwallet.neuropay.dto.request.PushTokenRequest;
import com.smartwallet.neuropay.dto.response.ApiResponse;
import com.smartwallet.neuropay.dto.response.UserSettingsResponse;
import com.smartwallet.neuropay.entity.User;

public interface UserService {
    ApiResponse<UserSettingsResponse> getSettings(User user);
    ApiResponse<UserSettingsResponse> updateBudgetCap(User user, BudgetCapRequest request);
    ApiResponse<Void> registerPushToken(User user, PushTokenRequest request);
}
