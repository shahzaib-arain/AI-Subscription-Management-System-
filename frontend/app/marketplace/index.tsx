import { useState, useEffect, useMemo } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { ArrowLeft, ChevronRight } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { marketplaceApi, PlanData } from "../../services/api";
import { FALLBACK_MERCHANT_EMOJI } from "../../utils/subscription";

interface MerchantGroup {
  merchantName: string;
  logoEmoji: string | null;
  category: string | null;
  minPrice: number;
  planCount: number;
}

export default function MarketplacePage() {
  const router = useRouter();
  const { token } = useAuth();
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!token) return;
    setError(null);
    try {
      const res = await marketplaceApi.getPlans(token);
      setPlans(res.data);
    } catch (err: any) {
      setError(err?.message || "Failed to load the marketplace.");
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

  const merchants: MerchantGroup[] = useMemo(() => {
    const groups = new Map<string, MerchantGroup>();
    for (const plan of plans) {
      const existing = groups.get(plan.merchantName);
      if (existing) {
        existing.minPrice = Math.min(existing.minPrice, plan.price);
        existing.planCount += 1;
      } else {
        groups.set(plan.merchantName, {
          merchantName: plan.merchantName,
          logoEmoji: plan.logoEmoji,
          category: plan.category,
          minPrice: plan.price,
          planCount: 1,
        });
      }
    }
    return Array.from(groups.values()).sort((a, b) => a.merchantName.localeCompare(b.merchantName));
  }, [plans]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={18} color="#7e828d" />
        </TouchableOpacity>
        <Text style={styles.title}>Marketplace</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator color="#14ed9e" size="large" />
        </View>
      ) : error && merchants.length === 0 ? (
        <View style={[styles.centerContent, { paddingHorizontal: 32 }]}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={load}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14ed9e" />}
        >
          <Text style={styles.subtitle}>Browse and compare plans, then subscribe with your NeuroPay wallet.</Text>

          <View style={styles.list}>
            {merchants.map((m, i) => (
              <Animated.View key={m.merchantName} entering={FadeInUp.duration(350).delay(i * 60)}>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => router.push(`/marketplace/${encodeURIComponent(m.merchantName)}` as any)}
                >
                  <View style={styles.cardLeft}>
                    <View style={styles.logoBox}>
                      <Text style={{ fontSize: 22 }}>{m.logoEmoji ?? FALLBACK_MERCHANT_EMOJI}</Text>
                    </View>
                    <View>
                      <Text style={styles.merchantName}>{m.merchantName}</Text>
                      <Text style={styles.merchantMeta}>
                        {m.category ?? "Other"} · {m.planCount} plan{m.planCount > 1 ? "s" : ""}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={styles.fromPrice}>From ${m.minPrice.toFixed(2)}/mo</Text>
                    <ChevronRight size={16} color="#7e828d" />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0d0e12" },
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
  centerContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#7e828d", fontSize: 14, textAlign: "center", marginBottom: 16, fontFamily: "Manrope_500Medium" },
  retryButton: { backgroundColor: "#14ed9e", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryButtonText: { color: "#0d0e12", fontSize: 14, fontFamily: "Manrope_700Bold" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  subtitle: { color: "#7e828d", fontSize: 13, lineHeight: 19, marginBottom: 20, fontFamily: "Manrope_400Regular" },
  list: { gap: 12 },
  card: {
    backgroundColor: "rgba(35, 36, 47, 0.6)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  merchantName: { color: "#fcfcfc", fontSize: 14, fontFamily: "Manrope_600SemiBold", marginBottom: 2 },
  merchantMeta: { color: "#7e828d", fontSize: 12, fontFamily: "Manrope_400Regular" },
  cardRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  fromPrice: { color: "#14ed9e", fontSize: 13, fontFamily: "Manrope_700Bold" },
});
