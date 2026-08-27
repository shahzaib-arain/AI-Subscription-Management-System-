package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.dto.request.DepositRequest;
import com.smartwallet.neuropay.dto.response.ApiResponse;
import com.smartwallet.neuropay.dto.response.WalletResponse;
import com.smartwallet.neuropay.dto.response.WalletTransactionResponse;
import com.smartwallet.neuropay.entity.User;
import com.smartwallet.neuropay.entity.Wallet;
import com.smartwallet.neuropay.entity.WalletTransaction;
import com.smartwallet.neuropay.enums.WalletTransactionType;
import com.smartwallet.neuropay.exception.WalletOperationException;
import com.smartwallet.neuropay.repository.WalletRepository;
import com.smartwallet.neuropay.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletServiceImpl implements WalletService {

    // Sandbox starting balance for this FYP build — there is no real funding
    // source yet, so every new wallet opens with a demo balance instead of zero.
    private static final BigDecimal STARTING_BALANCE = new BigDecimal("500.00");
    private static final String DEFAULT_CURRENCY = "USD";

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    @Override
    @Transactional
    public Wallet createWalletForUser(User user) {
        Wallet wallet = Wallet.builder()
                .user(user)
                .balance(STARTING_BALANCE)
                .currency(DEFAULT_CURRENCY)
                .frozen(false)
                .build();

        Wallet saved = walletRepository.save(wallet);

        recordLedgerEntry(saved, WalletTransactionType.DEPOSIT, STARTING_BALANCE, "Welcome bonus — sandbox starting balance");

        log.info("Wallet created for user {} with starting balance {}", user.getEmail(), STARTING_BALANCE);
        return saved;
    }

    @Override
    public ApiResponse<WalletResponse> getWallet(User user) {
        Wallet wallet = getOrCreateWallet(user);
        return ApiResponse.success("Wallet retrieved successfully.", toWalletResponse(wallet));
    }

    @Override
    @Transactional
    public ApiResponse<WalletResponse> deposit(User user, DepositRequest request) {
        Wallet wallet = getOrCreateWallet(user);

        BigDecimal newBalance = wallet.getBalance().add(request.getAmount());
        wallet.setBalance(newBalance);
        walletRepository.save(wallet);

        recordLedgerEntry(wallet, WalletTransactionType.DEPOSIT, request.getAmount(), "Wallet top-up");

        log.info("User {} deposited {} — new balance {}", user.getEmail(), request.getAmount(), newBalance);
        return ApiResponse.success("Deposit successful.", toWalletResponse(wallet));
    }

    @Override
    @Transactional
    public ApiResponse<WalletResponse> freeze(User user) {
        Wallet wallet = getOrCreateWallet(user);
        wallet.setFrozen(true);
        walletRepository.save(wallet);
        log.info("User {} froze their wallet", user.getEmail());
        return ApiResponse.success("Wallet frozen.", toWalletResponse(wallet));
    }

    @Override
    @Transactional
    public ApiResponse<WalletResponse> unfreeze(User user) {
        Wallet wallet = getOrCreateWallet(user);
        wallet.setFrozen(false);
        walletRepository.save(wallet);
        log.info("User {} unfroze their wallet", user.getEmail());
        return ApiResponse.success("Wallet unfrozen.", toWalletResponse(wallet));
    }

    @Override
    public ApiResponse<List<WalletTransactionResponse>> getTransactions(User user) {
        Wallet wallet = getOrCreateWallet(user);

        List<WalletTransactionResponse> transactions = walletTransactionRepository
                .findTop50ByWalletIdOrderByCreatedAtDesc(wallet.getId())
                .stream()
                .map(this::toTransactionResponse)
                .toList();

        return ApiResponse.success("Transactions retrieved successfully.", transactions);
    }

    @Override
    @Transactional
    public Wallet charge(User user, BigDecimal amount, String description) {
        Wallet wallet = getOrCreateWallet(user);

        if (wallet.isFrozen()) {
            throw new WalletOperationException("Your wallet is frozen. Unfreeze it before making a purchase.");
        }
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new WalletOperationException("Insufficient balance. Add funds to your wallet and try again.");
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        recordLedgerEntry(wallet, WalletTransactionType.CHARGE, amount, description);

        log.info("User {} charged {} — {}", user.getEmail(), amount, description);
        return wallet;
    }

    // --- shared helpers — every public method above routes through these,
    // so wallet lookup and response mapping are each defined exactly once. ---

    private Wallet getOrCreateWallet(User user) {
        return walletRepository.findByUserId(user.getId())
                .orElseGet(() -> createWalletForUser(user));
    }

    private void recordLedgerEntry(Wallet wallet, WalletTransactionType type, BigDecimal amount, String description) {
        WalletTransaction entry = WalletTransaction.builder()
                .wallet(wallet)
                .type(type)
                .amount(amount)
                .balanceAfter(wallet.getBalance())
                .description(description)
                .build();
        walletTransactionRepository.save(entry);
    }

    private WalletResponse toWalletResponse(Wallet wallet) {
        return WalletResponse.builder()
                .id(wallet.getId())
                .balance(wallet.getBalance())
                .currency(wallet.getCurrency())
                .frozen(wallet.isFrozen())
                .updatedAt(wallet.getUpdatedAt())
                .build();
    }

    private WalletTransactionResponse toTransactionResponse(WalletTransaction transaction) {
        return WalletTransactionResponse.builder()
                .id(transaction.getId())
                .type(transaction.getType().name())
                .amount(transaction.getAmount())
                .balanceAfter(transaction.getBalanceAfter())
                .description(transaction.getDescription())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
