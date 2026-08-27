import { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { AlertTriangle, TrendingUp, Eye, Sparkles, ChevronRight } from "lucide-react-native";
import { useSubscriptions } from "../../context/SubscriptionsContext";
import { AlertData } from "../../services/api";
import { formatRelativeTime } from "../../utils/date";

const iconMap: Record<string, typeof TrendingUp> = {
  PRICE_INCREASE: TrendingUp,
  FRAUD: AlertTriangle,
  UNUSED: Eye,
  NEW_DETECTED: Sparkles,
};

const colorMap: Record<string, { bg: string; text: string }> = {
  HIGH: { bg: "rgba(245, 34, 34, 0.15)", text: "#f52222" },
  MEDIUM: { bg: "rgba(255, 209, 26, 0.15)", text: "#ffd11a" },
  LOW: { bg: "rgba(20, 237, 158, 0.15)", text: "#14ed9e" },
};

export default function AlertsPage() {
  const router = useRouter();
  const { alerts, loading, error, refresh, markAlertRead } = useSubscriptions();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handlePress = async (alert: AlertData) => {
    if (!alert.read) {
      markAlertRead(alert.id).catch(() => {});
    }
    if (alert.subscriptionId) {
      router.push(`/subscriptions/${alert.subscriptionId}` as any);
    }
  };

  if (loading && alerts.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator color="#14ed9e" size="large" />
      </View>
    );
  }

  if (error && alerts.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent, styles.errorState]}>
        <Text style={styles.errorStateText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14ed9e" />}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Fraud & Alerts</Text>
        {unreadCount > 0 && (
          <View style={styles.badgeCount}>
            <Text style={styles.badgeText}>{unreadCount} new</Text>
          </View>
        )}
      </View>

      {alerts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No alerts — everything looks normal.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {alerts.map((alert, i) => {
            const Icon = iconMap[alert.type] ?? AlertTriangle;
            const colors = colorMap[alert.severity] ?? colorMap.LOW;

            return (
              <Animated.View key={alert.id} entering={FadeInUp.duration(400).delay(i * 100)}>
                <TouchableOpacity
                  style={[styles.card, !alert.read && styles.cardUnread]}
                  onPress={() => handlePress(alert)}
                >
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
                    <Text style={styles.timestamp}>{formatRelativeTime(alert.createdAt)}</Text>
                    {alert.severity === "HIGH" && (
                      <TouchableOpacity style={styles.reviewButton} onPress={() => handlePress(alert)}>
                        <Text style={styles.reviewText}>Review now</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0e12" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 64, paddingBottom: 100 },
  centerContent: { justifyContent: "center", alignItems: "center" },
  errorState: { paddingHorizontal: 32, gap: 16 },
  errorStateText: { color: "#7e828d", fontSize: 14, textAlign: "center", fontFamily: "Manrope_500Medium" },
  retryButton: { backgroundColor: "#14ed9e", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryButtonText: { color: "#0d0e12", fontSize: 14, fontFamily: "Manrope_700Bold" },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "bold", color: "#fcfcfc", fontFamily: "Manrope_800ExtraBold" },
  badgeCount: { backgroundColor: "rgba(245, 34, 34, 0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: "#f52222", fontSize: 12, fontWeight: "bold", fontFamily: "Manrope_700Bold" },
  emptyState: { backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 16, padding: 32, alignItems: "center" },
  emptyStateText: { color: "#7e828d", fontSize: 13, fontFamily: "Manrope_400Regular", textAlign: "center" },
  list: { gap: 12 },
  card: { backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 16, padding: 16 },
  cardUnread: { borderWidth: 1, borderColor: "rgba(20, 237, 158, 0.2)" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  flexRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, flex: 1 },
  iconBox: { width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  cardTextCol: { flex: 1, paddingRight: 8 },
  alertTitle: { color: "#fcfcfc", fontSize: 14, fontWeight: "600", marginBottom: 4, fontFamily: "Manrope_600SemiBold" },
  alertDesc: { color: "#7e828d", fontSize: 12, lineHeight: 18, fontFamily: "Manrope_400Regular" },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  timestamp: { color: "#7e828d", fontSize: 10, fontFamily: "Manrope_400Regular" },
  reviewButton: { backgroundColor: "#14ed9e", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  reviewText: { color: "#0d0e12", fontSize: 11, fontWeight: "bold", fontFamily: "Manrope_700Bold" }
});
