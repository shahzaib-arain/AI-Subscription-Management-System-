package com.smartwallet.neuropay.enums;

/**
 * Where a raw transaction row came from. SIMULATED marks the synthetic feed
 * standing in for a real bank connection until one exists; MANUAL is for
 * anything entered directly (e.g. by an admin or test tooling).
 */
public enum TransactionSource {
    SIMULATED,
    MANUAL
}
