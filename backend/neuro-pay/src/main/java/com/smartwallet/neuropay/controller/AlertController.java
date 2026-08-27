package com.smartwallet.neuropay.controller;

import com.smartwallet.neuropay.dto.response.AlertResponse;
import com.smartwallet.neuropay.dto.response.ApiResponse;
import com.smartwallet.neuropay.entity.User;
import com.smartwallet.neuropay.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    public ApiResponse<List<AlertResponse>> getAlerts(@AuthenticationPrincipal User user) {
        return alertService.getUserAlerts(user);
    }

    @PatchMapping("/{id}/read")
    public ApiResponse<AlertResponse> markRead(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return alertService.markAsRead(user, id);
    }
}
