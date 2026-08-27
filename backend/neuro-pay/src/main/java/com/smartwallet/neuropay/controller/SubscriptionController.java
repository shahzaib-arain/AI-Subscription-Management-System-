package com.smartwallet.neuropay.controller;

import com.smartwallet.neuropay.dto.response.ApiResponse;
import com.smartwallet.neuropay.dto.response.SubscriptionResponse;
import com.smartwallet.neuropay.dto.response.TransactionResponse;
import com.smartwallet.neuropay.entity.User;
import com.smartwallet.neuropay.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping
    public ApiResponse<List<SubscriptionResponse>> getSubscriptions(@AuthenticationPrincipal User user) {
        return subscriptionService.getUserSubscriptions(user);
    }

    @PatchMapping("/{id}/pause")
    public ApiResponse<SubscriptionResponse> pause(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return subscriptionService.pauseSubscription(user, id);
    }

    @PatchMapping("/{id}/resume")
    public ApiResponse<SubscriptionResponse> resume(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return subscriptionService.resumeSubscription(user, id);
    }

    @PatchMapping("/{id}/cancel")
    public ApiResponse<SubscriptionResponse> cancel(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return subscriptionService.cancelSubscription(user, id);
    }

    @GetMapping("/{id}/history")
    public ApiResponse<List<TransactionResponse>> history(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return subscriptionService.getSubscriptionHistory(user, id);
    }
}
