package com.smartwallet.neuropay.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AlertResponse {
    private Long id;
    private String type;
    private String title;
    private String description;
    private String severity;
    private Long subscriptionId;
    private String subscriptionName;
    private boolean read;
    private LocalDateTime createdAt;
}
