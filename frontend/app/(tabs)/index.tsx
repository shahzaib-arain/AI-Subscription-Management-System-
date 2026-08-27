import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { TrendingDown, AlertTriangle, Sparkles, Wallet } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { useSubscriptions } from "../../context/SubscriptionsContext";
import { computeSpendSummary, FALLBACK_MERCHANT_EMOJI } from "../../utils/subscription";

export default function HomePage() {
  const router = useRouter();
  const { user, wallet, walletLoading } = useAuth();
  const { subscriptions, alerts } = useSubscriptions();
  const walletBalanceText = wallet ? `$${wallet.balance.toFixed(2)}` : walletLoading ? "…" : "—";

  const flaggedCount = alerts.filter((a) => !a.read).length;
  const { activeCount, totalMonthly, savedThisMonth } = computeSpendSummary(subscriptions);

  const upcoming = subscriptions
    .filter((s) => s.status === "ACTIVE" || s.status === "FLAGGED")
    .sort((a, b) => new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime())
    .slice(0, 4);

  // Surface the most actionable real alert instead of a hard-coded tip —
  // an unused subscription is the most useful thing to flag, then a price
  // hike, then anything else; if nothing needs attention, say so honestly.
  const insightAlert =
    alerts.find((a) => a.type === "UNUSED") ??
    alerts.find((a) => a.type === "PRICE_INCREASE") ??
    alerts.find((a) => !a.read);

  const firstName = user?.fullName ? user.fullName.split(" ")[0] : "there";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

      {/* Header */}
      <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.header}>
        <Text style={styles.greetingText}>Good morning,</Text>
        <Text style={styles.nameText}>{firstName} 👋</Text>
      </Animated.View>

      {/* Total Spend Card */}
      <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.spendCard}>
        <View style={styles.blurCircle} />
        <Text style={styles.cardLabel}>MONTHLY SUBSCRIPTIONS</Text>
        <View style={styles.spendRow}>
          <Text style={styles.totalText}>${totalMonthly.toFixed(2)}</Text>
          <Text style={styles.moText}>/mo</Text>
        </View>

        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <View style={[styles.dot, { backgroundColor: "#14ed9e" }]} />
            <Text style={styles.badgeText}>{activeCount} active</Text>
          </View>
          <View style={styles.badge}>
            <View style={[styles.dot, { backgroundColor: "#ffd11a" }]} />
            <Text style={styles.badgeText}>{flaggedCount} alerts</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <TouchableOpacity
          style={styles.walletBalanceRow}
          onPress={() => router.push("/(tabs)/wallet")}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Wallet size={16} color="#14ed9e" />
            <Text style={styles.walletBalanceLabel}>WALLET BALANCE</Text>
          </View>
          <Text style={styles.walletBalanceValue}>{walletBalanceText}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Quick Stats */}
      <Animated.View entering={FadeInUp.duration(400).delay(300)} style={styles.quickStatsRow}>
        <View style={styles.statCard}>
          <View style={[styles.iconBox, { backgroundColor: "#14ed9e" }]}>
            <TrendingDown size={16} color="#0d0e12" />
          </View>
          <Text style={styles.statLabel}>Saved this month</Text>
          <Text style={styles.statValue}>${savedThisMonth.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.statCard} onPress={() => router.push("/(tabs)/alerts")}>
          <View style={[styles.iconBox, { backgroundColor: "rgba(255, 209, 26, 0.2)" }]}>
            <AlertTriangle size={16} color="#ffd11a" />
          </View>
          <Text style={styles.statLabel}>Fraud alerts</Text>
          <Text style={styles.statValue}>{flaggedCount}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* AI Insight */}
      <Animated.View entering={FadeInUp.duration(400).delay(400)} style={styles.insightCard}>
        <View style={[styles.iconBox, { backgroundColor: "#14ed9e", marginTop: 2 }]}>
          <Sparkles size={16} color="#0d0e12" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.insightTitle}>AI Insight</Text>
          <Text style={styles.insightDesc}>
            {insightAlert ? insightAlert.description : "Nothing needs your attention right now — all your subscriptions look normal."}
          </Text>
        </View>
      </Animated.View>

      {/* Upcoming Payments */}
      <Animated.View entering={FadeInUp.duration(400).delay(500)} style={styles.upcomingSection}>
        <View style={styles.upcomingHeader}>
          <Text style={styles.sectionTitle}>Upcoming Payments</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/subscriptions")}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        {upcoming.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No upcoming payments.</Text>
          </View>
        ) : (
          <View style={styles.upcomingList}>
            {upcoming.map((sub, i) => (
              <Animated.View key={sub.id} entering={FadeInUp.duration(300).delay(500 + (i * 100))}>
                <TouchableOpacity
                  style={styles.subItem}
                  onPress={() => router.push(`/subscriptions/${sub.id}` as any)}
                >
                  <View style={styles.subLeft}>
                    <View style={[styles.logoBox, { backgroundColor: "rgba(255,255,255,0.05)" }]}>
                      <Text style={{ fontSize: 20 }}>{sub.logoEmoji ?? FALLBACK_MERCHANT_EMOJI}</Text>
                    </View>
                    <View>
                      <Text style={styles.subName}>{sub.merchantName}</Text>
                      <Text style={styles.subDate}>
                        {new Date(sub.nextPaymentDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.subAmount}>${sub.amount.toFixed(2)}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}
      </Animated.View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0e12" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 64, paddingBottom: 100 },
  header: { marginBottom: 24 },
  greetingText: { color: "#7e828d", fontSize: 14, fontWeight: "500", fontFamily: "Manrope_500Medium" },
  nameText: { color: "#fcfcfc", fontSize: 24, fontWeight: "bold", marginTop: 4, fontFamily: "Manrope_800ExtraBold" },

  spendCard: { backgroundColor: "#15161d", borderRadius: 24, padding: 24, paddingBottom: 20, borderWidth: 1, borderColor: "#24252e", shadowColor: "#000", shadowOpacity: 0.5, shadowRadius: 10, elevation: 5, overflow: "hidden", marginBottom: 16 },
  blurCircle: { position: "absolute", top: -40, right: -40, width: 150, height: 150, borderRadius: 75, backgroundColor: "rgba(20, 237, 158, 0.15)" },
  cardLabel: { color: "#7e828d", fontSize: 10, fontWeight: "bold", letterSpacing: 1, fontFamily: "Manrope_800ExtraBold" },
  spendRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginTop: 12, marginBottom: 20 },
  totalText: { color: "#14ed9e", fontSize: 40, fontWeight: "bold", fontFamily: "Manrope_800ExtraBold" },
  moText: { color: "#7e828d", fontSize: 14, marginBottom: 8, fontFamily: "Manrope_400Regular" },
  badgeRow: { flexDirection: "row", gap: 16 },
  badge: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  badgeText: { color: "#7e828d", fontSize: 12, fontFamily: "Manrope_500Medium" },

  quickStatsRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 16, padding: 16 },
  iconBox: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  statLabel: { color: "#7e828d", fontSize: 12, marginBottom: 4, fontFamily: "Manrope_500Medium" },
  statValue: { color: "#fcfcfc", fontSize: 18, fontWeight: "bold", fontFamily: "Manrope_700Bold" },

  insightCard: { backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 16, padding: 16, flexDirection: "row", gap: 12, borderWidth: 1, borderColor: "rgba(20, 237, 158, 0.2)", marginBottom: 24 },
  insightTitle: { color: "#14ed9e", fontSize: 12, fontWeight: "bold", marginBottom: 4, fontFamily: "Manrope_700Bold" },
  insightDesc: { color: "#7e828d", fontSize: 12, lineHeight: 18, fontFamily: "Manrope_400Regular" },

  upcomingSection: {},
  upcomingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { color: "#fcfcfc", fontSize: 14, fontWeight: "bold", fontFamily: "Manrope_700Bold" },
  seeAllText: { color: "#14ed9e", fontSize: 12, fontWeight: "600", fontFamily: "Manrope_600SemiBold" },
  emptyState: { backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 16, padding: 24, alignItems: "center" },
  emptyStateText: { color: "#7e828d", fontSize: 13, fontFamily: "Manrope_400Regular" },
  upcomingList: { gap: 12 },
  subItem: { backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 16, padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  subLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoBox: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  subName: { color: "#fcfcfc", fontSize: 14, fontWeight: "600", marginBottom: 2, fontFamily: "Manrope_600SemiBold" },
  subDate: { color: "#7e828d", fontSize: 12, fontFamily: "Manrope_400Regular" },
  subAmount: { color: "#fcfcfc", fontSize: 14, fontWeight: "bold", fontFamily: "Manrope_700Bold" },
  cardDivider: { height: 1, backgroundColor: "#22232d", marginVertical: 16 },
  walletBalanceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  walletBalanceLabel: { color: "#7e828d", fontSize: 10, fontFamily: "Manrope_800ExtraBold", letterSpacing: 1 },
  walletBalanceValue: { color: "#fcfcfc", fontSize: 16, fontFamily: "Manrope_700Bold" }
});
