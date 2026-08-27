package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.dto.request.BudgetCapRequest;
import com.smartwallet.neuropay.dto.request.PushTokenRequest;
import com.smartwallet.neuropay.dto.response.ApiResponse;
import com.smartwallet.neuropay.dto.response.UserSettingsResponse;
import com.smartwallet.neuropay.entity.User;
import com.smartwallet.neuropay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public ApiResponse<UserSettingsResponse> getSettings(User user) {
        return ApiResponse.success("Settings retrieved successfully.", toResponse(user));
    }

    @Override
    @Transactional
    public ApiResponse<UserSettingsResponse> updateBudgetCap(User user, BudgetCapRequest request) {
        user.setBudgetCap(request.getBudgetCap());
        user = userRepository.save(user);
        String message = request.getBudgetCap() == null ? "Budget cap removed." : "Budget cap updated.";
        return ApiResponse.success(message, toResponse(user));
    }

    @Override
    @Transactional
    public ApiResponse<Void> registerPushToken(User user, PushTokenRequest request) {
        user.setPushToken(request.getToken());
        userRepository.save(user);
        return ApiResponse.success("Push notifications enabled.");
    }

    private UserSettingsResponse toResponse(User user) {
        return UserSettingsResponse.builder()
                .budgetCap(user.getBudgetCap())
                .pushNotificationsEnabled(user.getPushToken() != null && !user.getPushToken().isBlank())
                .build();
    }
}
