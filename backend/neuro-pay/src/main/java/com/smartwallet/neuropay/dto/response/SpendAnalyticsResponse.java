package com.smartwallet.neuropay.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SpendAnalyticsResponse {
    private List<CategorySpend> categoryBreakdown;
    private List<MonthlySpend> monthlyTrend;
    /** Sum of currently-active monthly-equivalent spend — a direct projection, not a statistical forecast. */
    private BigDecimal projectedNextMonth;
}
