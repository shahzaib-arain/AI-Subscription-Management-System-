package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.entity.Merchant;
import com.smartwallet.neuropay.entity.Transaction;
import com.smartwallet.neuropay.entity.User;
import com.smartwallet.neuropay.enums.TransactionSource;
import com.smartwallet.neuropay.repository.MerchantRepository;
import com.smartwallet.neuropay.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Stands in for a real bank/card transaction feed, which doesn't exist yet.
 * Generates a believable transaction history once per user so DetectionService
 * has real rows to find patterns in. Every row is tagged SIMULATED so it's
 * never confused with real data once an actual feed exists.
 */
@Service
@RequiredArgsConstructor
public class TransactionSeederService {

    private final TransactionRepository transactionRepository;
    private final MerchantRepository merchantRepository;

    public void seedTransactionsForUser(User user) {
        LocalDateTime now = LocalDateTime.now();
        List<Transaction> rows = new ArrayList<>();

        // Established recurring merchants — steady monthly charges going back ~3 months.
        rows.addAll(recurringSeries(user, now, "Netflix", "🎬", "Entertainment", "15.99", 4, 30, 3));
        rows.addAll(recurringSeries(user, now, "Spotify", "🎵", "Music", "9.99", 4, 30, 1));
        rows.addAll(recurringSeries(user, now, "AWS", "☁️", "Cloud", "124.50", 4, 30, 0));

        // A merchant that just raised its price on the most recent charge.
        rows.addAll(priceIncreaseSeries(user, now, "Adobe CC", "🎨", "Design", "49.99", "54.99", 30, 3));

        // A pattern that only started recently — should read as "newly detected."
        rows.addAll(recurringSeries(user, now, "ChatGPT Plus", "🤖", "AI Tools", "20.00", 2, 30, 5));

        // A subscription nobody has been charged for in a while — should read as "unused."
        rows.addAll(recurringSeries(user, now, "Figma", "✏️", "Design", "15.00", 4, 30, 50));

        // A single unrecognized charge that never repeats — should read as suspicious.
        Merchant unknown = getOrCreateMerchant("XZMedia", null, null);
        rows.add(buildTransaction(user, unknown, "29.99", "XZMedia*ONETIME", now.minusHours(5)));

        transactionRepository.saveAll(rows);
    }

    /** @param mostRecentOffsetDays how many days ago the newest charge in this series landed */
    private List<Transaction> recurringSeries(User user, LocalDateTime now, String merchantName, String emoji,
                                               String category, String amount, int occurrences, int intervalDays,
                                               int mostRecentOffsetDays) {
        Merchant merchant = getOrCreateMerchant(merchantName, emoji, category);
        List<Transaction> rows = new ArrayList<>();
        for (int i = 0; i < occurrences; i++) {
            LocalDateTime date = now.minusDays(mostRecentOffsetDays + (long) i * intervalDays);
            rows.add(buildTransaction(user, merchant, amount, merchantDescription(merchantName, date), date));
        }
        return rows;
    }

    private List<Transaction> priceIncreaseSeries(User user, LocalDateTime now, String merchantName, String emoji,
                                                   String category, String oldAmount, String newAmount,
                                                   int intervalDays, int oldOccurrences) {
        Merchant merchant = getOrCreateMerchant(merchantName, emoji, category);
        List<Transaction> rows = new ArrayList<>();
        LocalDateTime latestDate = now.minusDays(2);
        rows.add(buildTransaction(user, merchant, newAmount, merchantDescription(merchantName, latestDate), latestDate));
        for (int i = 1; i <= oldOccurrences; i++) {
            LocalDateTime date = now.minusDays(2 + (long) i * intervalDays);
            rows.add(buildTransaction(user, merchant, oldAmount, merchantDescription(merchantName, date), date));
        }
        return rows;
    }

    private Transaction buildTransaction(User user, Merchant merchant, String amount, String description, LocalDateTime date) {
        return Transaction.builder()
                .user(user)
                .merchant(merchant)
                .amount(new BigDecimal(amount))
                .currency("USD")
                .description(description)
                .transactionDate(date)
                .source(TransactionSource.SIMULATED)
                .build();
    }

    private String merchantDescription(String merchantName, LocalDateTime date) {
        return merchantName.toUpperCase().replace(" ", "") + "*" + (1000 + date.getDayOfYear());
    }

    private Merchant getOrCreateMerchant(String name, String emoji, String category) {
        return merchantRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> merchantRepository.save(
                        Merchant.builder().name(name).logoEmoji(emoji).category(category).build()));
    }
}
