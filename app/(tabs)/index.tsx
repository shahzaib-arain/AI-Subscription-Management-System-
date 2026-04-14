import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { TrendingDown, AlertTriangle, Sparkles } from "lucide-react-native";
import { subscriptions, totalMonthly, alerts } from "../../constants/mockData";

export default function HomePage() {
  const router = useRouter();
  
  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const flaggedCount = alerts.filter((a) => !a.read).length;
  const upcoming = subscriptions
    .filter((s) => s.status === "active")
    .sort((a, b) => new Date(a.nextPayment).getTime() - new Date(b.nextPayment).getTime())
    .slice(0, 4);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      {/* Header */}
      <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.header}>
        <Text style={styles.greetingText}>Good morning,</Text>
        <Text style={styles.nameText}>Shahzaib 👋</Text>
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
      </Animated.View>

      {/* Quick Stats */}
      <Animated.View entering={FadeInUp.duration(400).delay(300)} style={styles.quickStatsRow}>
        <View style={styles.statCard}>
          <View style={[styles.iconBox, { backgroundColor: "#14ed9e" }]}>
            <TrendingDown size={16} color="#0d0e12" />
          </View>
          <Text style={styles.statLabel}>Saved this month</Text>
          <Text style={styles.statValue}>$45.00</Text>
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
            You haven't used Figma in 45 days. Pausing it would save you <Text style={{ color: "#fcfcfc", fontWeight: "600" }}>$180/year</Text>.
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

        <View style={styles.upcomingList}>
          {upcoming.map((sub, i) => (
            <Animated.View key={sub.id} entering={FadeInUp.duration(300).delay(500 + (i * 100))}>
              <TouchableOpacity 
                style={styles.subItem} 
                onPress={() => router.push(`/subscriptions/${sub.id}` as any)}
              >
                <View style={styles.subLeft}>
                  <View style={[styles.logoBox, { backgroundColor: "rgba(255,255,255,0.05)" }]}>
                    <Text style={{ fontSize: 20 }}>{sub.logo}</Text>
                  </View>
                  <View>
                    <Text style={styles.subName}>{sub.name}</Text>
                    <Text style={styles.subDate}>
                      {new Date(sub.nextPayment).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </Text>
                  </View>
                </View>
                <Text style={styles.subAmount}>${sub.amount.toFixed(2)}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0e12" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 64, paddingBottom: 100 },
  header: { marginBottom: 24 },
  greetingText: { color: "#7e828d", fontSize: 14, fontWeight: "500" },
  nameText: { color: "#fcfcfc", fontSize: 24, fontWeight: "bold", marginTop: 4 },
  
  spendCard: { backgroundColor: "#15161d", borderRadius: 24, padding: 24, paddingBottom: 20, borderWidth: 1, borderColor: "#24252e", shadowColor: "#000", shadowOpacity: 0.5, shadowRadius: 10, elevation: 5, overflow: "hidden", marginBottom: 16 },
  blurCircle: { position: "absolute", top: -40, right: -40, width: 150, height: 150, borderRadius: 75, backgroundColor: "rgba(20, 237, 158, 0.15)" },
  cardLabel: { color: "#7e828d", fontSize: 10, fontWeight: "bold", letterSpacing: 1 },
  spendRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginTop: 12, marginBottom: 20 },
  totalText: { color: "#14ed9e", fontSize: 40, fontWeight: "bold" },
  moText: { color: "#7e828d", fontSize: 14, marginBottom: 8 },
  badgeRow: { flexDirection: "row", gap: 16 },
  badge: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  badgeText: { color: "#7e828d", fontSize: 12 },

  quickStatsRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 16, padding: 16 },
  iconBox: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  statLabel: { color: "#7e828d", fontSize: 12, marginBottom: 4 },
  statValue: { color: "#fcfcfc", fontSize: 18, fontWeight: "bold" },

  insightCard: { backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 16, padding: 16, flexDirection: "row", gap: 12, borderWidth: 1, borderColor: "rgba(20, 237, 158, 0.2)", marginBottom: 24 },
  insightTitle: { color: "#14ed9e", fontSize: 12, fontWeight: "bold", marginBottom: 4 },
  insightDesc: { color: "#7e828d", fontSize: 12, lineHeight: 18 },

  upcomingSection: {},
  upcomingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { color: "#fcfcfc", fontSize: 14, fontWeight: "bold" },
  seeAllText: { color: "#14ed9e", fontSize: 12, fontWeight: "600" },
  upcomingList: { gap: 12 },
  subItem: { backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 16, padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  subLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoBox: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  subName: { color: "#fcfcfc", fontSize: 14, fontWeight: "600", marginBottom: 2 },
  subDate: { color: "#7e828d", fontSize: 12 },
  subAmount: { color: "#fcfcfc", fontSize: 14, fontWeight: "bold" }
});
