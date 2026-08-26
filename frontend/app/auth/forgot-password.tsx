import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react-native";

import KeyboardAvoidingWrapper from "../../components/KeyboardAvoidingWrapper";
import { authApi } from "../../services/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [focused, setFocused] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleReset = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword({ email: email.trim() });
      setSuccessMessage(
        "If an account exists for that email address, a reset link has been sent. Check your inbox and spam folder."
      );
    } catch (error: any) {
      setErrorMessage(error?.message || "Unable to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingWrapper contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        
        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/auth/login")}>
           <ArrowLeft size={16} color="#7e828d" />
           <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>NP</Text>
          </View>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter the email address associated with your account and we'll send you a link to reset your password.
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
            <Mail size={20} color={focused ? "#14ed9e" : "#7e828d"} style={styles.inputIcon} />
            <TextInput
              placeholder="Email address"
              placeholderTextColor="#7e828d"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              selectionColor="#14ed9e"
              autoComplete="off"
              importantForAutofill="no"
              blurOnSubmit={false}
            />
          </View>
        </View>

        {errorMessage ? (
          <View style={styles.errorAlert}>
            <Text style={styles.errorAlertText}>{errorMessage}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View style={styles.successAlert}>
            <Text style={styles.successAlertText}>{successMessage}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.submitButton} onPress={handleReset} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#0d0e12" />
          ) : (
            <>
              <Text style={styles.submitText}>Send Reset Link</Text>
              <ArrowRight size={18} color="#0d0e12" />
            </>
          )}
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingWrapper>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    paddingHorizontal: 24, 
    justifyContent: "center", 
    paddingTop: 80, 
    paddingBottom: 40 
  },
  formContainer: { width: "100%" },
  backButton: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 32, alignSelf: "flex-start" },
  backText: { color: "#7e828d", fontSize: 14, fontWeight: "500", fontFamily: "Manrope_500Medium" },
  header: { alignItems: "center", marginBottom: 40 },
  logoContainer: { width: 64, height: 64, borderRadius: 16, backgroundColor: "#14ed9e", alignItems: "center", justifyContent: "center", marginBottom: 24, shadowColor: "#14ed9e", shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  logoText: { color: "#0d0e12", fontSize: 24, fontWeight: "bold", fontFamily: "Manrope_700Bold" },
  title: { fontSize: 28, fontWeight: "bold", color: "#fcfcfc", fontFamily: "Manrope_700Bold" },
  subtitle: { fontSize: 14, color: "#7e828d", marginTop: 8, lineHeight: 22, textAlign: "center", fontFamily: "Manrope_400Regular" },
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
  submitButton: { backgroundColor: "#14ed9e", height: 56, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 24, shadowColor: "#14ed9e", shadowOpacity: 0.3, shadowRadius: 10 },
  submitText: { color: "#0d0e12", fontSize: 16, fontWeight: "600", fontFamily: "Manrope_700Bold" },
  errorAlert: {
    backgroundColor: "rgba(245, 34, 34, 0.15)",
    borderWidth: 1,
    borderColor: "#f52222",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: "100%",
  },
  errorAlertText: {
    color: "#ff4e83",
    fontSize: 14,
    fontFamily: "Manrope_500Medium",
    textAlign: "center",
  },
  successAlert: {
    backgroundColor: "rgba(20, 237, 158, 0.16)",
    borderWidth: 1,
    borderColor: "#14ed9e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: "100%",
  },
  successAlertText: {
    color: "#d1ffd6",
    fontSize: 14,
    fontFamily: "Manrope_500Medium",
    textAlign: "center",
  }
});
