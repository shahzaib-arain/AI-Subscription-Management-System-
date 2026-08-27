import { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeInUp, FadeInDown, FadeOutUp } from "react-native-reanimated";
import { ArrowLeft, Check, Star } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { useSubscriptions } from "../../context/SubscriptionsContext";
import { marketplaceApi, PlanData } from "../../services/api";
import { useAutoDismiss } from "../../hooks/use-auto-dismiss";
import { cycleSuffix, FALLBACK_MERCHANT_EMOJI } from "../../utils/subscription";

export default function MerchantPlansPage() {
  const { merchant } = useLocalSearchParams<{ merchant: string }>();
  const merchantName = decodeURIComponent(merchant ?? "");
  const router = useRouter();
  const { token, refreshWallet } = useAuth();
  const { subscriptions, refresh: refreshSubscriptions } = useSubscriptions();

  const [allPlans, setAllPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribingId, setSubscribingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  useAutoDismiss(actionError, () => setActionError(null));

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    marketplaceApi
      .getPlans(token)
      .then((res) => setAllPlans(res.data))
      .catch((err) => setError(err?.message || "Failed to load plans."))
      .finally(() => setLoading(false));
  }, [token]);

  const plans = allPlans
    .filter((p) => p.merchantName === merchantName)
    .sort((a, b) => a.price - b.price);

  const currentSubscription = subscriptions.find((s) => s.merchantName === merchantName);

  const handleSubscribe = async (plan: PlanData) => {
    if (!token) return;
    setActionError(null);
    setActionSuccess(null);
    setSubscribingId(plan.id);
    try {
      await marketplaceApi.subscribe(token, plan.id);
      await Promise.all([refreshWallet(), refreshSubscriptions()]);
      setActionSuccess(`Subscribed to ${merchantName} ${plan.planName}.`);
      setTimeout(() => router.push("/(tabs)/subscriptions"), 900);
    } catch (err: any) {
      setActionError(err?.message || "Couldn't complete the purchase. Please try again.");
    } finally {
      setSubscribingId(null);
    }
  };

  if (loading) {
    return (
      <View style={[styles.root, styles.centerContent]}>
        <ActivityIndicator color="#14ed9e" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={18} color="#7e828d" />
        </TouchableOpacity>
        <Text style={styles.title}>{merchantName}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {error && plans.length === 0 ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            {currentSubscription && (
              <View style={styles.currentBanner}>
                <Text style={styles.currentBannerText}>
                  You're currently on the ${currentSubscription.amount.toFixed(2)}/mo plan.
                </Text>
              </View>
            )}

            {actionError && (
              <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutUp.duration(200)} style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{actionError}</Text>
              </Animated.View>
            )}
            {actionSuccess && (
              <Animated.View entering={FadeInDown.duration(200)} style={styles.successBanner}>
                <Text style={styles.successBannerText}>{actionSuccess}</Text>
              </Animated.View>
            )}

            <View style={styles.plansList}>
              {plans.map((plan, i) => {
                const isCurrent = currentSubscription != null && currentSubscription.amount === plan.price;
                return (
                  <Animated.View key={plan.id} entering={FadeInUp.duration(350).delay(i * 80)}>
                    <View style={[styles.planCard, plan.popular && styles.planCardPopular]}>
                      {plan.popular && (
                        <View style={styles.popularBadge}>
                          <Star size={11} color="#0d0e12" fill="#0d0e12" />
                          <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                        </View>
                      )}
                      <Text style={styles.planName}>{plan.planName}</Text>
                      <View style={styles.priceRow}>
                        <Text style={styles.price}>${plan.price.toFixed(2)}</Text>
                        <Text style={styles.priceCycle}>/{cycleSuffix(plan.billingCycle)}</Text>
                      </View>
                      {plan.description && (
                        <View style={styles.featureRow}>
                          <Check size={14} color="#14ed9e" />
                          <Text style={styles.featureText}>{plan.description}</Text>
                        </View>
                      )}

                      <TouchableOpacity
                        style={[styles.subscribeButton, isCurrent && styles.subscribeButtonDisabled]}
                        onPress={() => handleSubscribe(plan)}
                        disabled={isCurrent || subscribingId !== null}
                      >
                        {subscribingId === plan.id ? (
                          <ActivityIndicator size="small" color={isCurrent ? "#7e828d" : "#0d0e12"} />
                        ) : (
                          <Text style={[styles.subscribeButtonText, isCurrent && styles.subscribeButtonTextDisabled]}>
                            {isCurrent ? "Current Plan" : currentSubscription ? "Switch to This" : "Subscribe"}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0d0e12" },
  centerContent: { justifyContent: "center", alignItems: "center" },
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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  errorText: { color: "#7e828d", fontSize: 14, textAlign: "center", fontFamily: "Manrope_500Medium", marginTop: 40 },

  currentBanner: {
    backgroundColor: "rgba(20, 237, 158, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(20, 237, 158, 0.25)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  currentBannerText: { color: "#14ed9e", fontSize: 12.5, textAlign: "center", fontFamily: "Manrope_500Medium" },

  errorBanner: {
    backgroundColor: "rgba(245, 34, 34, 0.15)",
    borderWidth: 1,
    borderColor: "#f52222",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: { color: "#ff4e83", fontSize: 13, textAlign: "center", fontFamily: "Manrope_500Medium" },
  successBanner: {
    backgroundColor: "rgba(20, 237, 158, 0.16)",
    borderWidth: 1,
    borderColor: "#14ed9e",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successBannerText: { color: "#14ed9e", fontSize: 13, textAlign: "center", fontFamily: "Manrope_500Medium" },

  plansList: { gap: 14 },
  planCard: {
    backgroundColor: "#15161d",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#22232d",
  },
  planCardPopular: {
    borderColor: "#14ed9e",
    borderWidth: 1.5,
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    right: 20,
    backgroundColor: "#14ed9e",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  popularBadgeText: { color: "#0d0e12", fontSize: 9, fontFamily: "Manrope_800ExtraBold", letterSpacing: 0.5 },
  planName: { color: "#fcfcfc", fontSize: 17, fontFamily: "Manrope_700Bold", marginBottom: 8 },
  priceRow: { flexDirection: "row", alignItems: "flex-end", gap: 4, marginBottom: 12 },
  price: { color: "#14ed9e", fontSize: 28, fontFamily: "Manrope_800ExtraBold" },
  priceCycle: { color: "#7e828d", fontSize: 13, marginBottom: 4, fontFamily: "Manrope_400Regular" },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 18 },
  featureText: { color: "#a7abb5", fontSize: 13, fontFamily: "Manrope_400Regular", flex: 1 },
  subscribeButton: {
    backgroundColor: "#14ed9e",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  subscribeButtonDisabled: { backgroundColor: "#24252e" },
  subscribeButtonText: { color: "#0d0e12", fontSize: 14, fontFamily: "Manrope_700Bold" },
  subscribeButtonTextDisabled: { color: "#7e828d" },
});
