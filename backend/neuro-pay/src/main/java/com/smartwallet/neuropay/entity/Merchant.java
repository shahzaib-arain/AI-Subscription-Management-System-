package com.smartwallet.neuropay.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * A recognized biller (Netflix, Spotify, ChatGPT Plus, ...). Populated as
 * transactions get matched to a known name; the detection and marketplace
 * work in later phases both read from this table instead of re-deriving
 * merchant identity from raw transaction text every time.
 */
@Entity
@Table(name = "merchants")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Merchant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String category;

    /** Matches the emoji-as-logo convention already used on the frontend. */
    private String logoEmoji;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
