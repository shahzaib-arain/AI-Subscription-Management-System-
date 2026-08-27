package com.smartwallet.neuropay.repository;

import com.smartwallet.neuropay.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByUserIdOrderByNextPaymentDateAsc(Long userId);
    Optional<Subscription> findByUserIdAndMerchantId(Long userId, Long merchantId);
}
