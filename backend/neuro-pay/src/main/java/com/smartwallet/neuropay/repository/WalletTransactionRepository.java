package com.smartwallet.neuropay.repository;

import com.smartwallet.neuropay.entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    List<WalletTransaction> findTop50ByWalletIdOrderByCreatedAtDesc(Long walletId);
}
