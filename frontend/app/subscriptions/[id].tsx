import { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeInUp, FadeInDown, FadeOutUp } from "react-native-reanimated";
import { ArrowLeft, Pause, Ban, CheckCircle, TrendingUp } from "lucide-react-native";
import { useSubscriptions } from "../../context/SubscriptionsContext";
import { useAuth } from "../../context/AuthContext";
import { subscriptionApi, TransactionHistoryEntry } from "../../services/api";
import { useAutoDismiss } from "../../hooks/use-auto-dismiss";
import { statusColor, statusLabel, cycleSuffix, cycleLabel, FALLBACK_MERCHANT_EMOJI } from "../../utils/subscription";
import { formatTimestamp } from "../../utils/date";

type ActionKey = "resume" | "pause" | "cancel";

export default function SubscriptionDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const { subscriptions, loading, pauseSubscription, resumeSubscription, cancelSubscription } = useSubscriptions();

  const subscriptionId = Number(id);
  const sub = subscriptions.find((s) => s.id === subscriptionId);

  const [history, setHistory] = useState<TransactionHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [runningAction, setRunningAction] = useState<ActionKey | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  useAutoDismiss(actionError, () => setActionError(null));

  useEffect(() => {
    if (!token || !sub) return;
    setHistoryLoading(true);
    subscriptionApi
      .getHistory(token, sub.id)
      .then((res) => setHistory(res.data))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [token, sub?.id]);

  const runAction = async (key: ActionKey) => {
    setActionError(null);
    setRunningAction(key);
    try {
      if (key === "resume") await resumeSubscription(subscriptionId);
      else if (key === "pause") await pauseSubscription(subscriptionId);
      else await cancelSubscription(subscriptionId);
    } catch (err: any) {
      setActionError(err?.message || "Couldn't update this subscription. Please try again.");
    } finally {
      setRunningAction(null);
    }
  };

  if (loading && !sub) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator color="#14ed9e" size="large" />
      </View>
    );
  }

  if (!sub) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingHorizontal: 32 }]}>
        <Text style={styles.notFoundText}>We couldn't find that subscription.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={16} color="#7e828d" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const actions: { key: ActionKey; label: string; icon: typeof CheckCircle; color: string }[] = [];
  if (sub.status === "PAUSED" || sub.status === "FLAGGED") {
    actions.push({ key: "resume", label: "Approve", icon: CheckCircle, color: "#14ed9e" });
  }
  if (sub.status === "ACTIVE" || sub.status === "FLAGGED") {
    actions.push({ key: "pause", label: "Pause", icon: Pause, color: "#ffd11a" });
  }
  if (sub.status !== "CANCELLED") {
    actions.push({ key: "cancel", label: "Block", icon: Ban, color: "#f52222" });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

      {/* Back */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ArrowLeft size={18} color="#7e828d" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {actionError && (
        <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutUp.duration(200)} style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{actionError}</Text>
        </Animated.View>
      )}

      {/* Hero */}
      <Animated.View entering={FadeInUp.duration(400)} style={styles.heroContainer}>
        <View style={[styles.logoBox, { backgroundColor: "rgba(255,255,255,0.05)" }]}>
          <Text style={{ fontSize: 32 }}>{sub.logoEmoji ?? FALLBACK_MERCHANT_EMOJI}</Text>
        </View>
        <Text style={styles.subTitle}>{sub.merchantName}</Text>
        <Text style={styles.subCategory}>{sub.category ?? "Uncategorized"}</Text>
        <View style={styles.amountRow}>
          <Text style={styles.amountText}>${sub.amount.toFixed(2)}</Text>
          <Text style={styles.cycleText}>/{cycleSuffix(sub.billingCycle)}</Text>
        </View>

        <View style={[styles.badge, { backgroundColor: `${statusColor(sub.status)}33` }]}>
          <Text style={[styles.badgeText, { color: statusColor(sub.status) }]}>{statusLabel(sub.status)}</Text>
        </View>
      </Animated.View>

      {/* Info */}
      <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Billing cycle</Text>
          <Text style={styles.infoValue}>{cycleLabel(sub.billingCycle)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Next payment</Text>
          <Text style={styles.infoValue}>
            {new Date(sub.nextPaymentDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Yearly cost</Text>
          <Text style={styles.infoValue}>${(sub.amount * 12).toFixed(2)}</Text>
        </View>
      </Animated.View>

      {/* Actions */}
      {actions.length > 0 && (
        <Animated.View entering={FadeInUp.duration(400).delay(150)} style={styles.actionGrid}>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={styles.actionCard}
              onPress={() => runAction(action.key)}
              disabled={runningAction !== null}
            >
              <View style={[styles.actionIconBox, { backgroundColor: `${action.color}26` }]}>
                {runningAction === action.key ? (
                  <ActivityIndicator size="small" color={action.color} />
                ) : (
                  <action.icon size={18} color={action.color} />
                )}
              </View>
              <Text style={styles.actionText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {/* Payment History */}
      <Animated.View entering={FadeInUp.duration(400).delay(200)}>
        <Text style={styles.historyTitle}>Payment History</Text>
        {historyLoading ? (
          <View style={styles.historyLoading}>
            <ActivityIndicator color="#14ed9e" />
          </View>
        ) : history.length === 0 ? (
          <View style={styles.historyCard}>
            <Text style={styles.emptyHistoryText}>No payment history for this merchant yet.</Text>
          </View>
        ) : (
          <View style={styles.historyCard}>
            {history.map((p, i) => (
              <View key={i}>
                <View style={styles.historyItem}>
                  <View style={styles.historyLeft}>
                    <View style={styles.historyIconBox}>
                      <TrendingUp size={14} color="#7e828d" />
                    </View>
                    <Text style={styles.historyDate}>{formatTimestamp(p.transactionDate)}</Text>
                  </View>
                  <Text style={styles.historyAmount}>${p.amount.toFixed(2)}</Text>
                </View>
                {i < history.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        )}
      </Animated.View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0e12" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 48, paddingBottom: 64 },
  centerContent: { justifyContent: "center", alignItems: "center" },
  notFoundText: { color: "#7e828d", fontSize: 14, textAlign: "center", marginBottom: 16, fontFamily: "Manrope_500Medium" },
  backButton: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 24 },
  backText: { color: "#7e828d", fontSize: 14, fontWeight: "500", fontFamily: "Manrope_500Medium" },

  errorBanner: {
    backgroundColor: "rgba(245, 34, 34, 0.15)",
    borderWidth: 1,
    borderColor: "#f52222",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  errorBannerText: { color: "#ff4e83", fontSize: 13, fontFamily: "Manrope_500Medium", textAlign: "center" },

  heroContainer: { alignItems: "center", marginBottom: 32 },
  logoBox: { width: 64, height: 64, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  subTitle: { color: "#fcfcfc", fontSize: 24, fontWeight: "bold", marginBottom: 4, fontFamily: "Manrope_800ExtraBold" },
  subCategory: { color: "#7e828d", fontSize: 14, marginBottom: 8, fontFamily: "Manrope_400Regular" },
  amountRow: { flexDirection: "row", alignItems: "flex-end", gap: 4, marginBottom: 12 },
  amountText: { color: "#14ed9e", fontSize: 32, fontWeight: "bold", fontFamily: "Manrope_800ExtraBold" },
  cycleText: { color: "#7e828d", fontSize: 12, marginBottom: 6, fontFamily: "Manrope_400Regular" },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: "600", fontFamily: "Manrope_700Bold" },

  infoCard: { backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 16, padding: 16, marginBottom: 24 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  infoLabel: { color: "#7e828d", fontSize: 14, fontFamily: "Manrope_500Medium" },
  infoValue: { color: "#fcfcfc", fontSize: 14, fontWeight: "500", textTransform: "capitalize", fontFamily: "Manrope_600SemiBold" },
  divider: { height: 1, backgroundColor: "#24252e", marginVertical: 12 },

  actionGrid: { flexDirection: "row", gap: 12, marginBottom: 32 },
  actionCard: { flex: 1, backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 16, padding: 12, alignItems: "center", gap: 8 },
  actionIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  actionText: { color: "#7e828d", fontSize: 11, fontWeight: "500", fontFamily: "Manrope_500Medium" },

  historyTitle: { color: "#fcfcfc", fontSize: 14, fontWeight: "600", marginBottom: 12, fontFamily: "Manrope_700Bold" },
  historyLoading: { backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 16, padding: 32, alignItems: "center" },
  historyCard: { backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 16 },
  emptyHistoryText: { color: "#7e828d", fontSize: 13, fontFamily: "Manrope_400Regular", textAlign: "center", padding: 20 },
  historyItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  historyLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  historyIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#23242f", alignItems: "center", justifyContent: "center" },
  historyDate: { color: "#7e828d", fontSize: 14, fontFamily: "Manrope_400Regular" },
  historyAmount: { color: "#fcfcfc", fontSize: 14, fontWeight: "500", fontFamily: "Manrope_600SemiBold" }
});
