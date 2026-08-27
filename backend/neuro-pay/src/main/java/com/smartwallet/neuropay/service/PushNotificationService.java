package com.smartwallet.neuropay.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartwallet.neuropay.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

/**
 * Sends push notifications through Expo's push service. An Expo push token
 * is issued to one specific installed app on one specific device — there is
 * no way to confirm actual on-device delivery from the backend, so this only
 * guarantees the request reaching Expo's servers is correctly formed; Expo
 * owns the last mile to the device.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PushNotificationService {

    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    public void notifyUser(User user, String title, String body) {
        String token = user.getPushToken();
        if (token == null || token.isBlank()) {
            return;
        }

        try {
            String payload = objectMapper.writeValueAsString(Map.of(
                    "to", token,
                    "title", title,
                    "body", body,
                    "sound", "default"
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(EXPO_PUSH_URL))
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .timeout(Duration.ofSeconds(5))
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            log.info("Expo push to user {} — status {}: {}", user.getEmail(), response.statusCode(), response.body());
        } catch (Exception e) {
            // A failed push must never break the request that triggered it.
            log.warn("Failed to send push notification to user {}: {}", user.getEmail(), e.getMessage());
        }
    }
}
