import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "../context/AuthContext";

export default function AuthScreen() {
  const router = useRouter();

  const { signIn, signUp } = useAuth();

  const [mode, setMode] =
    useState<"login" | "signup">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        "Missing information",
        "Enter your email and password."
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Password too short",
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const result =
        mode === "login"
          ? await signIn(email, password)
          : await signUp(email, password);

      if (result.error) {
        Alert.alert("Error", result.error);
        return;
      }

      if (result.needsEmailConfirmation) {
        Alert.alert(
          "Check your email",
          "Your account was created. Confirm your email, then sign in."
        );

        setMode("login");
        setPassword("");

        return;
      }

      router.replace("/");
    } catch (error) {
      console.error("Auth error:", error);

      Alert.alert(
        "Error",
        "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode((currentMode) =>
      currentMode === "login"
        ? "signup"
        : "login"
    );

    setPassword("");
  }

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <Text style={styles.brand}>
          WARDROBE
        </Text>

        <Text style={styles.title}>
          {mode === "login"
            ? "Welcome back"
            : "Create account"}
        </Text>

        <Text style={styles.subtitle}>
          {mode === "login"
            ? "Sign in to access your wardrobe."
            : "Create an account to save your wardrobe."}
        </Text>

        <Text style={styles.label}>
          EMAIL
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor="#999999"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          editable={!loading}
          style={styles.input}
        />

        <Text style={styles.label}>
          PASSWORD
        </Text>

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="At least 6 characters"
          placeholderTextColor="#999999"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          editable={!loading}
          onSubmitEditing={handleSubmit}
          style={styles.input}
        />

        <Pressable
          disabled={loading}
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.primaryButton,
            loading && styles.disabledButton,
            pressed && !loading && styles.pressedButton,
          ]}
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator
                color="#FFFFFF"
              />

              <Text
                style={styles.primaryButtonText}
              >
                {mode === "login"
                  ? "Signing in..."
                  : "Creating account..."}
              </Text>
            </View>
          ) : (
            <Text style={styles.primaryButtonText}>
              {mode === "login"
                ? "Sign in"
                : "Create account"}
            </Text>
          )}
        </Pressable>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}
          </Text>

          <Pressable
            disabled={loading}
            onPress={switchMode}
          >
            <Text style={styles.switchButton}>
              {mode === "login"
                ? "Create one"
                : "Sign in"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F7F7F5",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },

  card: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    padding: 28,
    borderRadius: 24,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },

  brand: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    color: "#888888",
    marginBottom: 12,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111111",
    letterSpacing: -0.6,
  },

  subtitle: {
    fontSize: 14,
    color: "#777777",
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 26,
  },

  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#777777",
    marginBottom: 8,
    marginTop: 16,
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E4E4E0",
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111111",
    backgroundColor: "#FAFAF8",
  },

  primaryButton: {
    marginTop: 26,
    backgroundColor: "#111111",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },

  disabledButton: {
    opacity: 0.55,
  },

  pressedButton: {
    opacity: 0.85,
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  switchRow: {
    marginTop: 22,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
  },

  switchText: {
    fontSize: 14,
    color: "#777777",
  },

  switchButton: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
  },
});