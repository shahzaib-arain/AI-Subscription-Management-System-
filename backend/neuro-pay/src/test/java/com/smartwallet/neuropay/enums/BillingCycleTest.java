package com.smartwallet.neuropay.enums;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class BillingCycleTest {

    @Test
    void lengthInDays_matchesEachCycle() {
        assertThat(BillingCycle.WEEKLY.lengthInDays()).isEqualTo(7);
        assertThat(BillingCycle.MONTHLY.lengthInDays()).isEqualTo(30);
        assertThat(BillingCycle.YEARLY.lengthInDays()).isEqualTo(365);
    }

    @Test
    void toMonthlyEquivalent_monthlyIsUnchanged() {
        assertThat(BillingCycle.MONTHLY.toMonthlyEquivalent(new BigDecimal("15.99")))
                .isEqualByComparingTo("15.99");
    }

    @Test
    void toMonthlyEquivalent_yearlyDividesByTwelve() {
        // $120/yr should read as $10/mo
        assertThat(BillingCycle.YEARLY.toMonthlyEquivalent(new BigDecimal("120")))
                .isEqualByComparingTo("10");
    }

    @Test
    void toMonthlyEquivalent_weeklyScalesUpByAverageWeeksPerMonth() {
        // $10/wk * 52 weeks / 12 months ≈ $43.33/mo
        assertThat(BillingCycle.WEEKLY.toMonthlyEquivalent(new BigDecimal("10")))
                .isEqualByComparingTo("43.3333");
    }
}
