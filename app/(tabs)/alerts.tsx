import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { AlertTriangle, TrendingUp, Eye, Sparkles, ChevronRight } from "lucide-react-native";
import { alerts } from "../../constants/mockData";

const iconMap = {
  price_increase: TrendingUp,
  fraud: AlertTriangle,
  unused: Eye,
  new_detected: Sparkles,
};

const colorMap = {
  high: { bg: "rgba(245, 34, 34, 0.15)", text: "#f52222" },
  medium: { bg: "rgba(255, 209, 26, 0.15)", text: "#ffd11a" },
  low: { bg: "rgba(20, 237, 158, 0.15)", text: "#14ed9e" },
};

export default function AlertsPage() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Fraud & Alerts</Text>
        <View style={styles.badgeCount}>
          <Text style={styles.badgeText}>{alerts.filter((a) => !a.read).length} new</Text>
        </View>
      </View>

      <View style={styles.list}>
        {alerts.map((alert, i) => {
          const Icon = iconMap[alert.type as keyof typeof iconMap];
          const colors = colorMap[alert.severity as keyof typeof colorMap];

          return (
            <Animated.View key={alert.id} entering={FadeInUp.duration(400).delay(i * 100)}>
              <TouchableOpacity style={[styles.card, !alert.read && styles.cardUnread]}>
                <View style={styles.cardHeader}>
                  <View style={styles.flexRow}>
                    <View style={[styles.iconBox, { backgroundColor: colors.bg }]}>
                      <Icon size={16} color={colors.text} />
                    </View>
                    <View style={styles.cardTextCol}>
                      <Text style={styles.alertTitle}>{alert.title}</Text>
                      <Text style={styles.alertDesc}>{alert.description}</Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color="#7e828d" style={{ marginTop: 2 }} />
                </View>
                
                <View style={styles.cardFooter}>
                  <Text style={styles.timestamp}>{alert.timestamp}</Text>
                  {alert.severity === "high" && (
                    <TouchableOpacity style={styles.reviewButton}>
                      <Text style={styles.reviewText}>Review now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0e12" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 64, paddingBottom: 100 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "bold", color: "#fcfcfc" },
  badgeCount: { backgroundColor: "rgba(245, 34, 34, 0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: "#f52222", fontSize: 12, fontWeight: "bold" },
  list: { gap: 12 },
  card: { backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 16, padding: 16 },
  cardUnread: { borderWidth: 1, borderColor: "rgba(20, 237, 158, 0.2)" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  flexRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, flex: 1 },
  iconBox: { width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  cardTextCol: { flex: 1, paddingRight: 8 },
  alertTitle: { color: "#fcfcfc", fontSize: 14, fontWeight: "600", marginBottom: 4 },
  alertDesc: { color: "#7e828d", fontSize: 12, lineHeight: 18 },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  timestamp: { color: "#7e828d", fontSize: 10 },
  reviewButton: { backgroundColor: "#14ed9e", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  reviewText: { color: "#0d0e12", fontSize: 11, fontWeight: "bold" }
});
