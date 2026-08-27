import { useState } from "react";
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Search } from "lucide-react-native";
import { useSubscriptions } from "../../context/SubscriptionsContext";
import { statusColor, statusLabel, FALLBACK_MERCHANT_EMOJI } from "../../utils/subscription";

const tabs = ["All", "Active", "Paused", "Flagged", "Cancelled"] as const;
type Tab = typeof tabs[number];

const statusMap: Record<Tab, string | null> = {
  All: null,
  Active: "ACTIVE",
  Paused: "PAUSED",
  Flagged: "FLAGGED",
  Cancelled: "CANCELLED",
};

export default function SubscriptionsPage() {
  const router = useRouter();
  const { subscriptions, loading, error, refresh } = useSubscriptions();
  const [tab, setTab] = useState<Tab>("All");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const filtered = subscriptions.filter((s) => {
    const matchTab = !statusMap[tab] || s.status === statusMap[tab];
    const matchSearch = s.merchantName.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  if (loading && subscriptions.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator color="#14ed9e" size="large" />
      </View>
    );
  }

  if (error && subscriptions.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent, styles.errorState]}>
        <Text style={styles.errorStateText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14ed9e" />}
    >
      <Text style={styles.title}>Subscriptions</Text>

      {/* Search */}
      <View style={styles.searchBox}>
        <Search size={16} color="#7e828d" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search subscriptions..."
          placeholderTextColor="#7e828d"
          style={styles.searchInput}
        />
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsCol} contentContainerStyle={styles.tabsRow}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tabButton, tab === t && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {subscriptions.length === 0 ? "No subscriptions detected yet." : "No subscriptions match this filter."}
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {filtered.map((sub, i) => (
            <Animated.View key={sub.id} entering={FadeInUp.duration(400).delay(i * 100)}>
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/subscriptions/${sub.id}` as any)}
              >
                <View style={styles.cardLeft}>
                  <View style={[styles.logoBox, { backgroundColor: "rgba(255,255,255,0.05)" }]}>
                    <Text style={{ fontSize: 20 }}>{sub.logoEmoji ?? FALLBACK_MERCHANT_EMOJI}</Text>
                  </View>
                  <View>
                    <View style={styles.nameRow}>
                      <Text style={styles.subName}>{sub.merchantName}</Text>
                      {sub.status !== "ACTIVE" && (
                        <View style={[styles.badge, { backgroundColor: `${statusColor(sub.status)}33` }]}>
                          <Text style={[styles.badgeText, { color: statusColor(sub.status) }]}>{statusLabel(sub.status)}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.subCategory}>{sub.category ?? "Uncategorized"} · {sub.billingCycle.toLowerCase()}</Text>
                  </View>
                </View>
                <Text style={styles.subAmount}>${sub.amount.toFixed(2)}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
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
  title: { fontSize: 24, fontWeight: "bold", color: "#fcfcfc", marginBottom: 20, fontFamily: "Manrope_800ExtraBold" },

  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 12, paddingHorizontal: 16, height: 48, marginBottom: 16 },
  searchInput: { flex: 1, color: "#fcfcfc", marginLeft: 12, fontSize: 14, fontFamily: "Manrope_400Regular" },

  tabsCol: { marginBottom: 20 },
  tabsRow: { gap: 8 },
  tabButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(35, 36, 47, 0.6)" },
  tabButtonActive: { backgroundColor: "#14ed9e" },
  tabText: { color: "#7e828d", fontSize: 12, fontWeight: "500", fontFamily: "Manrope_500Medium" },
  tabTextActive: { color: "#0d0e12", fontWeight: "bold", fontFamily: "Manrope_700Bold" },

  emptyState: { backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 16, padding: 32, alignItems: "center" },
  emptyStateText: { color: "#7e828d", fontSize: 13, fontFamily: "Manrope_400Regular", textAlign: "center" },

  list: { gap: 12 },
  card: { backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  subName: { color: "#fcfcfc", fontSize: 14, fontWeight: "600", fontFamily: "Manrope_600SemiBold" },
  subCategory: { color: "#7e828d", fontSize: 12, fontFamily: "Manrope_400Regular" },
  subAmount: { color: "#fcfcfc", fontSize: 16, fontWeight: "bold", fontFamily: "Manrope_700Bold" },

  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: "bold", fontFamily: "Manrope_700Bold" },
});
