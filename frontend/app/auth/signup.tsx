import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useRouter, Link } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Mail, Lock, User, ArrowRight } from "lucide-react-native";

import KeyboardAvoidingWrapper from "../../components/KeyboardAvoidingWrapper";

export default function SignUpPage() {
  const router = useRouter();
  const [focused, setFocused] = useState<string | null>(null);

  const handleSignUp = () => {
    router.replace("/auth/add-card");
  };

  return (
    <KeyboardAvoidingWrapper contentContainerStyle={styles.scrollContent}>
      <View style={styles.formContainer}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>NP</Text>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join NeuroPay to secure your future</Text>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputWrapper}>
            <User size={20} color={focused === "name" ? "#14ed9e" : "#7e828d"} style={styles.inputIcon} />
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#7e828d"
              style={styles.input}
              autoCapitalize="words"
              onFocus={() => {
                setTimeout(() => setFocused("name"), 50);
              }}
              onBlur={() => {}}
              selectionColor="#14ed9e"
              autoComplete="off"
              importantForAutofill="no"
              blurOnSubmit={false}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Mail size={20} color={focused === "email" ? "#14ed9e" : "#7e828d"} style={styles.inputIcon} />
            <TextInput
              placeholder="Email address"
              placeholderTextColor="#7e828d"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => {
                setTimeout(() => setFocused("email"), 50);
              }}
              onBlur={() => {}}
              selectionColor="#14ed9e"
              autoComplete="off"
              importantForAutofill="no"
              blurOnSubmit={false}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Lock size={20} color={focused === "password" ? "#14ed9e" : "#7e828d"} style={styles.inputIcon} />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#7e828d"
              style={styles.input}
              secureTextEntry
              onFocus={() => {
                setTimeout(() => setFocused("password"), 50);
              }}
              onBlur={() => {}}
              selectionColor="#14ed9e"
              autoComplete="off"
              importantForAutofill="no"
              blurOnSubmit={false}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Lock size={20} color={focused === "confirm" ? "#14ed9e" : "#7e828d"} style={styles.inputIcon} />
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#7e828d"
              style={styles.input}
              secureTextEntry
              onFocus={() => {
                setTimeout(() => setFocused("confirm"), 50);
              }}
              onBlur={() => {}}
              selectionColor="#14ed9e"
              autoComplete="off"
              importantForAutofill="no"
              blurOnSubmit={false}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSignUp}>
          <Text style={styles.submitText}>Create Account</Text>
          <ArrowRight size={18} color="#0d0e12" />
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/auth/login" asChild>
            <TouchableOpacity>
               <Text style={styles.linkText}>Sign in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0e12" },
  scrollContent: { 
    flexGrow: 1, 
    paddingHorizontal: 24, 
    justifyContent: "center", 
    paddingTop: 80, 
    paddingBottom: 40 
  },
  formContainer: { width: "100%" },
  header: { alignItems: "center", marginBottom: 32 },
  logoContainer: { width: 64, height: 64, borderRadius: 16, backgroundColor: "#14ed9e", alignItems: "center", justifyContent: "center", marginBottom: 24, shadowColor: "#14ed9e", shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  logoText: { color: "#0d0e12", fontSize: 24, fontWeight: "bold", fontFamily: "Manrope_700Bold" },
  title: { fontSize: 28, fontWeight: "bold", color: "#fcfcfc", fontFamily: "Manrope_700Bold" },
  subtitle: { fontSize: 14, color: "#7e828d", marginTop: 8, fontFamily: "Manrope_400Regular" },
  inputGroup: { gap: 16 },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#23242f", borderRadius: 12, borderWidth: 1, borderColor: "#24252e", paddingHorizontal: 16, height: 56 },
  inputWrapperFocused: { borderColor: "#14ed9e", shadowColor: "#14ed9e", shadowOpacity: 0.15, shadowRadius: 10, elevation: 4 },
  inputIcon: { marginRight: 12 },
  input: { 
    flex: 1, 
    color: "#fcfcfc", 
    fontSize: 15,
    // @ts-ignore
    outlineWidth: 0,
    // @ts-ignore
    outlineStyle: 'none',
    borderWidth: 0,
    fontFamily: "Manrope_400Regular"
  },
  submitButton: { backgroundColor: "#14ed9e", height: 56, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 32, shadowColor: "#14ed9e", shadowOpacity: 0.3, shadowRadius: 10 },
  submitText: { color: "#0d0e12", fontSize: 16, fontWeight: "600", fontFamily: "Manrope_700Bold" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 32 },
  footerText: { color: "#7e828d", fontSize: 14, fontFamily: "Manrope_400Regular" },
  linkText: { color: "#14ed9e", fontSize: 14, fontWeight: "600", fontFamily: "Manrope_600SemiBold" }
});
