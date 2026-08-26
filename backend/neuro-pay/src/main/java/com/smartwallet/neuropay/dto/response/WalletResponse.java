package com.smartwallet.neuropay.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WalletResponse {
    private Long id;
    private BigDecimal balance;
    private String currency;
    private boolean frozen;
    private LocalDateTime updatedAt;
}
