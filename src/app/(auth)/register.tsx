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
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/auth-context";

const PRIMARY = "#4F6FD8";
const PRIMARY_DARK = "#3F5FBF";
const BACKGROUND = "#F4F7FB";
const TEXT = "#1F2937";
const MUTED = "#6B7280";
const BORDER = "#DCE3EC";
const ICON = "#94A3B8";

type FieldIcon = {
  ios: "person" | "person.text.rectangle" | "phone" | "envelope" | "lock";
  android: "person" | "badge" | "call" | "mail" | "lock";
  web: "person" | "badge" | "call" | "mail" | "lock";
};

type FieldProps = {
  icon: FieldIcon;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "words";
  onToggleSecure?: () => void;
  secureVisible?: boolean;
};

function Field({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "none",
  onToggleSecure,
  secureVisible,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <SymbolView name={icon} size={19} tintColor={ICON} />

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={ICON}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />

      {onToggleSecure ? (
        <Pressable onPress={onToggleSecure} hitSlop={8}>
          <SymbolView
            name={{
              ios: secureVisible ? "eye.slash" : "eye",
              android: secureVisible ? "visibility_off" : "visibility",
              web: secureVisible ? "visibility_off" : "visibility",
            }}
            size={19}
            tintColor={ICON}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (
      !fullName.trim() ||
      !universityId.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const result = await signUp({
      fullName: fullName.trim(),
      universityId: universityId.trim(),
      phone: phone.trim(),
      email: email.trim(),
      password,
    });

    setIsSubmitting(false);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    if (!result.user) {
      setErrorMessage("Could not create your account. Please try again.");
      return;
    }

    if (result.session) {
      router.replace("/role");
      return;
    }

    setSuccessMessage(
      "Account created successfully. Please verify your email, then login to continue.",
    );
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
            paddingBottom: insets.bottom + 24,
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

        <View style={styles.headerSection}>
          <View style={styles.logoBox}>
            <Image
              source={require("@/assets/images/app-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Create Account</Text>

          <Text style={styles.subtitle}>Join Smart Library</Text>
        </View>

        <View style={styles.formCard}>
          <Field
            icon={{
              ios: "person",
              android: "person",
              web: "person",
            }}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />

          <Field
            icon={{
              ios: "person.text.rectangle",
              android: "badge",
              web: "badge",
            }}
            placeholder="Student ID / Staff ID"
            value={universityId}
            onChangeText={setUniversityId}
          />

          <Field
            icon={{
              ios: "phone",
              android: "call",
              web: "call",
            }}
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Field
            icon={{
              ios: "envelope",
              android: "mail",
              web: "mail",
            }}
            placeholder="University Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Field
            icon={{
              ios: "lock",
              android: "lock",
              web: "lock",
            }}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            onToggleSecure={() => setShowPassword((current) => !current)}
            secureVisible={showPassword}
          />

          <Field
            icon={{
              ios: "lock",
              android: "lock",
              web: "lock",
            }}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            onToggleSecure={() => setShowConfirmPassword((current) => !current)}
            secureVisible={showConfirmPassword}
          />

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.error}>{errorMessage}</Text>
            </View>
          ) : null}

          {successMessage ? (
            <View style={styles.successBox}>
              <Text style={styles.success}>{successMessage}</Text>
            </View>
          ) : null}

          <Pressable
            style={[
              styles.buttonWrapper,
              isSubmitting && styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={isSubmitting}
          >
            <LinearGradient
              colors={["#6280DF", PRIMARY, PRIMARY_DARK]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        <Text style={styles.footer}>
          Already have an account?{" "}
          <Text style={styles.footerLink} onPress={() => router.push("/login")}>
            Login
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
    width: 38,
    height: 38,

    borderRadius: 12,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: BORDER,
  },

  headerSection: {
    alignItems: "center",

    marginTop: 4,
    marginBottom: 12,
  },

  logoBox: {
    width: 58,
    height: 58,

    borderRadius: 16,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: BORDER,

    marginBottom: 7,

    shadowColor: "#64748B",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,

    elevation: 2,
  },

  logo: {
    width: 42,
    height: 42,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",

    color: TEXT,

    textAlign: "center",
  },

  subtitle: {
    marginTop: 3,

    fontSize: 13,

    color: MUTED,

    textAlign: "center",
  },

  formCard: {
    width: "100%",

    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    padding: 16,

    borderWidth: 1,
    borderColor: BORDER,

    shadowColor: "#64748B",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,

    elevation: 2,
  },

  field: {
    height: 48,

    borderRadius: 12,

    backgroundColor: "#F8FAFC",

    borderWidth: 1,
    borderColor: BORDER,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 13,

    gap: 9,

    marginBottom: 10,
  },

  input: {
    flex: 1,

    fontSize: 14,

    color: TEXT,
  },

  errorBox: {
    borderRadius: 10,

    backgroundColor: "#FEF2F2",

    padding: 9,

    marginBottom: 10,
  },

  error: {
    color: "#DC2626",

    fontSize: 12,

    textAlign: "center",
  },

  successBox: {
    borderRadius: 10,

    backgroundColor: "#F0FDF4",

    padding: 9,

    marginBottom: 10,
  },

  success: {
    color: "#15803D",

    fontSize: 12,
    lineHeight: 17,

    textAlign: "center",
  },

  buttonWrapper: {
    height: 48,

    borderRadius: 12,

    overflow: "hidden",

    marginTop: 2,
  },

  button: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    color: "#FFFFFF",

    fontSize: 15,
    fontWeight: "700",
  },

  footer: {
    marginTop: 13,
    marginBottom: 6,

    textAlign: "center",

    color: MUTED,

    fontSize: 13,
  },

  footerLink: {
    color: PRIMARY,

    fontWeight: "700",
  },
});
