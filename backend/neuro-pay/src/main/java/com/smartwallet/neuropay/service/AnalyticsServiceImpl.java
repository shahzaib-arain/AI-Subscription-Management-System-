package com.smartwallet.neuropay.service;

import com.smartwallet.neuropay.dto.response.*;
import com.smartwallet.neuropay.entity.Subscription;
import com.smartwallet.neuropay.entity.Transaction;
import com.smartwallet.neuropay.entity.User;
import com.smartwallet.neuropay.enums.SubscriptionStatus;
import com.smartwallet.neuropay.repository.SubscriptionRepository;
import com.smartwallet.neuropay.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Everything here is derived directly from real Subscription/Transaction
 * rows — the category breakdown and "projected next month" come from
 * currently-active subscriptions, and the monthly trend comes from actual
 * transaction history. No statistical modeling: the "forecast" is exactly
 * what's currently active, since that's what will genuinely renew.
 */
@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private static final int TREND_MONTHS = 3;

    private final SubscriptionRepository subscriptionRepository;
    private final TransactionRepository transactionRepository;
    private final DetectionService detectionService;

    @Override
    @Transactional
    public ApiResponse<SpendAnalyticsResponse> getSpendAnalytics(User user) {
        detectionService.ensureDataForUser(user);

        List<Subscription> subscriptions = subscriptionRepository.findByUserIdOrderByNextPaymentDateAsc(user.getId());
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByTransactionDateDesc(user.getId());

        List<CategorySpend> categoryBreakdown = buildCategoryBreakdown(subscriptions);
        List<MonthlySpend> monthlyTrend = buildMonthlyTrend(transactions);

        BigDecimal projectedNextMonth = categoryBreakdown.stream()
                .map(CategorySpend::getMonthlyAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        SpendAnalyticsResponse response = SpendAnalyticsResponse.builder()
                .categoryBreakdown(categoryBreakdown)
                .monthlyTrend(monthlyTrend)
                .projectedNextMonth(projectedNextMonth.setScale(2, RoundingMode.HALF_UP))
                .build();

        return ApiResponse.success("Analytics retrieved successfully.", response);
    }

    private List<CategorySpend> buildCategoryBreakdown(List<Subscription> subscriptions) {
        Map<String, BigDecimal> totals = new LinkedHashMap<>();
        for (Subscription s : subscriptions) {
            if (s.getStatus() == SubscriptionStatus.ACTIVE || s.getStatus() == SubscriptionStatus.FLAGGED) {
                String category = s.getCategory() != null ? s.getCategory() : "Other";
                totals.merge(category, s.getBillingCycle().toMonthlyEquivalent(s.getAmount()), BigDecimal::add);
            }
        }
        return totals.entrySet().stream()
                .map(e -> CategorySpend.builder()
                        .category(e.getKey())
                        .monthlyAmount(e.getValue().setScale(2, RoundingMode.HALF_UP))
                        .build())
                .sorted(Comparator.comparing(CategorySpend::getMonthlyAmount).reversed())
                .toList();
    }

    private List<MonthlySpend> buildMonthlyTrend(List<Transaction> transactions) {
        Map<YearMonth, BigDecimal> totals = new TreeMap<>();
        YearMonth currentMonth = YearMonth.now();
        for (int i = TREND_MONTHS - 1; i >= 0; i--) {
            totals.put(currentMonth.minusMonths(i), BigDecimal.ZERO);
        }

        for (Transaction t : transactions) {
            YearMonth month = YearMonth.from(t.getTransactionDate());
            totals.computeIfPresent(month, (key, existing) -> existing.add(t.getAmount()));
        }

        return totals.entrySet().stream()
                .map(e -> MonthlySpend.builder()
                        .month(e.getKey().toString())
                        .totalSpend(e.getValue().setScale(2, RoundingMode.HALF_UP))
                        .build())
                .toList();
    }
}
