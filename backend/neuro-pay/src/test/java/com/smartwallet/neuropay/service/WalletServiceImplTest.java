package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.dto.request.DepositRequest;
import com.smartwallet.neuropay.dto.response.WalletResponse;
import com.smartwallet.neuropay.entity.User;
import com.smartwallet.neuropay.entity.Wallet;
import com.smartwallet.neuropay.enums.WalletTransactionType;
import com.smartwallet.neuropay.exception.WalletOperationException;
import com.smartwallet.neuropay.repository.WalletRepository;
import com.smartwallet.neuropay.repository.WalletTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalletServiceImplTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private WalletTransactionRepository walletTransactionRepository;

    private WalletServiceImpl walletService;
    private User user;

    @BeforeEach
    void setUp() {
        walletService = new WalletServiceImpl(walletRepository, walletTransactionRepository);
        user = User.builder().id(1L).email("test@example.com").build();
    }

    @Test
    void createWalletForUser_startsAtSandboxBalance_andRecordsAWelcomeLedgerEntry() {
        when(walletRepository.save(any(Wallet.class))).thenAnswer(inv -> inv.getArgument(0));

        Wallet wallet = walletService.createWalletForUser(user);

        assertThat(wallet.getBalance()).isEqualByComparingTo("500.00");
        assertThat(wallet.isFrozen()).isFalse();
        verify(walletTransactionRepository).save(argThat(entry ->
                entry.getType() == WalletTransactionType.DEPOSIT
                        && entry.getAmount().compareTo(new BigDecimal("500.00")) == 0));
    }

    @Test
    void deposit_addsToBalance_andRecordsADepositLedgerEntry() {
        Wallet wallet = Wallet.builder().id(10L).user(user).balance(new BigDecimal("100.00")).frozen(false).build();
        when(walletRepository.findByUserId(user.getId())).thenReturn(Optional.of(wallet));

        DepositRequest request = new DepositRequest();
        request.setAmount(new BigDecimal("50.00"));

        WalletResponse response = walletService.deposit(user, request).getData();

        assertThat(response.getBalance()).isEqualByComparingTo("150.00");
        verify(walletTransactionRepository).save(argThat(entry ->
                entry.getType() == WalletTransactionType.DEPOSIT
                        && entry.getAmount().compareTo(new BigDecimal("50.00")) == 0
                        && entry.getBalanceAfter().compareTo(new BigDecimal("150.00")) == 0));
    }

    @Test
    void charge_deductsBalance_whenFundsAreSufficientAndWalletIsNotFrozen() {
        Wallet wallet = Wallet.builder().id(10L).user(user).balance(new BigDecimal("100.00")).frozen(false).build();
        when(walletRepository.findByUserId(user.getId())).thenReturn(Optional.of(wallet));

        Wallet result = walletService.charge(user, new BigDecimal("15.49"), "Subscribed to Netflix — Standard");

        assertThat(result.getBalance()).isEqualByComparingTo("84.51");
        verify(walletTransactionRepository).save(argThat(entry ->
                entry.getType() == WalletTransactionType.CHARGE
                        && entry.getAmount().compareTo(new BigDecimal("15.49")) == 0));
    }

    @Test
    void charge_throwsAndLeavesBalanceUntouched_whenWalletIsFrozen() {
        Wallet wallet = Wallet.builder().id(10L).user(user).balance(new BigDecimal("100.00")).frozen(true).build();
        when(walletRepository.findByUserId(user.getId())).thenReturn(Optional.of(wallet));

        assertThatThrownBy(() -> walletService.charge(user, new BigDecimal("10.00"), "test"))
                .isInstanceOf(WalletOperationException.class)
                .hasMessageContaining("frozen");

        assertThat(wallet.getBalance()).isEqualByComparingTo("100.00");
        verify(walletRepository, never()).save(any());
        verify(walletTransactionRepository, never()).save(any());
    }

    @Test
    void charge_throwsAndLeavesBalanceUntouched_whenBalanceIsInsufficient() {
        Wallet wallet = Wallet.builder().id(10L).user(user).balance(new BigDecimal("5.00")).frozen(false).build();
        when(walletRepository.findByUserId(user.getId())).thenReturn(Optional.of(wallet));

        assertThatThrownBy(() -> walletService.charge(user, new BigDecimal("200.00"), "ChatGPT Pro"))
                .isInstanceOf(WalletOperationException.class)
                .hasMessageContaining("Insufficient");

        assertThat(wallet.getBalance()).isEqualByComparingTo("5.00");
        verify(walletTransactionRepository, never()).save(any());
    }

    @Test
    void charge_succeedsExactlyAtTheBalanceBoundary() {
        // Spending exactly what's available should be allowed, not treated as insufficient.
        Wallet wallet = Wallet.builder().id(10L).user(user).balance(new BigDecimal("20.00")).frozen(false).build();
        when(walletRepository.findByUserId(user.getId())).thenReturn(Optional.of(wallet));

        Wallet result = walletService.charge(user, new BigDecimal("20.00"), "exact balance");

        assertThat(result.getBalance()).isEqualByComparingTo("0.00");
    }
}
