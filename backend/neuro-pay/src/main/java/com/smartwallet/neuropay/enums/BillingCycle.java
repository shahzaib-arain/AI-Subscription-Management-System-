package com.smartwallet.neuropay.enums;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Billing-cycle math lives here, once, instead of being re-derived in every
 * service that needs "how many days is this" or "what's this per month" —
 * DetectionService, BudgetCapService, MarketplaceService, and
 * AnalyticsService all call these instead of keeping their own copies.
 */
public enum BillingCycle {
    WEEKLY(7),
    MONTHLY(30),
    YEARLY(365);

    private final int lengthInDays;

    BillingCycle(int lengthInDays) {
        this.lengthInDays = lengthInDays;
    }

    public int lengthInDays() {
        return lengthInDays;
    }

    public BigDecimal toMonthlyEquivalent(BigDecimal amount) {
        return switch (this) {
            case WEEKLY -> amount.multiply(BigDecimal.valueOf(52)).divide(BigDecimal.valueOf(12), 4, RoundingMode.HALF_UP);
            case MONTHLY -> amount;
            case YEARLY -> amount.divide(BigDecimal.valueOf(12), 4, RoundingMode.HALF_UP);
        };
    }
}
