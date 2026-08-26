package com.smartwallet.neuropay.repository;

import com.smartwallet.neuropay.entity.Merchant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MerchantRepository extends JpaRepository<Merchant, Long> {
    Optional<Merchant> findByNameIgnoreCase(String name);
}
