import { ScrollView, View, Text, StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { activities } from "../../constants/mockData";

export default function ActivityPage() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Activity</Text>
      
      <View style={styles.list}>
        {activities.map((item, i) => (
          <Animated.View key={item.id} entering={FadeInUp.duration(400).delay(i * 100)}>
            <View style={styles.card}>
              <View style={styles.flexRow}>
                <View style={styles.iconBox}>
                  <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                </View>
                <View>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDate}>{item.timestamp}</Text>
                </View>
              </View>
              {item.amount && (
                <Text style={styles.amount}>-${item.amount.toFixed(2)}</Text>
              )}
            </View>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0e12" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 64, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: "bold", color: "#fcfcfc", marginBottom: 24 },
  list: { gap: 12 },
  card: { backgroundColor: "rgba(35, 36, 47, 0.6)", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  flexRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#23242f", alignItems: "center", justifyContent: "center" },
  itemTitle: { color: "#fcfcfc", fontSize: 14, fontWeight: "500", marginBottom: 2 },
  itemDate: { color: "#7e828d", fontSize: 12 },
  amount: { color: "#fcfcfc", fontSize: 14, fontWeight: "bold" }
});
