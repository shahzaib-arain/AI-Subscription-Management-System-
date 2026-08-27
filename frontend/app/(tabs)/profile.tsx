import { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert as RNAlert } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInUp, FadeInDown, FadeOutUp } from "react-native-reanimated";
import { Shield, CreditCard, HelpCircle, LogOut, ChevronRight, Settings, BellRing, BellOff } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { useSubscriptions } from "../../context/SubscriptionsContext";
import { userApi, UserSettingsData } from "../../services/api";
import { computeSpendSummary } from "../../utils/subscription";
import { useAutoDismiss } from "../../hooks/use-auto-dismiss";

const menuItems = [
  { icon: Shield, label: "Security & Privacy", color: "#14ed9e", route: null },
  { icon: CreditCard, label: "Payment Methods", color: "#a96df5", route: "/cards" },
  { icon: Settings, label: "AI Detection Settings", color: "#14ed9e", route: null },
  { icon: HelpCircle, label: "Help & Support", color: "#7e828d", route: null },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const { subscriptions } = useSubscriptions();
  const { activeCount, totalMonthly, savedThisMonth } = computeSpendSummary(subscriptions);

  const [settings, setSettings] = useState<UserSettingsData | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [budgetInput, setBudgetInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  useAutoDismiss(saveError, () => setSaveError(null));
  useAutoDismiss(saveSuccess, () => setSaveSuccess(null));

  useEffect(() => {
    if (!token) return;
    userApi
      .getSettings(token)
      .then((res) => {
        setSettings(res.data);
        setBudgetInput(res.data.budgetCap != null ? String(res.data.budgetCap) : "");
      })
      .catch(() => {})
      .finally(() => setSettingsLoading(false));
  }, [token]);

  const handleSaveBudget = async () => {
    if (!token) return;
    setSaveError(null);
    setSaveSuccess(null);

    const trimmed = budgetInput.trim();
    const parsed = trimmed === "" ? null : parseFloat(trimmed);
    if (trimmed !== "" && (isNaN(parsed as number) || (parsed as number) <= 0)) {
      setSaveError("Enter a positive amount, or leave it blank to remove your cap.");
      return;
    }

    setSaving(true);
    try {
      const res = await userApi.updateBudgetCap(token, parsed);
      setSettings(res.data);
      setSaveSuccess(parsed === null ? "Budget cap removed." : "Budget cap saved.");
    } catch (err: any) {
      setSaveError(err?.message || "Couldn't save your budget cap. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

      {/* Avatar */}
      <Animated.View entering={FadeInUp.duration(400)} style={styles.avatarContainer}>
        <View style={styles.avatarBubble}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.fullName ?? "Your Account"}</Text>
        <Text style={styles.email}>{user?.email ?? ""}</Text>
      </Animated.View>

      {/* Stats */}
      <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.statsCard}>
        <View style={styles.statCol}>
          <Text style={[styles.statValue, { color: "#14ed9e" }]}>{activeCount}</Text>
          <Text style={styles.statLabel}>Active Subs</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={styles.statValue}>${totalMonthly.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Monthly</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={[styles.statValue, { color: "#14ed9e" }]}>${savedThisMonth.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
      </Animated.View>

      {/* Budget Cap */}
      <Animated.View entering={FadeInUp.duration(400).delay(150)} style={styles.card}>
        <Text style={styles.cardTitle}>Monthly Budget Cap</Text>
        <Text style={styles.cardSubtitle}>
          Get flagged when your active subscriptions cross this amount.
        </Text>

        {saveError && (
          <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutUp.duration(200)} style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{saveError}</Text>
          </Animated.View>
        )}
        {saveSuccess && (
          <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutUp.duration(200)} style={styles.successBanner}>
            <Text style={styles.successBannerText}>{saveSuccess}</Text>
          </Animated.View>
        )}

        {settingsLoading ? (
          <ActivityIndicator color="#14ed9e" style={{ marginVertical: 12 }} />
        ) : (
          <View style={styles.budgetRow}>
            <View style={styles.budgetInputWrapper}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                value={budgetInput}
                onChangeText={setBudgetInput}
                placeholder="No cap set"
                placeholderTextColor="#4a4d58"
                keyboardType="numeric"
                style={styles.budgetInput}
                selectionColor="#14ed9e"
              />
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveBudget} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color="#0d0e12" /> : <Text style={styles.saveButtonText}>Save</Text>}
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* Push notification status */}
      <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.card}>
        <View style={styles.pushRow}>
          <View style={styles.pushLeft}>
            {settings?.pushNotificationsEnabled ? (
              <BellRing size={18} color="#14ed9e" />
            ) : (
              <BellOff size={18} color="#7e828d" />
            )}
            <View>
              <Text style={styles.cardTitle}>Push Notifications</Text>
              <Text style={styles.cardSubtitle}>
                {settings?.pushNotificationsEnabled
                  ? "Enabled on this device."
                  : "Not enabled — allow notifications on your device to turn this on."}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Menu */}
      <Animated.View entering={FadeInUp.duration(400).delay(250)} style={styles.menuCard}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.menuItem, index !== menuItems.length - 1 && styles.borderBottom]}
            onPress={() =>
              item.route
                ? router.push(item.route as any)
                : RNAlert.alert(item.label, "Coming soon.")
            }
          >
            <View style={styles.menuLeft}>
              <item.icon size={18} color={item.color} />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <ChevronRight size={16} color="#7e828d" />
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Logout */}
      <Animated.View entering={FadeInUp.duration(400).delay(300)}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await logout();
            router.replace("/auth/login");
          }}
        >
          <LogOut size={18} color="#f52222" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </Animated.View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0e12" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 64, paddingBottom: 100 },
  avatarContainer: { alignItems: "center", marginBottom: 24 },
  avatarBubble: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#14ed9e", alignItems: "center", justifyContent: "center", marginBottom: 16, shadowColor: "#14ed9e", shadowOpacity: 0.3, shadowRadius: 15 },
  avatarText: { color: "#0d0e12", fontSize: 28, fontWeight: "bold", fontFamily: "Manrope_800ExtraBold" },
  name: { color: "#fcfcfc", fontSize: 20, fontWeight: "bold", fontFamily: "Manrope_700Bold" },
  email: { color: "#7e828d", fontSize: 12, marginTop: 4, fontFamily: "Manrope_400Regular" },

  statsCard: { backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 16, padding: 16, flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  statCol: { alignItems: "center", flex: 1 },
  statValue: { color: "#fcfcfc", fontSize: 22, fontWeight: "bold", fontFamily: "Manrope_700Bold" },
  statLabel: { color: "#7e828d", fontSize: 10, marginTop: 4, fontFamily: "Manrope_500Medium" },

  card: { backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 16, padding: 16, marginBottom: 16 },
  cardTitle: { color: "#fcfcfc", fontSize: 14, fontWeight: "600", fontFamily: "Manrope_600SemiBold" },
  cardSubtitle: { color: "#7e828d", fontSize: 12, marginTop: 4, lineHeight: 17, fontFamily: "Manrope_400Regular" },

  errorBanner: { backgroundColor: "rgba(245, 34, 34, 0.15)", borderWidth: 1, borderColor: "#f52222", borderRadius: 10, padding: 10, marginTop: 12 },
  errorBannerText: { color: "#ff4e83", fontSize: 12, textAlign: "center", fontFamily: "Manrope_500Medium" },
  successBanner: { backgroundColor: "rgba(20, 237, 158, 0.16)", borderWidth: 1, borderColor: "#14ed9e", borderRadius: 10, padding: 10, marginTop: 12 },
  successBannerText: { color: "#14ed9e", fontSize: 12, textAlign: "center", fontFamily: "Manrope_500Medium" },

  budgetRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  budgetInputWrapper: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#0d0e12", borderRadius: 12, borderWidth: 1, borderColor: "#24252e", paddingHorizontal: 14, height: 48 },
  currencySymbol: { color: "#14ed9e", fontSize: 16, fontFamily: "Manrope_700Bold", marginRight: 6 },
  budgetInput: { flex: 1, color: "#fcfcfc", fontSize: 15, fontFamily: "Manrope_500Medium" },
  saveButton: { backgroundColor: "#14ed9e", borderRadius: 12, height: 48, paddingHorizontal: 20, alignItems: "center", justifyContent: "center" },
  saveButtonText: { color: "#0d0e12", fontSize: 14, fontFamily: "Manrope_700Bold" },

  pushRow: { flexDirection: "row", alignItems: "center" },
  pushLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },

  menuCard: { backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 16, marginBottom: 24 },
  menuItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: "#24252e" },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuLabel: { color: "#fcfcfc", fontSize: 14, fontWeight: "500", fontFamily: "Manrope_500Medium" },

  logoutButton: { backgroundColor: "rgba(245, 34, 34, 0.1)", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  logoutText: { color: "#f52222", fontSize: 14, fontWeight: "600", fontFamily: "Manrope_700Bold" }
});
