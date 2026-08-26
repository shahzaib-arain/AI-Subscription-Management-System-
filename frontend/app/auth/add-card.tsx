import { useRouter } from "expo-router";
import { ArrowRight, Lock, CheckCircle2, Shield, Eye, EyeOff } from "lucide-react-native";
import { useState, useEffect } from "react";
import {
    StyleSheet,
    Text, TouchableOpacity,
    View
} from "react-native";
import CreditCard from "../../components/ui/CreditCard";
import { useAuth } from "../../context/AuthContext";
import KeyboardAvoidingWrapper from "../../components/KeyboardAvoidingWrapper";

export default function AddCardPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Calculate a future expiry date (e.g., 5 years from now)
  const [expiry, setExpiry] = useState("12/31");
  const [focusedField, setFocusedField] = useState<"number" | "name" | "expiry" | "cvv" | null>(null);

  useEffect(() => {
    const date = new Date();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = String((date.getFullYear() + 5) % 100);
    setExpiry(`${mm}/${yy}`);
  }, []);

  const cardNumber = user?.virtualCardNumber || "••••••••••••••••";
  const cardholderName = user?.fullName || "Your Name";

  const toggleShowCvv = () => {
    setFocusedField(prev => prev === "cvv" ? null : "cvv");
  };

  return (
    <KeyboardAvoidingWrapper contentContainerStyle={styles.scroll}>
      {/* Success Badge & Heading */}
      <View style={styles.heading}>
        <View style={styles.successBadge}>
          <CheckCircle2 size={24} color="#14ed9e" />
          <Text style={styles.successBadgeText}>Account Created Successfully</Text>
        </View>
        <Text style={styles.title}>Your Virtual Card</Text>
        <Text style={styles.subtitle}>
          Use this card for your subscriptions. It is connected directly to your NeuroPay wallet.
        </Text>
      </View>

      {/* Credit Card Visualization */}
      <View style={styles.previewContainer}>
        <CreditCard 
          number={cardNumber.replace(/\s+/g, "")} 
          name={cardholderName} 
          expiry={expiry} 
          cvv="819" 
          focused={focusedField} 
        />
        
        {/* Quick Flip Utility */}
        <TouchableOpacity style={styles.flipBtn} onPress={toggleShowCvv}>
          {focusedField === "cvv" ? (
            <>
              <EyeOff size={16} color="#14ed9e" />
              <Text style={styles.flipBtnText}>Show Card Front</Text>
            </>
          ) : (
            <>
              <Eye size={16} color="#14ed9e" />
              <Text style={styles.flipBtnText}>Show CVV (Flip Card)</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Virtual Card Features */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>VIRTUAL CARD FEATURES</Text>
        
        <View style={styles.featureRow}>
          <View style={styles.iconWrapper}>
            <Shield size={18} color="#14ed9e" />
          </View>
          <View style={styles.featureTextWrapper}>
            <Text style={styles.featureLabel}>AI Fraud Protection</Text>
            <Text style={styles.featureDesc}>Proactive security blocks suspicious transactions automatically.</Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.iconWrapper}>
            <Lock size={18} color="#14ed9e" />
          </View>
          <View style={styles.featureTextWrapper}>
            <Text style={styles.featureLabel}>One-Tap Pause</Text>
            <Text style={styles.featureDesc}>Pause, freeze, or delete your card immediately inside the app.</Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.iconWrapper}>
            <CheckCircle2 size={18} color="#14ed9e" />
          </View>
          <View style={styles.featureTextWrapper}>
            <Text style={styles.featureLabel}>Zero Liability</Text>
            <Text style={styles.featureDesc}>You are 100% protected against unauthorized subscription renewals.</Text>
          </View>
        </View>
      </View>

      {/* Dashboard CTA */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.cta}
          onPress={() => router.replace("/(tabs)")}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Continue to Dashboard</Text>
          <ArrowRight size={18} color="#0d0e12" strokeWidth={3} />
        </TouchableOpacity>

        <View style={styles.secureRow}>
          <Lock size={11} color="#4a4d58" />
          <Text style={styles.secureText}>Active · Linked to your NeuroPay wallet</Text>
        </View>
      </View>
    </KeyboardAvoidingWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 22, paddingTop: 30, paddingBottom: 48 },

  heading: { alignItems: "center", paddingHorizontal: 12, marginBottom: 20 },
  successBadge: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8, 
    backgroundColor: "rgba(20, 237, 158, 0.1)", 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(20, 237, 158, 0.2)",
  },
  successBadgeText: { color: "#14ed9e", fontSize: 13, fontFamily: "Manrope_600SemiBold" },
  title:   { color: "#fcfcfc", fontSize: 28, fontFamily: "Manrope_800ExtraBold", letterSpacing: -0.5 },
  subtitle: { color: "#7e828d", fontSize: 14, fontFamily: "Manrope_400Regular", marginTop: 8, textAlign: "center", lineHeight: 22 },

  previewContainer: {
    paddingVertical: 10,
    width: "100%",
  },
  flipBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(20, 237, 158, 0.05)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(20, 237, 158, 0.15)",
    marginTop: -8,
    marginBottom: 16,
  },
  flipBtnText: { color: "#14ed9e", fontSize: 12, fontFamily: "Manrope_600SemiBold" },

  featuresContainer: {
    backgroundColor: "#15161d",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#22232d",
    gap: 16,
    marginVertical: 16,
  },
  featuresTitle: {
    color: "#7e828d",
    fontSize: 11,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: 1,
    marginBottom: 4,
  },
  featureRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(20, 237, 158, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  featureTextWrapper: {
    flex: 1,
  },
  featureLabel: {
    color: "#fcfcfc",
    fontSize: 15,
    fontFamily: "Manrope_700Bold",
  },
  featureDesc: {
    color: "#7e828d",
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    marginTop: 3,
    lineHeight: 18,
  },

  actionContainer: {
    marginTop: 8,
  },
  cta: {
    backgroundColor: "#14ed9e", height: 56, borderRadius: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    shadowColor: "#14ed9e", shadowOpacity: 0.35, shadowRadius: 14,
  },
  ctaText: { color: "#0d0e12", fontSize: 16, fontFamily: "Manrope_800ExtraBold" },

  secureRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 16 },
  secureText: { color: "#4a4d58", fontSize: 11, fontFamily: "Manrope_400Regular" },
});
