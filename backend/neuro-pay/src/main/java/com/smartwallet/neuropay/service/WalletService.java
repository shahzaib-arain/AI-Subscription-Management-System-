package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.dto.request.DepositRequest;
import com.smartwallet.neuropay.dto.response.ApiResponse;
import com.smartwallet.neuropay.dto.response.WalletResponse;
import com.smartwallet.neuropay.dto.response.WalletTransactionResponse;
import com.smartwallet.neuropay.entity.User;
import com.smartwallet.neuropay.entity.Wallet;

import java.util.List;

public interface WalletService {

    /** Called once, at sign-up, so every user has a wallet from day one. */
    Wallet createWalletForUser(User user);

    ApiResponse<WalletResponse> getWallet(User user);

    ApiResponse<WalletResponse> deposit(User user, DepositRequest request);

    ApiResponse<WalletResponse> freeze(User user);

    ApiResponse<WalletResponse> unfreeze(User user);

    ApiResponse<List<WalletTransactionResponse>> getTransactions(User user);
}
