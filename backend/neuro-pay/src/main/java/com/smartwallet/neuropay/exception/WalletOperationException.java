package com.smartwallet.neuropay.exception;

/** Insufficient funds or a frozen wallet blocking a charge — both are the
 * user's problem to fix, not a server error, so this maps to 400. */
public class WalletOperationException extends RuntimeException {
    public WalletOperationException(String message) {
        super(message);
    }
}
