package com.smartwallet.neuropay.controller;

import com.smartwallet.neuropay.dto.request.DepositRequest;
import com.smartwallet.neuropay.dto.response.ApiResponse;
import com.smartwallet.neuropay.dto.response.WalletResponse;
import com.smartwallet.neuropay.dto.response.WalletTransactionResponse;
import com.smartwallet.neuropay.entity.User;
import com.smartwallet.neuropay.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * All routes here require a valid JWT — SecurityConfig only whitelists
 * /auth/**, so anything under /wallet is authenticated by default.
 */
@RestController
@RequestMapping("/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping
    public ApiResponse<WalletResponse> getWallet(@AuthenticationPrincipal User user) {
        return walletService.getWallet(user);
    }

    @PostMapping("/deposit")
    public ApiResponse<WalletResponse> deposit(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody DepositRequest request
    ) {
        return walletService.deposit(user, request);
    }

    @PostMapping("/freeze")
    public ApiResponse<WalletResponse> freeze(@AuthenticationPrincipal User user) {
        return walletService.freeze(user);
    }

    @PostMapping("/unfreeze")
    public ApiResponse<WalletResponse> unfreeze(@AuthenticationPrincipal User user) {
        return walletService.unfreeze(user);
    }

    @GetMapping("/transactions")
    public ApiResponse<List<WalletTransactionResponse>> getTransactions(@AuthenticationPrincipal User user) {
        return walletService.getTransactions(user);
    }
}
