package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.entity.Merchant;
import com.smartwallet.neuropay.entity.Plan;
import com.smartwallet.neuropay.enums.BillingCycle;
import com.smartwallet.neuropay.repository.PlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Seeds the marketplace catalog once, globally — unlike TransactionSeederService
 * (per-user transaction history), this data is the same for every user, so it
 * only ever runs if the plans table is still empty.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PlanSeederService {

    private final PlanRepository planRepository;
    private final MerchantService merchantService;

    private record Tier(String name, String description, String price, boolean popular) {
    }

    @Transactional
    public void seedCatalogIfEmpty() {
        if (planRepository.count() > 0) {
            return;
        }

        List<Plan> plans = new ArrayList<>();
        plans.addAll(tiersFor("Netflix", "🎬", "Entertainment", BillingCycle.MONTHLY, List.of(
                new Tier("Basic", "1 screen · 720p", "6.99", false),
                new Tier("Standard", "2 screens · 1080p", "15.49", true),
                new Tier("Premium", "4 screens · 4K Ultra HD", "22.99", false)
        )));
        plans.addAll(tiersFor("Spotify", "🎵", "Music", BillingCycle.MONTHLY, List.of(
                new Tier("Individual", "1 account · ad-free", "10.99", false),
                new Tier("Duo", "2 accounts · ad-free", "14.99", false),
                new Tier("Family", "Up to 6 accounts", "16.99", true)
        )));
        plans.addAll(tiersFor("ChatGPT", "🤖", "AI Tools", BillingCycle.MONTHLY, List.of(
                new Tier("Plus", "Faster responses · priority access", "20.00", true),
                new Tier("Pro", "Unlimited advanced usage", "200.00", false)
        )));
        plans.addAll(tiersFor("Gemini", "✨", "AI Tools", BillingCycle.MONTHLY, List.of(
                new Tier("Google AI Pro", "2TB storage · advanced Gemini models", "19.99", true)
        )));
        plans.addAll(tiersFor("iCloud+", "🍎", "Storage", BillingCycle.MONTHLY, List.of(
                new Tier("50GB", "Basic cloud storage", "0.99", false),
                new Tier("200GB", "Share with family", "2.99", true),
                new Tier("2TB", "For power users", "9.99", false)
        )));
        plans.addAll(tiersFor("Google One", "📦", "Storage", BillingCycle.MONTHLY, List.of(
                new Tier("Basic", "100GB storage", "1.99", true),
                new Tier("Premium", "2TB storage + VPN", "9.99", false)
        )));

        planRepository.saveAll(plans);
        log.info("Marketplace catalog seeded with {} plans", plans.size());
    }

    private List<Plan> tiersFor(String merchantName, String emoji, String category, BillingCycle cycle, List<Tier> tiers) {
        Merchant merchant = merchantService.getOrCreate(merchantName, emoji, category);
        List<Plan> plans = new ArrayList<>();
        for (Tier tier : tiers) {
            plans.add(Plan.builder()
                    .merchant(merchant)
                    .name(tier.name())
                    .description(tier.description())
                    .price(new BigDecimal(tier.price()))
                    .currency("USD")
                    .billingCycle(cycle)
                    .popular(tier.popular())
                    .build());
        }
        return plans;
    }
}
