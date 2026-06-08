import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";

interface CreditCardProps {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
  focused: "number" | "name" | "expiry" | "cvv" | null;
}

const formatCardNumber = (num: string) => {
  const padded = num.padEnd(16, "•");
  return padded.match(/.{1,4}/g)?.join("  ") || padded;
};

export default function CreditCard({ number, name, expiry, cvv, focused }: CreditCardProps) {
  // Flip for CVV
  const flip = useSharedValue(0);
  // 3D tilt
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    flip.value = focused === "cvv"
      ? withTiming(180, { duration: 550 })
      : withTiming(0, { duration: 550 });
  }, [focused]);

  const onPressIn = () => {
    rotateX.value = withSpring(6, { damping: 12, stiffness: 120 });
    rotateY.value = withSpring(-8, { damping: 12, stiffness: 120 });
    scale.value = withSpring(0.97, { damping: 12 });
  };

  const onPressOut = () => {
    rotateX.value = withSpring(0, { damping: 10, stiffness: 80 });
    rotateY.value = withSpring(0, { damping: 10, stiffness: 80 });
    scale.value = withSpring(1, { damping: 10 });
  };

  const tiltStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
      { scale: scale.value },
    ],
  }));

  const frontStyle = useAnimatedStyle(() => {
    const ry = interpolate(flip.value, [0, 180], [0, 180], Extrapolation.CLAMP);
    return {
      transform: [{ perspective: 900 }, { rotateY: `${ry}deg` }],
      backfaceVisibility: "hidden",
      zIndex: flip.value < 90 ? 1 : 0,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const ry = interpolate(flip.value, [0, 180], [-180, 0], Extrapolation.CLAMP);
    return {
      transform: [{ perspective: 900 }, { rotateY: `${ry}deg` }],
      backfaceVisibility: "hidden",
      zIndex: flip.value > 90 ? 1 : 0,
    };
  });

  return (
    <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.wrapper, tiltStyle]}>

        {/* ──── FRONT ──── */}
        <Animated.View style={[styles.side, frontStyle]}>
          <LinearGradient
            colors={["#0c2d1c", "#0f1f17", "#0d0e12"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {/* Decorative glow orbs */}
            <View style={styles.orb1} />
            <View style={styles.orb2} />

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.brandRow}>
                <View style={styles.npDot} />
                <Text style={styles.brandText}>NeuroPay</Text>
              </View>
              <Text style={styles.networkLabel}>VISA</Text>
            </View>

            {/* EMV Chip */}
            <View style={styles.chipOuter}>
              <LinearGradient
                colors={["#c8a84b", "#f5d77e", "#b8952e"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.chip}
              >
                <View style={styles.chipLine} />
                <View style={styles.chipLineH} />
              </LinearGradient>
            </View>

            {/* Card Number */}
            <Text style={[styles.cardNumber, focused === "number" && styles.activeText]}>
              {formatCardNumber(number)}
            </Text>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.nameBlock}>
                <Text style={styles.fieldLabel}>CARDHOLDER NAME</Text>
                <Text 
                  style={[styles.fieldValue, focused === "name" && styles.activeText]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {name ? name.toUpperCase() : "YOUR NAME"}
                </Text>
              </View>
              <View style={styles.expiryBlock}>
                <Text style={styles.fieldLabel}>EXPIRES</Text>
                <Text style={[styles.fieldValue, focused === "expiry" && styles.activeText]}>
                  {expiry || "MM/YY"}
                </Text>
              </View>
            </View>

            {/* Bottom glow line */}
            <View style={styles.glowLine} />
          </LinearGradient>
        </Animated.View>

        {/* ──── BACK ──── */}
        <Animated.View style={[styles.side, styles.backSide, backStyle]}>
          <LinearGradient
            colors={["#0d0e12", "#0f1f17", "#0c2d1c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <View style={styles.orb1} />
            <View style={styles.orb2} />

            {/* Magnetic strip */}
            <View style={styles.magStrip} />

            {/* Signature + CVV */}
            <View style={styles.sigRow}>
              <LinearGradient
                colors={["#e8e8e8", "#d0d0d0"]}
                style={styles.sigStrip}
              >
                <Text style={styles.sigLines}>{"///  ///  ///  ///  ///  ///  ///  ///  ///"}</Text>
              </LinearGradient>
              <View style={styles.cvvBox}>
                <Text style={styles.cvvText}>{cvv || "•••"}</Text>
              </View>
            </View>
            <Text style={styles.cvvLabel}>CVV</Text>

            {/* Back brand */}
            <View style={styles.backFooter}>
              <Text style={styles.brandText}>NeuroPay</Text>
              <Text style={styles.disclaimer}>
                This card is issued by NeuroPay Financial Services and is subject to cardholder agreement.
              </Text>
            </View>

            <View style={styles.glowLine} />
          </LinearGradient>
        </Animated.View>

      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    height: 230,
    marginVertical: 20,
  },
  side: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 20,
    shadowColor: "#14ed9e",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
  },
  backSide: {
    transform: [{ rotateY: "180deg" }],
  },
  gradient: {
    flex: 1,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1.5,
    borderColor: "rgba(20, 237, 158, 0.35)",
    overflow: "hidden",
  },

  // Decorative orbs
  orb1: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(20, 237, 158, 0.08)",
    top: -50,
    right: -40,
  },
  orb2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(20, 237, 158, 0.05)",
    bottom: -30,
    left: -20,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  npDot: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#14ed9e",
  },
  brandText: {
    color: "#fcfcfc",
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  networkLabel: {
    color: "#fcfcfc",
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 20,
    fontStyle: "italic",
    letterSpacing: 1,
    opacity: 0.9,
  },

  // Chip
  chipOuter: {
    marginBottom: 10,
  },
  chip: {
    width: 44,
    height: 34,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.2)",
  },
  chipLine: {
    position: "absolute",
    width: "100%",
    height: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    top: "50%",
  },
  chipLineH: {
    position: "absolute",
    height: "100%",
    width: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    left: "50%",
  },

  // Card number
  cardNumber: {
    color: "#fcfcfc",
    fontFamily: "Manrope_700Bold",
    fontSize: 19,
    letterSpacing: 3,
    marginBottom: 12,
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  nameBlock: {
    flex: 1,
    marginRight: 10,
  },
  expiryBlock: {
    alignItems: "flex-end",
  },
  fieldLabel: {
    color: "rgba(255,255,255,0.45)",
    fontFamily: "Manrope_600SemiBold",
    fontSize: 9,
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  fieldValue: {
    color: "#fcfcfc",
    fontFamily: "Manrope_700Bold",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  activeText: {
    color: "#14ed9e",
    textShadowColor: "rgba(20, 237, 158, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  // Glow bottom line
  glowLine: {
    position: "absolute",
    bottom: 0,
    left: 22,
    right: 22,
    height: 1,
    backgroundColor: "rgba(20, 237, 158, 0.3)",
  },

  // Back side
  magStrip: {
    height: 42,
    backgroundColor: "#000",
    marginHorizontal: -22,
    marginTop: 10,
    marginBottom: 18,
  },
  sigRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  sigStrip: {
    flex: 1,
    height: 36,
    borderRadius: 4,
    justifyContent: "center",
    paddingHorizontal: 8,
    overflow: "hidden",
  },
  sigLines: {
    color: "rgba(0,0,0,0.3)",
    fontSize: 16,
    fontFamily: "Manrope_400Regular",
    letterSpacing: -1,
  },
  cvvBox: {
    width: 56,
    height: 36,
    backgroundColor: "#fff",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  cvvText: {
    color: "#0d0e12",
    fontFamily: "Manrope_700Bold",
    fontSize: 15,
    letterSpacing: 2,
  },
  cvvLabel: {
    color: "rgba(255,255,255,0.4)",
    fontFamily: "Manrope_600SemiBold",
    fontSize: 9,
    letterSpacing: 1.2,
    textAlign: "right",
    marginBottom: 12,
  },
  backFooter: {
    position: "absolute",
    bottom: 18,
    left: 22,
    right: 22,
    gap: 4,
  },
  disclaimer: {
    color: "rgba(255,255,255,0.3)",
    fontFamily: "Manrope_400Regular",
    fontSize: 7.5,
    lineHeight: 11,
  },
});
