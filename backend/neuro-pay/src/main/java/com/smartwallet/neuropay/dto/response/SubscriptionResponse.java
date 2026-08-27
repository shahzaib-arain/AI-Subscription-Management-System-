package com.smartwallet.neuropay.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SubscriptionResponse {
    private Long id;
    private String merchantName;
    private String logoEmoji;
    private BigDecimal amount;
    private String currency;
    private String billingCycle;
    private LocalDate nextPaymentDate;
    private String status;
    private String category;
}
