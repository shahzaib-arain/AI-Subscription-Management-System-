package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.entity.Alert;
import com.smartwallet.neuropay.entity.Subscription;
import com.smartwallet.neuropay.entity.User;
import com.smartwallet.neuropay.enums.AlertSeverity;
import com.smartwallet.neuropay.enums.AlertType;
import com.smartwallet.neuropay.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * The single place an Alert ever gets created — whether it comes from the
 * detection engine, a budget-cap breach, or anything added later. Creating
 * one here means it's saved, pushed to the user's device (if registered),
 * and emailed for anything urgent enough to warrant it — every caller gets
 * all three for free instead of re-implementing delivery per feature.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AlertPublisherService {

    private final AlertRepository alertRepository;
    private final PushNotificationService pushNotificationService;
    private final MailService mailService;

    public Alert publish(User user, Subscription subscription, AlertType type, AlertSeverity severity,
                          String title, String description) {
        Alert alert = alertRepository.save(Alert.builder()
                .user(user)
                .subscription(subscription)
                .type(type)
                .severity(severity)
                .title(title)
                .description(description)
                .read(false)
                .build());

        pushNotificationService.notifyUser(user, title, description);

        // Email is reserved for the alerts worth interrupting someone's inbox
        // for — everything still lands in the in-app feed and as a push
        // regardless of severity.
        if (severity == AlertSeverity.HIGH) {
            mailService.sendAlertEmail(user.getEmail(), user.getFullName(), title, description);
        }

        return alert;
    }
}
