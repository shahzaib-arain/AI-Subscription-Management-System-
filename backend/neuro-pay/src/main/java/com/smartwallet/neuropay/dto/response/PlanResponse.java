package com.smartwallet.neuropay.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PlanResponse {
    private Long id;
    private String merchantName;
    private String logoEmoji;
    private String category;
    private String planName;
    private String description;
    private BigDecimal price;
    private String currency;
    private String billingCycle;
    private boolean popular;
}
