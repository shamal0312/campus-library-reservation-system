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

const ICON = "#98A2B3";

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
      <SymbolView name={icon} size={20} tintColor={ICON} />

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
            size={20}
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
            size={22}
            tintColor="#1A1D26"
          />
        </Pressable>

        <Text style={styles.title}>Create Your Account</Text>

        <Text style={styles.subtitle}>
          Join Smart Library and get access to all the facilities
        </Text>

        <Field
          icon={{ ios: "person", android: "person", web: "person" }}
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
          icon={{ ios: "phone", android: "call", web: "call" }}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Field
          icon={{ ios: "envelope", android: "mail", web: "mail" }}
          placeholder="University Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Field
          icon={{ ios: "lock", android: "lock", web: "lock" }}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          onToggleSecure={() => setShowPassword((current) => !current)}
          secureVisible={showPassword}
        />

        <Field
          icon={{ ios: "lock", android: "lock", web: "lock" }}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          onToggleSecure={() => setShowConfirmPassword((current) => !current)}
          secureVisible={showConfirmPassword}
        />

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        {successMessage ? (
          <Text style={styles.success}>{successMessage}</Text>
        ) : null}

        <Pressable
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Text>
        </Pressable>

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
    backgroundColor: "#ffffff",
  },

  content: {
    paddingHorizontal: 24,
    gap: 14,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1D26",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#8B93A7",
    textAlign: "center",
    marginBottom: 8,
  },

  field: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#F4F6FA",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#1A1D26",
  },

  error: {
    color: "#D92D20",
    fontSize: 14,
    textAlign: "center",
  },

  success: {
    color: "#15803D",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },

  button: {
    marginTop: 10,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#3B5CCC",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "600",
  },

  footer: {
    textAlign: "center",
    color: "#8B93A7",
    fontSize: 15,
  },

  footerLink: {
    color: "#3B5CCC",
    fontWeight: "700",
  },
});
