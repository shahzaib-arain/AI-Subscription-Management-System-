package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.entity.Merchant;
import com.smartwallet.neuropay.repository.MerchantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * The one place a Merchant ever gets looked up or created — used by both
 * TransactionSeederService (synthetic transaction history) and
 * PlanSeederService (marketplace catalog), so a merchant like "Netflix"
 * resolves to the same row no matter which seeder touches it first.
 */
@Service
@RequiredArgsConstructor
public class MerchantService {

    private final MerchantRepository merchantRepository;

    public Merchant getOrCreate(String name, String logoEmoji, String category) {
        return merchantRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> merchantRepository.save(
                        Merchant.builder().name(name).logoEmoji(logoEmoji).category(category).build()));
    }
}
