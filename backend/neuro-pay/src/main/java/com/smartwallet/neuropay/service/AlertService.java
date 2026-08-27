package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.dto.response.AlertResponse;
import com.smartwallet.neuropay.dto.response.ApiResponse;
import com.smartwallet.neuropay.entity.User;

import java.util.List;

public interface AlertService {
    ApiResponse<List<AlertResponse>> getUserAlerts(User user);
    ApiResponse<AlertResponse> markAsRead(User user, Long alertId);
}
