import { View, Text, StyleSheet } from "react-native";
import { getPasswordStrength } from "../../utils/validation";

export default function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const { score, label, color } = getPasswordStrength(password);

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        {[1, 2, 3].map((segment) => (
          <View
            key={segment}
            style={[
              styles.segment,
              { backgroundColor: segment <= score ? color : "rgba(255,255,255,0.08)" },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  track: {
    flex: 1,
    flexDirection: "row",
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  label: {
    fontSize: 11,
    fontFamily: "Manrope_600SemiBold",
    width: 52,
    textAlign: "right",
  },
});
