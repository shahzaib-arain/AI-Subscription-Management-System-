package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.dto.response.AlertResponse;
import com.smartwallet.neuropay.dto.response.ApiResponse;
import com.smartwallet.neuropay.entity.Alert;
import com.smartwallet.neuropay.entity.User;
import com.smartwallet.neuropay.exception.ResourceNotFoundException;
import com.smartwallet.neuropay.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertServiceImpl implements AlertService {

    private final AlertRepository alertRepository;
    private final DetectionService detectionService;

    @Override
    @Transactional
    public ApiResponse<List<AlertResponse>> getUserAlerts(User user) {
        detectionService.ensureDataForUser(user);

        List<AlertResponse> alerts = alertRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();

        return ApiResponse.success("Alerts retrieved successfully.", alerts);
    }

    @Override
    @Transactional
    public ApiResponse<AlertResponse> markAsRead(User user, Long alertId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found."));

        // 404 rather than 403 on a mismatch — don't reveal that an alert ID
        // belongs to someone else.
        if (!alert.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Alert not found.");
        }

        alert.setRead(true);
        alert = alertRepository.save(alert);
        return ApiResponse.success("Alert marked as read.", toResponse(alert));
    }

    private AlertResponse toResponse(Alert alert) {
        return AlertResponse.builder()
                .id(alert.getId())
                .type(alert.getType().name())
                .title(alert.getTitle())
                .description(alert.getDescription())
                .severity(alert.getSeverity().name())
                .subscriptionId(alert.getSubscription() != null ? alert.getSubscription().getId() : null)
                .subscriptionName(alert.getSubscription() != null && alert.getSubscription().getMerchant() != null
                        ? alert.getSubscription().getMerchant().getName()
                        : null)
                .read(alert.isRead())
                .createdAt(alert.getCreatedAt())
                .build();
    }
}
