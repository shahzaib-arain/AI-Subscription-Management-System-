package com.smartwallet.neuropay.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MonthlySpend {
    /** "2026-08" — year-month, formatted client-side. */
    private String month;
    private BigDecimal totalSpend;
}
