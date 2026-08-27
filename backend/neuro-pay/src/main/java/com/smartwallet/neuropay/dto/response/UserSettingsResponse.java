package com.smartwallet.neuropay.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserSettingsResponse {
    private BigDecimal budgetCap;
    private boolean pushNotificationsEnabled;
}
