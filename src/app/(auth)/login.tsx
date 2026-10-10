import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { useAuth } from "@/contexts/auth-context";

const PRIMARY = "#4F6FD8";
const PRIMARY_DARK = "#3F5FBF";
const BACKGROUND = "#F4F7FB";
const TEXT = "#1F2937";
const MUTED = "#6B7280";
const BORDER = "#DCE3EC";
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
  const { height } = useWindowDimensions();

  const { signIn, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const isSmallScreen = height < 750;

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

    const universityId = result.session.user.user_metadata?.university_id;

    if (!universityId) {
      router.replace("/complete-profile");
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
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 32,
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
            size={21}
            tintColor={TEXT}
          />
        </Pressable>

        <View
          style={[
            styles.headerSection,
            isSmallScreen && styles.headerSectionSmall,
          ]}
        >
          <View style={styles.logoBox}>
            <Image
              source={require("@/assets/images/app-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.brand}>Smart Library</Text>

          <Text style={styles.brandSub}>Your Learning Space</Text>

          <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>
            Welcome Back!
          </Text>

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
              returnKeyType="next"
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
              returnKeyType="done"
              onSubmitEditing={handleLogin}
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
              colors={["#6280DF", PRIMARY, PRIMARY_DARK]}
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
            tintColor={PRIMARY}
          />

          <Text style={styles.infoText}>
            Sign in using your email address or continue with Google.
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
    backgroundColor: BACKGROUND,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    backgroundColor: BACKGROUND,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },

  headerSection: {
    alignItems: "center",
    marginTop: 14,
    marginBottom: 20,
  },

  headerSectionSmall: {
    marginTop: 8,
    marginBottom: 14,
  },

  logoBox: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 10,
    shadowColor: "#64748B",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  logo: {
    width: 62,
    height: 62,
  },

  brand: {
    fontSize: 19,
    fontWeight: "800",
    color: TEXT,
  },

  brandSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "500",
    color: MUTED,
  },

  title: {
    marginTop: 18,
    fontSize: 27,
    fontWeight: "800",
    color: TEXT,
  },

  titleSmall: {
    marginTop: 12,
    fontSize: 25,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: MUTED,
    textAlign: "center",
  },

  formCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#64748B",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 7,
    marginTop: 2,
  },

  field: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 14,
  },

  input: {
    flex: 1,
    minHeight: 50,
    fontSize: 15,
    color: TEXT,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 13,
  },

  error: {
    flex: 1,
    color: "#DC2626",
    fontSize: 13,
    lineHeight: 18,
  },

  buttonWrapper: {
    height: 52,
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 2,
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
    marginVertical: 15,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER,
  },

  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: "600",
    color: ICON,
  },

  googleButton: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 12,
  },

  googleButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT,
  },

  infoCard: {
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: "#EEF3FF",
    borderWidth: 1,
    borderColor: "#D7E1FA",
    paddingHorizontal: 13,
    paddingVertical: 12,
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
    marginTop: 18,
    marginBottom: 8,
    textAlign: "center",
    color: MUTED,
    fontSize: 14,
  },

  footerLink: {
    color: PRIMARY,
    fontWeight: "700",
  },
});
