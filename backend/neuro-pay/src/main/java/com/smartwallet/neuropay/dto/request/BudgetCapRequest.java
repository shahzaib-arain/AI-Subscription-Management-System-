package com.smartwallet.neuropay.dto.request;

import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BudgetCapRequest {
    // Null clears the cap — budgeting is optional.
    @DecimalMin(value = "0.01", message = "Budget cap must be greater than zero")
    private BigDecimal budgetCap;
}
