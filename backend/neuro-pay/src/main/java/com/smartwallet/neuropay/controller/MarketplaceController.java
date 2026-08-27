package com.smartwallet.neuropay.controller;

import com.smartwallet.neuropay.dto.response.ApiResponse;
import com.smartwallet.neuropay.dto.response.PlanResponse;
import com.smartwallet.neuropay.dto.response.SubscriptionResponse;
import com.smartwallet.neuropay.entity.User;
import com.smartwallet.neuropay.service.MarketplaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/marketplace")
@RequiredArgsConstructor
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    @GetMapping("/plans")
    public ApiResponse<List<PlanResponse>> getPlans() {
        return marketplaceService.getPlans();
    }

    @PostMapping("/plans/{id}/subscribe")
    public ApiResponse<SubscriptionResponse> subscribe(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return marketplaceService.subscribe(user, id);
    }
}
