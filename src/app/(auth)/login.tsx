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
import Svg, { Path } from "react-native-svg";

import { useAuth } from "@/contexts/auth-context";

const ICON = "#94A3B8";

function GoogleIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />

      <Path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />

      <Path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />

      <Path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </Svg>
  );
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();

  const { signIn, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

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
      return;
    }

    router.replace("/account");
  }

  async function handleGoogleSignIn() {
    setErrorMessage(null);
    setIsGoogleSubmitting(true);

    const result = await signInWithGoogle();

    setIsGoogleSubmitting(false);

    if (result?.error) {
      setErrorMessage(result.error);
      return;
    }

    if (!result?.session) {
      return;
    }

    const role = result.session.user.user_metadata?.role;

    if (role !== "student" && role !== "lecturer") {
      router.replace("/role");
      return;
    }

    router.replace("/account");
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
              colors={["#4F70D6", "#3F5FBF", "#304A9B"]}
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

          <Text style={styles.brand}>Smart Library</Text>
          <Text style={styles.brandSub}>Your Learning Space</Text>

          <Text style={styles.title}>Welcome Back!</Text>

          <Text style={styles.subtitle}>Sign in to continue</Text>
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
              placeholder="Email"
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
            disabled={isSubmitting || isGoogleSubmitting}
          >
            <LinearGradient
              colors={["#4F70D6", "#3F5FBF", "#304A9B"]}
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

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />

            <Text style={styles.dividerText}>OR</Text>

            <View style={styles.dividerLine} />
          </View>

          <Pressable
            style={[
              styles.googleButton,
              isGoogleSubmitting && styles.buttonDisabled,
            ]}
            onPress={handleGoogleSignIn}
            disabled={isGoogleSubmitting || isSubmitting}
          >
            <GoogleIcon />

            <Text style={styles.googleButtonText}>
              {isGoogleSubmitting ? "Connecting..." : "Continue with Google"}
            </Text>
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
            tintColor="#3F5FBF"
          />

          <Text style={styles.infoText}>
            Sign in using your registered library account or continue with
            Google.
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
    backgroundColor: "#E9EEF5",
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
    borderColor: "#D9E0EA",
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
    color: "#1F2937",
  },

  brandSub: {
    marginTop: 2,
    fontSize: 12,
    color: "#7C879A",
  },

  title: {
    marginTop: 26,
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
  },

  subtitle: {
    marginTop: 7,
    fontSize: 14,
    color: "#7C879A",
    textAlign: "center",
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#D9E0EA",

    shadowColor: "#1F2937",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,

    elevation: 3,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    marginTop: 4,
  },

  field: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#DDE3EC",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 15,
    gap: 11,

    marginBottom: 16,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
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
    borderRadius: 14,
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

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D9E0EA",
  },

  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
  },

  googleButton: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D9E0EA",
    backgroundColor: "#FFFFFF",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 10,
  },

  googleButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },

  infoCard: {
    marginTop: 18,
    borderRadius: 14,
    backgroundColor: "#E7ECFA",
    borderWidth: 1,
    borderColor: "#CCD7F4",
    padding: 14,

    flexDirection: "row",
    alignItems: "flex-start",

    gap: 9,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: "#4B5563",
  },

  footer: {
    marginTop: 24,
    textAlign: "center",
    color: "#7C879A",
    fontSize: 14,
  },

  footerLink: {
    color: "#3F5FBF",
    fontWeight: "700",
  },
});
