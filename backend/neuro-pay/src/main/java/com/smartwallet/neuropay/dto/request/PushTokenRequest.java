package com.smartwallet.neuropay.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PushTokenRequest {
    @NotBlank(message = "Push token is required")
    private String token;
}
