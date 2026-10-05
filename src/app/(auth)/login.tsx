import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/auth-context";

const ICON = "#94A3B8";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setErrorMessage("Enter your email and password.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const result = await signIn(email.trim(), password);

    setIsSubmitting(false);

    if (result.error || !result.session) {
      setErrorMessage(result.error ?? "Could not sign in.");
      return;
    }

    const role = result.session.user.user_metadata?.role;

    if (role !== "student" && role !== "lecturer") {
      router.replace("/role");
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 10,
            paddingBottom: insets.bottom + 28,
          },
        ]}
      >
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={8}
        >
          <SymbolView
            name={{
              ios: "chevron.left",
              android: "arrow_back",
              web: "arrow_back",
            }}
            size={22}
            tintColor="#0F172A"
          />
        </Pressable>

        <View style={styles.headerSection}>
          <View style={styles.logoBox}>
            <LinearGradient
              colors={["#3B82F6", "#2563EB", "#1D4ED8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}
            >
              <SymbolView
                name={{
                  ios: "books.vertical.fill",
                  android: "local_library",
                  web: "local_library",
                }}
                size={34}
                tintColor="#FFFFFF"
              />
            </LinearGradient>
          </View>

          <Text style={styles.brand}>SLIIT Library</Text>
          <Text style={styles.brandSub}>Learning Commons</Text>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to manage your library activities
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Email</Text>

          <View style={styles.field}>
            <SymbolView
              name={{
                ios: "envelope",
                android: "mail",
                web: "mail",
              }}
              size={20}
              tintColor={ICON}
            />

            <TextInput
              style={styles.input}
              placeholder="University Email"
              placeholderTextColor={ICON}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={styles.label}>Password</Text>

          <View style={styles.field}>
            <SymbolView
              name={{
                ios: "lock",
                android: "lock",
                web: "lock",
              }}
              size={20}
              tintColor={ICON}
            />

            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={ICON}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Pressable
              onPress={() => setShowPassword((current) => !current)}
              hitSlop={8}
            >
              <SymbolView
                name={{
                  ios: showPassword ? "eye.slash" : "eye",
                  android: showPassword ? "visibility_off" : "visibility",
                  web: showPassword ? "visibility_off" : "visibility",
                }}
                size={20}
                tintColor={ICON}
              />
            </Pressable>
          </View>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <SymbolView
                name={{
                  ios: "exclamationmark.circle.fill",
                  android: "error",
                  web: "error",
                }}
                size={18}
                tintColor="#DC2626"
              />
              <Text style={styles.error}>{errorMessage}</Text>
            </View>
          ) : null}

          <Pressable
            style={[
              styles.buttonWrapper,
              isSubmitting && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            <LinearGradient
              colors={["#3B82F6", "#2563EB", "#1D4ED8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Text>

              {!isSubmitting ? (
                <SymbolView
                  name={{
                    ios: "arrow.right",
                    android: "arrow_forward",
                    web: "arrow_forward",
                  }}
                  size={19}
                  tintColor="#FFFFFF"
                />
              ) : null}
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <SymbolView
            name={{
              ios: "info.circle.fill",
              android: "info",
              web: "info",
            }}
            size={19}
            tintColor="#2563EB"
          />

          <Text style={styles.infoText}>
            Sign in using the email address registered with your library
            account.
          </Text>
        </View>

        <Text style={styles.footer}>
          Don't have an account?{" "}
          <Text
            style={styles.footerLink}
            onPress={() => router.push("/register")}
          >
            Create Account
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingHorizontal: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  headerSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 28,
  },

  logoBox: {
    width: 74,
    height: 74,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 14,
  },

  logoGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  brand: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
  },

  brandSub: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
  },

  title: {
    marginTop: 26,
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 7,
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#1D4ED8",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
    marginTop: 4,
  },

  field: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    gap: 11,
    marginBottom: 16,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },

  error: {
    flex: 1,
    color: "#DC2626",
    fontSize: 13,
    lineHeight: 18,
  },

  buttonWrapper: {
    height: 54,
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 4,
  },

  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  infoCard: {
    marginTop: 18,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: "#475569",
  },

  footer: {
    marginTop: 24,
    textAlign: "center",
    color: "#64748B",
    fontSize: 14,
  },

  footerLink: {
    color: "#2563EB",
    fontWeight: "700",
  },
});
