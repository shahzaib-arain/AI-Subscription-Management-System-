import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { ArrowLeft, Pause, Ban, CheckCircle, TrendingUp } from "lucide-react-native";
import { subscriptions } from "../../constants/mockData";

const paymentHistory = [
  { date: "Apr 1, 2026", amount: 15.99 },
  { date: "Mar 1, 2026", amount: 15.99 },
  { date: "Feb 1, 2026", amount: 14.99 },
  { date: "Jan 1, 2026", amount: 14.99 },
];

export default function SubscriptionDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const sub = subscriptions.find((s) => s.id === id);

  if (!sub) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      {/* Back */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ArrowLeft size={18} color="#7e828d" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {/* Hero */}
      <Animated.View entering={FadeInUp.duration(400)} style={styles.heroContainer}>
        <View style={[styles.logoBox, { backgroundColor: "rgba(255,255,255,0.05)" }]}>
          <Text style={{ fontSize: 32 }}>{sub.logo}</Text>
        </View>
        <Text style={styles.subTitle}>{sub.name}</Text>
        <Text style={styles.subCategory}>{sub.category}</Text>
        <View style={styles.amountRow}>
          <Text style={styles.amountText}>${sub.amount.toFixed(2)}</Text>
          <Text style={styles.cycleText}>/{sub.cycle === "monthly" ? "mo" : sub.cycle === "yearly" ? "yr" : "wk"}</Text>
        </View>
        
        <View style={[styles.badge, 
          sub.status === "active" ? { backgroundColor: "rgba(20, 237, 158, 0.2)" } :
          sub.status === "paused" ? { backgroundColor: "rgba(255, 209, 26, 0.2)" } :
          { backgroundColor: "rgba(245, 34, 34, 0.2)" }
        ]}>
          <Text style={[styles.badgeText, 
            sub.status === "active" ? { color: "#14ed9e" } :
            sub.status === "paused" ? { color: "#ffd11a" } :
            { color: "#f52222" }
          ]}>
            {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
          </Text>
        </View>
      </Animated.View>

      {/* Info */}
      <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Billing cycle</Text>
          <Text style={styles.infoValue}>{sub.cycle}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Next payment</Text>
          <Text style={styles.infoValue}>
            {new Date(sub.nextPayment).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Yearly cost</Text>
          <Text style={styles.infoValue}>${(sub.amount * 12).toFixed(2)}</Text>
        </View>
      </Animated.View>

      {/* Actions */}
      <Animated.View entering={FadeInUp.duration(400).delay(150)} style={styles.actionGrid}>
        <TouchableOpacity style={styles.actionCard}>
          <View style={[styles.actionIconBox, { backgroundColor: "rgba(20, 237, 158, 0.15)" }]}>
            <CheckCircle size={18} color="#14ed9e" />
          </View>
          <Text style={styles.actionText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}>
          <View style={[styles.actionIconBox, { backgroundColor: "rgba(255, 209, 26, 0.15)" }]}>
            <Pause size={18} color="#ffd11a" />
          </View>
          <Text style={styles.actionText}>Pause</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}>
          <View style={[styles.actionIconBox, { backgroundColor: "rgba(245, 34, 34, 0.15)" }]}>
            <Ban size={18} color="#f52222" />
          </View>
          <Text style={styles.actionText}>Block</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Payment History */}
      <Animated.View entering={FadeInUp.duration(400).delay(200)}>
        <Text style={styles.historyTitle}>Payment History</Text>
        <View style={styles.historyCard}>
          {paymentHistory.map((p, i) => (
            <View key={i}>
              <View style={styles.historyItem}>
                <View style={styles.historyLeft}>
                  <View style={styles.historyIconBox}>
                    <TrendingUp size={14} color="#7e828d" />
                  </View>
                  <Text style={styles.historyDate}>{p.date}</Text>
                </View>
                <Text style={styles.historyAmount}>${p.amount.toFixed(2)}</Text>
              </View>
              {i < paymentHistory.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      </Animated.View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0e12" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 48, paddingBottom: 64 },
  backButton: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 24 },
  backText: { color: "#7e828d", fontSize: 14, fontWeight: "500", fontFamily: "Manrope_500Medium" },
  
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
  historyCard: { backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 16 },
  historyItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  historyLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  historyIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#23242f", alignItems: "center", justifyContent: "center" },
  historyDate: { color: "#7e828d", fontSize: 14, fontFamily: "Manrope_400Regular" },
  historyAmount: { color: "#fcfcfc", fontSize: 14, fontWeight: "500", fontFamily: "Manrope_600SemiBold" }
});
