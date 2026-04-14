import { useState } from "react";
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Search } from "lucide-react-native";
import { subscriptions } from "../../constants/mockData";

const tabs = ["All", "Active", "Paused", "Flagged"] as const;
type Tab = typeof tabs[number];

const statusMap: Record<Tab, string | null> = {
  All: null, Active: "active", Paused: "paused", Flagged: "flagged",
};

export default function SubscriptionsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("All");
  const [search, setSearch] = useState("");

  const filtered = subscriptions.filter((s) => {
    const matchTab = !statusMap[tab] || s.status === statusMap[tab];
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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
      <View style={styles.list}>
        {filtered.map((sub, i) => (
          <Animated.View key={sub.id} entering={FadeInUp.duration(400).delay(i * 100)}>
            <TouchableOpacity 
              style={styles.card}
              onPress={() => router.push(`/subscriptions/${sub.id}` as any)}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.logoBox, { backgroundColor: "rgba(255,255,255,0.05)" }]}>
                   <Text style={{ fontSize: 20 }}>{sub.logo}</Text>
                </View>
                <View>
                  <View style={styles.nameRow}>
                    <Text style={styles.subName}>{sub.name}</Text>
                    {sub.status === "flagged" && (
                      <View style={styles.badgeFlagged}><Text style={styles.textFlagged}>Flagged</Text></View>
                    )}
                    {sub.status === "paused" && (
                      <View style={styles.badgePaused}><Text style={styles.textPaused}>Paused</Text></View>
                    )}
                  </View>
                  <Text style={styles.subCategory}>{sub.category} · {sub.cycle}</Text>
                </View>
              </View>
              <Text style={styles.subAmount}>${sub.amount.toFixed(2)}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0e12" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 64, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: "bold", color: "#fcfcfc", marginBottom: 20 },
  
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 12, paddingHorizontal: 16, height: 48, marginBottom: 16 },
  searchInput: { flex: 1, color: "#fcfcfc", marginLeft: 12, fontSize: 14 },
  
  tabsCol: { marginBottom: 20 },
  tabsRow: { gap: 8 },
  tabButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(35, 36, 47, 0.6)" },
  tabButtonActive: { backgroundColor: "#14ed9e" },
  tabText: { color: "#7e828d", fontSize: 12, fontWeight: "500" },
  tabTextActive: { color: "#0d0e12", fontWeight: "bold" },
  
  list: { gap: 12 },
  card: { backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  subName: { color: "#fcfcfc", fontSize: 14, fontWeight: "600" },
  subCategory: { color: "#7e828d", fontSize: 12 },
  subAmount: { color: "#fcfcfc", fontSize: 16, fontWeight: "bold" },
  
  badgeFlagged: { backgroundColor: "rgba(245, 34, 34, 0.2)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  textFlagged: { color: "#f52222", fontSize: 10, fontWeight: "bold" },
  badgePaused: { backgroundColor: "rgba(255, 209, 26, 0.2)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  textPaused: { color: "#ffd11a", fontSize: 10, fontWeight: "bold" }
});
