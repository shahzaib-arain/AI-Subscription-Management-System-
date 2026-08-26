import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter, Link } from "expo-router";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";

import KeyboardAvoidingWrapper from "../../components/KeyboardAvoidingWrapper";
import { isValidEmail } from "../../utils/validation";
import { useAutoDismiss } from "../../hooks/use-auto-dismiss";

export default function SignInPage() {
  const router = useRouter();
  const [focused, setFocused] = useState<string | null>(null);

  const { login, error: apiError, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // A failed attempt on another screen (e.g. Login) leaves its error sitting
  // in shared AuthContext state — clear it the moment this screen opens so
  // it doesn't appear to belong to this screen.
  useEffect(() => {
    clearError();
  }, []);

  // Every error here — local validation or the API's — clears itself after
  // a few seconds instead of sitting on screen indefinitely.
  useAutoDismiss(validationError, () => setValidationError(null));
  useAutoDismiss(apiError, clearError);

  // Live feedback as the user types, instead of only after pressing "Sign In".
  const emailError = email.length > 0 && !isValidEmail(email) ? "Enter a valid email address." : null;
  const isEmailValid = email.length > 0 && !emailError;

  const handleSignIn = async () => {
    setValidationError(null);
    clearError();

    if (!email.trim() || !password) {
      setValidationError("Please enter your email and password.");
      return;
    }

    if (!isValidEmail(email)) {
      setValidationError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await login({
        email: email.trim(),
        password,
      });
      router.replace("/(tabs)");
    } catch (err: any) {
      // error is handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const displayError = validationError || apiError;

  return (
    <KeyboardAvoidingWrapper contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>NP</Text>
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue to NeuroPay</Text>
        </View>

        {displayError && (
          <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutUp.duration(200)} style={styles.errorAlert}>
            <Text style={styles.errorAlertText}>{displayError}</Text>
          </Animated.View>
        )}

        <View style={styles.inputGroup}>
          <View style={styles.fieldBlock}>
            <View style={[styles.inputWrapper, emailError && styles.inputWrapperError]}>
              <Mail size={20} color={emailError ? "#f52222" : focused === "email" ? "#14ed9e" : "#7e828d"} style={styles.inputIcon} />
              <TextInput
                placeholder="Email address"
                placeholderTextColor="#7e828d"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                selectionColor="#14ed9e"
                autoComplete="off"
                importantForAutofill="no"
                blurOnSubmit={false}
              />
              {isEmailValid && <CheckCircle2 size={18} color="#14ed9e" />}
            </View>
            {emailError && <Text style={styles.fieldErrorText}>{emailError}</Text>}
          </View>
          <View style={styles.inputWrapper}>
            <Lock size={20} color={focused === "password" ? "#14ed9e" : "#7e828d"} style={styles.inputIcon} />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#7e828d"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
              selectionColor="#14ed9e"
              autoComplete="off"
              importantForAutofill="no"
              blurOnSubmit={false}
            />
          </View>
        </View>
        
        <View style={styles.forgotWrapper}>
          <Link href="/auth/forgot-password" asChild>
            <TouchableOpacity>
               <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0d0e12" />
          ) : (
            <>
              <Text style={styles.submitText}>Sign In</Text>
              <ArrowRight size={18} color="#0d0e12" />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/auth/signup" asChild>
            <TouchableOpacity>
               <Text style={styles.linkText}>Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingWrapper>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    paddingHorizontal: 24, 
    justifyContent: "center",
    paddingBottom: 20 
  },
  formContainer: { width: "100%", paddingTop: 40 },
  header: { alignItems: "center", marginBottom: 32, marginTop: 20 },
  logoContainer: { width: 64, height: 64, borderRadius: 16, backgroundColor: "#14ed9e", alignItems: "center", justifyContent: "center", marginBottom: 24, shadowColor: "#14ed9e", shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  logoText: { color: "#0d0e12", fontSize: 24, fontWeight: "bold", fontFamily: "Manrope_700Bold" },
  title: { fontSize: 28, fontWeight: "bold", color: "#fcfcfc", fontFamily: "Manrope_700Bold" },
  subtitle: { fontSize: 14, color: "#7e828d", marginTop: 8, fontFamily: "Manrope_400Regular" },
  inputGroup: { gap: 16 },
  fieldBlock: { gap: 0 },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#23242f", borderRadius: 12, borderWidth: 1, borderColor: "#24252e", paddingHorizontal: 16, height: 56 },
  inputWrapperFocused: { borderColor: "#14ed9e", shadowColor: "#14ed9e", shadowOpacity: 0.15, shadowRadius: 10, elevation: 4 },
  inputWrapperError: { borderColor: "#f52222" },
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
  fieldErrorText: {
    color: "#f52222",
    fontSize: 12,
    fontFamily: "Manrope_500Medium",
    marginTop: 6,
    marginLeft: 4,
  },
  forgotWrapper: { alignItems: "flex-end", marginTop: 12, marginBottom: 24 },
  forgotText: { color: "#14ed9e", fontSize: 12, fontWeight: "600", fontFamily: "Manrope_600SemiBold" },
  submitButton: { backgroundColor: "#14ed9e", height: 56, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, shadowColor: "#14ed9e", shadowOpacity: 0.3, shadowRadius: 10 },
  submitText: { color: "#0d0e12", fontSize: 16, fontWeight: "600", fontFamily: "Manrope_700Bold" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 32 },
  footerText: { color: "#7e828d", fontSize: 14, fontFamily: "Manrope_400Regular" },
  linkText: { color: "#14ed9e", fontSize: 14, fontWeight: "600", fontFamily: "Manrope_600SemiBold" },
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
  }
});
