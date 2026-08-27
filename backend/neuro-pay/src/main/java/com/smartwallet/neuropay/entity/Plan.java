package com.smartwallet.neuropay.entity;

import com.smartwallet.neuropay.enums.BillingCycle;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * A purchasable tier offered by a Merchant (e.g. Netflix "Premium") — the
 * marketplace catalog. Distinct from Subscription: a Plan is a product
 * anyone can buy; a Subscription is one specific user's actual recurring
 * charge, created the moment they subscribe to a Plan.
 */
@Entity
@Table(name = "plans")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merchant_id", nullable = false)
    private Merchant merchant;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(30)")
    private BillingCycle billingCycle;

    /** Marks the recommended tier for a merchant, shown with a badge in the UI. */
    @Column(nullable = false)
    private boolean popular;
}
