package com.smartwallet.neuropay.controller;

import com.smartwallet.neuropay.dto.request.BudgetCapRequest;
import com.smartwallet.neuropay.dto.request.PushTokenRequest;
import com.smartwallet.neuropay.dto.response.ApiResponse;
import com.smartwallet.neuropay.dto.response.UserSettingsResponse;
import com.smartwallet.neuropay.entity.User;
import com.smartwallet.neuropay.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users/me")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/settings")
    public ApiResponse<UserSettingsResponse> getSettings(@AuthenticationPrincipal User user) {
        return userService.getSettings(user);
    }

    @PutMapping("/budget-cap")
    public ApiResponse<UserSettingsResponse> updateBudgetCap(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BudgetCapRequest request
    ) {
        return userService.updateBudgetCap(user, request);
    }

    @PostMapping("/push-token")
    public ApiResponse<Void> registerPushToken(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody PushTokenRequest request
    ) {
        return userService.registerPushToken(user, request);
    }
}
