import { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { ArrowLeft, TrendingUp } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { analyticsApi, SpendAnalyticsData } from "../services/api";
import { categoryColor } from "../utils/subscription";

function formatMonthLabel(month: string): string {
  const [year, monthNum] = month.split("-").map(Number);
  return new Date(year, monthNum - 1, 1).toLocaleDateString("en-US", { month: "short" });
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [data, setData] = useState<SpendAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!token) return;
    setError(null);
    try {
      const res = await analyticsApi.getSummary(token);
      setData(res.data);
    } catch (err: any) {
      setError(err?.message || "Failed to load analytics.");
    }
  };

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [token]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const maxCategory = data ? Math.max(...data.categoryBreakdown.map((c) => c.monthlyAmount), 1) : 1;
  const maxMonthly = data ? Math.max(...data.monthlyTrend.map((m) => m.totalSpend), 1) : 1;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={18} color="#7e828d" />
        </TouchableOpacity>
        <Text style={styles.title}>Spend Analytics</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator color="#14ed9e" size="large" />
        </View>
      ) : error && !data ? (
        <View style={[styles.centerContent, { paddingHorizontal: 32 }]}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={load}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : data ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14ed9e" />}
        >
          {/* Projected next month */}
          <Animated.View entering={FadeInUp.duration(350)} style={styles.heroCard}>
            <View style={styles.heroIconBox}>
              <TrendingUp size={16} color="#0d0e12" />
            </View>
            <Text style={styles.heroLabel}>PROJECTED NEXT MONTH</Text>
            <Text style={styles.heroValue}>${data.projectedNextMonth.toFixed(2)}</Text>
            <Text style={styles.heroCaption}>Based on your currently active subscriptions</Text>
          </Animated.View>

          {/* Category breakdown */}
          <Animated.View entering={FadeInUp.duration(350).delay(80)} style={styles.section}>
            <Text style={styles.sectionTitle}>By Category</Text>
            {data.categoryBreakdown.length === 0 ? (
              <Text style={styles.emptyText}>No active subscriptions yet.</Text>
            ) : (
              <View style={styles.categoryList}>
                {data.categoryBreakdown.map((c) => {
                  const color = categoryColor(c.category);
                  const widthPct = Math.max((c.monthlyAmount / maxCategory) * 100, 4);
                  return (
                    <View key={c.category} style={styles.categoryRow}>
                      <View style={styles.categoryHeader}>
                        <View style={styles.categoryLabelRow}>
                          <View style={[styles.categoryDot, { backgroundColor: color }]} />
                          <Text style={styles.categoryName}>{c.category}</Text>
                        </View>
                        <Text style={styles.categoryAmount}>${c.monthlyAmount.toFixed(2)}</Text>
                      </View>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { width: `${widthPct}%`, backgroundColor: color }]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </Animated.View>

          {/* Monthly trend */}
          <Animated.View entering={FadeInUp.duration(350).delay(160)} style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Trend</Text>
            <View style={styles.trendCard}>
              <View style={styles.trendBars}>
                {data.monthlyTrend.map((m) => {
                  const heightPct = Math.max((m.totalSpend / maxMonthly) * 100, 4);
                  return (
                    <View key={m.month} style={styles.trendBarColumn}>
                      <Text style={styles.trendAmount}>${m.totalSpend.toFixed(0)}</Text>
                      <View style={styles.trendBarTrack}>
                        <View style={[styles.trendBarFill, { height: `${heightPct}%` }]} />
                      </View>
                      <Text style={styles.trendMonthLabel}>{formatMonthLabel(m.month)}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0d0e12" },
  centerContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  backButton: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  title: { color: "#fcfcfc", fontSize: 18, fontFamily: "Manrope_700Bold" },
  errorText: { color: "#7e828d", fontSize: 14, textAlign: "center", marginBottom: 16, fontFamily: "Manrope_500Medium" },
  retryButton: { backgroundColor: "#14ed9e", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryButtonText: { color: "#0d0e12", fontSize: 14, fontFamily: "Manrope_700Bold" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },

  heroCard: {
    backgroundColor: "#15161d",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#22232d",
    marginBottom: 24,
  },
  heroIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#14ed9e", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  heroLabel: { color: "#7e828d", fontSize: 10, fontFamily: "Manrope_800ExtraBold", letterSpacing: 1 },
  heroValue: { color: "#14ed9e", fontSize: 36, fontFamily: "Manrope_800ExtraBold", marginTop: 8 },
  heroCaption: { color: "#7e828d", fontSize: 12, marginTop: 8, fontFamily: "Manrope_400Regular" },

  section: { marginBottom: 28 },
  sectionTitle: { color: "#fcfcfc", fontSize: 15, fontFamily: "Manrope_700Bold", marginBottom: 14 },
  emptyText: { color: "#7e828d", fontSize: 13, fontFamily: "Manrope_400Regular" },

  categoryList: { gap: 16 },
  categoryRow: {},
  categoryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  categoryLabelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },
  categoryName: { color: "#fcfcfc", fontSize: 13, fontFamily: "Manrope_600SemiBold" },
  categoryAmount: { color: "#a7abb5", fontSize: 13, fontFamily: "Manrope_600SemiBold" },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 4 },

  trendCard: { backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 16, padding: 20, paddingTop: 24 },
  trendBars: { flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end", height: 140 },
  trendBarColumn: { alignItems: "center", flex: 1, height: "100%", justifyContent: "flex-end" },
  trendAmount: { color: "#7e828d", fontSize: 11, fontFamily: "Manrope_600SemiBold", marginBottom: 6 },
  trendBarTrack: { width: 28, flex: 1, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.06)", justifyContent: "flex-end", overflow: "hidden" },
  trendBarFill: { width: "100%", backgroundColor: "#14ed9e", borderRadius: 8 },
  trendMonthLabel: { color: "#7e828d", fontSize: 11, fontFamily: "Manrope_500Medium", marginTop: 8 },
});
