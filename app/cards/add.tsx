import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform
} from "react-native";
import { useRouter } from "expo-router";
import { CreditCard as CardIcon, User, Calendar, Lock } from "lucide-react-native";
import CreditCard from "../../components/ui/CreditCard";

type FocusedField = "number" | "name" | "expiry" | "cvv" | null;

export default function AddNewCardPage() {
  const router = useRouter();
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [focused, setFocused] = useState<FocusedField>(null);

  const getValue = (key: FocusedField) => {
    if (key === "number") {
      return number.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
    }
    if (key === "name")   return name;
    if (key === "expiry") {
      return expiry.length > 2 ? `${expiry.slice(0, 2)}/${expiry.slice(2)}` : expiry;
    }
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
      if (c.length <= 4) {
        // Only format for the display, keep state as digits
        setExpiry(c);
      }
    } else if (key === "cvv") {
      const c = text.replace(/\D/g, "");
      if (c.length <= 4) setCvv(c);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      enabled={Platform.OS === "ios"}
    >
      {/* Fixed Card Preview at top for stability */}
      <View style={styles.previewContainer}>
        <CreditCard 
          key={`card-${number}-${name}-${expiry}-${cvv}`}
          number={number} 
          name={name} 
          expiry={expiry} 
          cvv={cvv} 
          focused={focused} 
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          {/* Card Number */}
          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, focused === "number" && styles.fieldLabelActive]}>
              Card Number
            </Text>
            <View style={styles.inputRow}>
              <CardIcon size={18} color={focused === "number" ? "#14ed9e" : "#7e828d"} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="•••• •••• •••• ••••"
                placeholderTextColor="#4a4d58"
                value={getValue("number")}
                onChangeText={(t) => handleChange("number", t)}
                onFocus={() => setFocused("number")}
                onBlur={() => {}}
                keyboardType="numeric"
                maxLength={19}
                selectionColor="#14ed9e"
                autoComplete="off"
                importantForAutofill="no"
                blurOnSubmit={false}
                // @ts-ignore
                outlineStyle="none"
              />
            </View>
          </View>

          {/* Cardholder Name */}
          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, focused === "name" && styles.fieldLabelActive]}>
              Cardholder Name
            </Text>
            <View style={styles.inputRow}>
              <User size={18} color={focused === "name" ? "#14ed9e" : "#7e828d"} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Full name on card"
                placeholderTextColor="#4a4d58"
                value={getValue("name")}
                onChangeText={(t) => handleChange("name", t)}
                onFocus={() => setFocused("name")}
                onBlur={() => {}}
                keyboardType="default"
                maxLength={40}
                selectionColor="#14ed9e"
                autoCapitalize="words"
                autoComplete="off"
                importantForAutofill="no"
                blurOnSubmit={false}
                // @ts-ignore
                outlineStyle="none"
              />
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 14 }}>
            {/* Expiry */}
            <View style={[styles.fieldBlock, { flex: 1 }]}>
              <Text style={[styles.fieldLabel, focused === "expiry" && styles.fieldLabelActive]}>
                Expiry Date
              </Text>
              <View style={styles.inputRow}>
                <Calendar size={18} color={focused === "expiry" ? "#14ed9e" : "#7e828d"} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="MM / YY"
                  placeholderTextColor="#4a4d58"
                  value={getValue("expiry")}
                  onChangeText={(t) => handleChange("expiry", t)}
                  onFocus={() => setFocused("expiry")}
                  onBlur={() => {}}
                  keyboardType="numeric"
                  maxLength={5}
                  selectionColor="#14ed9e"
                  autoComplete="off"
                  importantForAutofill="no"
                  blurOnSubmit={false}
                  // @ts-ignore
                  outlineStyle="none"
                />
              </View>
            </View>

            {/* CVV */}
            <View style={[styles.fieldBlock, { flex: 1 }]}>
              <Text style={[styles.fieldLabel, focused === "cvv" && styles.fieldLabelActive]}>
                CVV / CVC
              </Text>
              <View style={styles.inputRow}>
                <Lock size={18} color={focused === "cvv" ? "#14ed9e" : "#7e828d"} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="•••"
                  placeholderTextColor="#4a4d58"
                  value={getValue("cvv")}
                  onChangeText={(t) => handleChange("cvv", t)}
                  onFocus={() => setFocused("cvv")}
                  onBlur={() => {}}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={4}
                  selectionColor="#14ed9e"
                  autoComplete="off"
                  importantForAutofill="no"
                  blurOnSubmit={false}
                  // @ts-ignore
                  outlineStyle="none"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.cta}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>Save Card</Text>
          </TouchableOpacity>

          <View style={styles.secureRow}>
            <Lock size={11} color="#4a4d58" />
            <Text style={styles.secureText}>256-bit encrypted · Never stored in plaintext</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: "#0d0e12" },
  scroll: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 48 },

  previewContainer: {
    paddingHorizontal: 22,
    paddingTop: 10,
    backgroundColor: "#0d0e12",
  },

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
