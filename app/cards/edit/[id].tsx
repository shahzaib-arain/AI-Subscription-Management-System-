import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CreditCard as CardIcon, User, Calendar, Lock } from "lucide-react-native";
import CreditCard from "../../../components/ui/CreditCard";

type FocusedField = "number" | "name" | "expiry" | "cvv" | null;

const fields = [
  { key: "number" as FocusedField, label: "Card Number",    placeholder: "•••• •••• •••• ••••", icon: CardIcon, keyboard: "numeric" as const, maxLen: 19 },
  { key: "name"   as FocusedField, label: "Cardholder Name", placeholder: "Full name on card",   icon: User,    keyboard: "default" as const, maxLen: 40 },
  { key: "expiry" as FocusedField, label: "Expiry Date",    placeholder: "MM / YY",              icon: Calendar, keyboard: "numeric" as const, maxLen: 5 },
  { key: "cvv"    as FocusedField, label: "CVV / CVC",      placeholder: "•••",                  icon: Lock,    keyboard: "numeric" as const, secure: true, maxLen: 4 },
];

export default function EditCardPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Pre-fill mock data
  const [number, setNumber] = useState(id === "1" ? "4242424242424242" : "8899889988998899");
  const [name, setName] = useState("SHAHZAIB SAJJAD");
  const [expiry, setExpiry] = useState(id === "1" ? "12/28" : "09/26");
  const [cvv, setCvv] = useState("123");
  const [focused, setFocused] = useState<FocusedField>(null);

  const getValue = (key: FocusedField) => {
    if (key === "number") return number;
    if (key === "name")   return name;
    if (key === "expiry") return expiry;
    if (key === "cvv")    return cvv;
    return "";
  };

  const handleChange = (key: FocusedField, text: string) => {
    if (key === "number") {
      const c = text.replace(/\D/g, "");
      if (c.length <= 16) setNumber(c);
    } else if (key === "name") {
      setName(text);
    } else if (key === "expiry") {
      const c = text.replace(/\D/g, "");
      if (c.length <= 4)
        setExpiry(c.length > 2 ? `${c.slice(0, 2)}/${c.slice(2)}` : c);
    } else if (key === "cvv") {
      const c = text.replace(/\D/g, "");
      if (c.length <= 4) setCvv(c);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Live card preview */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <CreditCard number={number} name={name} expiry={expiry} cvv={cvv} focused={focused} />
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.duration(500).delay(120)} style={styles.form}>
          {fields.map((f) => {
            const Icon = f.icon;
            const isFocused = focused === f.key;
            return (
              <View key={f.key as string} style={styles.fieldBlock}>
                <Text style={[styles.fieldLabel, isFocused && styles.fieldLabelActive]}>
                  {f.label}
                </Text>
                <View style={[styles.inputRow, isFocused && styles.inputRowFocused]}>
                  <Icon size={18} color={isFocused ? "#14ed9e" : "#7e828d"} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder={f.placeholder}
                    placeholderTextColor="#4a4d58"
                    value={getValue(f.key)}
                    onChangeText={(t) => handleChange(f.key, t)}
                    onFocus={() => setFocused(f.key)}
                    onBlur={() => setFocused(null)}
                    keyboardType={f.keyboard}
                    secureTextEntry={!!f.secure}
                    maxLength={f.maxLen}
                    selectionColor="#14ed9e"
                    autoCapitalize={f.key === "name" ? "words" : "none"}
                    // @ts-ignore
                    outlineStyle="none"
                  />
                </View>
              </View>
            );
          })}

          <TouchableOpacity
            style={styles.cta}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>Update Card</Text>
          </TouchableOpacity>

          <View style={styles.secureRow}>
            <Lock size={11} color="#4a4d58" />
            <Text style={styles.secureText}>256-bit encrypted · Never stored in plaintext</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: "#0d0e12" },
  scroll: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 48 },

  form: { gap: 14, marginTop: 8 },

  fieldBlock: { gap: 6 },
  fieldLabel: { color: "#7e828d", fontSize: 11, fontFamily: "Manrope_600SemiBold", letterSpacing: 0.8, textTransform: "uppercase" },
  fieldLabelActive: { color: "#14ed9e" },

  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#15161d",
    borderRadius: 12, borderWidth: 1, borderColor: "#22232d",
    paddingHorizontal: 14, height: 52,
  },
  inputRowFocused: {
    borderColor: "#14ed9e",
    shadowColor: "#14ed9e", shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  icon:  { marginRight: 10 },
  input: {
    flex: 1, color: "#fcfcfc", fontSize: 15,
    fontFamily: "Manrope_500Medium",
    // @ts-ignore
    outlineStyle: "none", borderWidth: 0,
  },

  cta: {
    backgroundColor: "#14ed9e", height: 56, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
    marginTop: 12,
    shadowColor: "#14ed9e", shadowOpacity: 0.35, shadowRadius: 14,
  },
  ctaText: { color: "#0d0e12", fontSize: 16, fontFamily: "Manrope_800ExtraBold" },

  secureRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 16 },
  secureText: { color: "#4a4d58", fontSize: 11, fontFamily: "Manrope_400Regular" },
});
