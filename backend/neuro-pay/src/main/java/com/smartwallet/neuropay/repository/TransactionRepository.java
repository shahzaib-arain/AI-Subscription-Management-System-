package com.smartwallet.neuropay.repository;

import com.smartwallet.neuropay.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserIdOrderByTransactionDateDesc(Long userId);
    List<Transaction> findByUserIdAndMerchantIdOrderByTransactionDateDesc(Long userId, Long merchantId);
}
