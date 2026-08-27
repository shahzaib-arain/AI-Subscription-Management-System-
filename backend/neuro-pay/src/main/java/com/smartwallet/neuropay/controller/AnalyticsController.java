package com.smartwallet.neuropay.controller;

import com.smartwallet.neuropay.dto.response.ApiResponse;
import com.smartwallet.neuropay.dto.response.SpendAnalyticsResponse;
import com.smartwallet.neuropay.entity.User;
import com.smartwallet.neuropay.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ApiResponse<SpendAnalyticsResponse> getSummary(@AuthenticationPrincipal User user) {
        return analyticsService.getSpendAnalytics(user);
    }
}
