import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react-native";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [focused, setFocused] = useState<boolean>(false);

  const handleReset = () => {
    router.replace("/auth/login");
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.formContainer}>
        
        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/auth/login")}>
           <ArrowLeft size={16} color="#7e828d" />
           <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>

        <View style={styles.header}>
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
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleReset}>
          <Text style={styles.submitText}>Send Reset Link</Text>
          <ArrowRight size={18} color="#0d0e12" />
        </TouchableOpacity>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0e12", paddingHorizontal: 24, justifyContent: "center" },
  formContainer: { width: "100%" },
  backButton: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 32 },
  backText: { color: "#7e828d", fontSize: 14, fontWeight: "500" },
  header: { marginBottom: 40 },
  title: { fontSize: 28, fontWeight: "bold", color: "#fcfcfc" },
  subtitle: { fontSize: 14, color: "#7e828d", marginTop: 8, lineHeight: 22 },
  inputGroup: { gap: 16 },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#23242f", borderRadius: 12, borderWidth: 1, borderColor: "#24252e", paddingHorizontal: 16, height: 56 },
  inputWrapperFocused: { borderColor: "#14ed9e", shadowColor: "#14ed9e", shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: "#fcfcfc", fontSize: 14 },
  submitButton: { backgroundColor: "#14ed9e", height: 56, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 24, shadowColor: "#14ed9e", shadowOpacity: 0.3, shadowRadius: 10 },
  submitText: { color: "#0d0e12", fontSize: 16, fontWeight: "600" }
});
