package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class VirtualCardService {

    private final UserRepository userRepository;
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Generates a unique 16-digit virtual card number in format: XXXX-XXXX-XXXX-XXXX
     * Guaranteed unique across all users.
     */
    public String generateUniqueVirtualCardNumber() {
        String cardNumber;
        do {
            cardNumber = generateCardNumber();
        } while (userRepository.existsByVirtualCardNumber(cardNumber));
        return cardNumber;
    }

    private String generateCardNumber() {
        StringBuilder sb = new StringBuilder();
        for (int group = 0; group < 4; group++) {
            for (int digit = 0; digit < 4; digit++) {
                sb.append(RANDOM.nextInt(10));
            }
            if (group < 3) sb.append("-");
        }
        return sb.toString();
    }
}