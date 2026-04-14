import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Shield, Bell, CreditCard, HelpCircle, LogOut, ChevronRight, Settings } from "lucide-react-native";

const menuItems = [
  { icon: Shield, label: "Security & Privacy", color: "#14ed9e" },
  { icon: Bell, label: "Notification Preferences", color: "#ffd11a" },
  { icon: CreditCard, label: "Linked Bank Accounts", color: "#a96df5" },
  { icon: Settings, label: "AI Detection Settings", color: "#14ed9e" },
  { icon: HelpCircle, label: "Help & Support", color: "#7e828d" },
];

export default function ProfilePage() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      {/* Avatar */}
      <Animated.View entering={FadeInUp.duration(400)} style={styles.avatarContainer}>
        <View style={styles.avatarBubble}>
          <Text style={styles.avatarText}>SS</Text>
        </View>
        <Text style={styles.name}>Shahzaib Sajjad</Text>
        <Text style={styles.email}>sp23bsse0080@maju.edu.pk</Text>
      </Animated.View>

      {/* Stats */}
      <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.statsCard}>
        <View style={styles.statCol}>
          <Text style={[styles.statValue, { color: "#14ed9e" }]}>8</Text>
          <Text style={styles.statLabel}>Total Subs</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={styles.statValue}>$247</Text>
          <Text style={styles.statLabel}>Monthly</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={[styles.statValue, { color: "#14ed9e" }]}>$540</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
      </Animated.View>

      {/* Menu */}
      <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.menuCard}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={item.label} 
            style={[styles.menuItem, index !== menuItems.length - 1 && styles.borderBottom]}
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
        <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace("/auth/login")}>
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
  
  statsCard: { backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 16, padding: 16, flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  statCol: { alignItems: "center", flex: 1 },
  statValue: { color: "#fcfcfc", fontSize: 24, fontWeight: "bold", fontFamily: "Manrope_700Bold" },
  statLabel: { color: "#7e828d", fontSize: 10, marginTop: 4, fontFamily: "Manrope_500Medium" },
  
  menuCard: { backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 16, marginBottom: 24 },
  menuItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: "#24252e" },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuLabel: { color: "#fcfcfc", fontSize: 14, fontWeight: "500", fontFamily: "Manrope_500Medium" },
  
  logoutButton: { backgroundColor: "rgba(245, 34, 34, 0.1)", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  logoutText: { color: "#f52222", fontSize: 14, fontWeight: "600", fontFamily: "Manrope_700Bold" }
});
