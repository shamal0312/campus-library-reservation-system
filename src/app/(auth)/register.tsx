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
const ERROR = "#DC2626";

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
  autoCapitalize?: "none" | "words" | "characters";
  onToggleSecure?: () => void;
  secureVisible?: boolean;
  error?: string;
  maxLength?: number;
};

type FormErrors = {
  fullName?: string;
  universityId?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
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
  error,
  maxLength,
}: FieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <View style={[styles.field, error ? styles.fieldError : null]}>
        <SymbolView name={icon} size={19} tintColor={error ? ERROR : ICON} />

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
          maxLength={maxLength}
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
              tintColor={error ? ERROR : ICON}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? <Text style={styles.fieldErrorText}>{error}</Text> : null}
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

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  function clearFieldError(field: keyof FormErrors) {
    setFormErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  async function handleRegister() {
    setErrorMessage(null);
    setSuccessMessage(null);

    const errors: FormErrors = {};

    const trimmedName = fullName.trim();
    const trimmedId = universityId.trim().toUpperCase();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      errors.fullName = "Full name is required.";
    } else if (trimmedName.length < 2) {
      errors.fullName = "Please enter a valid full name.";
    } else if (!/^[A-Za-z\s.'-]+$/.test(trimmedName)) {
      errors.fullName = "Full name can only contain letters.";
    }

    const studentIdPattern = /^[A-Z]{2}\d{8}$/;

    if (!trimmedId) {
      errors.universityId = "SLIIT Student ID is required.";
    } else if (!studentIdPattern.test(trimmedId)) {
      errors.universityId = "Enter a valid SLIIT Student ID";
    }

    if (!phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(phone)) {
      errors.phone = "Phone number must contain exactly 10 digits.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      errors.email = "Email address is required.";
    } else if (!emailPattern.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address.";
    } else if (trimmedEmail.endsWith("@my.sliit.lk")) {
      const sliitEmailId = trimmedEmail.replace("@my.sliit.lk", "");

      if (sliitEmailId !== trimmedId.toLowerCase()) {
        errors.email = "SLIIT email must match your SLIIT Student ID.";
      }
    }

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*?_+-])[A-Za-z\d!@#$%^&*?_+-]{8,}$/;

    if (!password) {
      errors.password = "Password is required.";
    } else if (!passwordPattern.test(password)) {
      errors.password =
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    const result = await signUp({
      fullName: trimmedName,
      universityId: trimmedId,
      phone: phone.trim(),
      email: trimmedEmail,
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

    setSuccessMessage(
      "Account created successfully! Please log in to continue to Smart Library.",
    );

    setTimeout(() => {
      router.replace("/login");
    }, 1200);
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
            onChangeText={(value) => {
              setFullName(value);
              clearFieldError("fullName");
            }}
            autoCapitalize="words"
            error={formErrors.fullName}
          />

          <Field
            icon={{
              ios: "person.text.rectangle",
              android: "badge",
              web: "badge",
            }}
            placeholder="SLIIT Student ID"
            value={universityId}
            onChangeText={(value) => {
              const cleanedValue = value
                .replace(/[^A-Za-z0-9]/g, "")
                .toUpperCase()
                .slice(0, 10);

              setUniversityId(cleanedValue);
              clearFieldError("universityId");
              clearFieldError("email");
            }}
            autoCapitalize="characters"
            maxLength={10}
            error={formErrors.universityId}
          />

          <Field
            icon={{
              ios: "phone",
              android: "call",
              web: "call",
            }}
            placeholder="Phone Number"
            value={phone}
            onChangeText={(value) => {
              const numbersOnly = value.replace(/\D/g, "").slice(0, 10);

              setPhone(numbersOnly);
              clearFieldError("phone");
            }}
            keyboardType="phone-pad"
            maxLength={10}
            error={formErrors.phone}
          />

          <Field
            icon={{
              ios: "envelope",
              android: "mail",
              web: "mail",
            }}
            placeholder="Email Address"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              clearFieldError("email");
            }}
            keyboardType="email-address"
            error={formErrors.email}
          />

          <Field
            icon={{
              ios: "lock",
              android: "lock",
              web: "lock",
            }}
            placeholder="Password"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              clearFieldError("password");
              clearFieldError("confirmPassword");
            }}
            secureTextEntry={!showPassword}
            onToggleSecure={() => setShowPassword((current) => !current)}
            secureVisible={showPassword}
            error={formErrors.password}
          />

          <Field
            icon={{
              ios: "lock",
              android: "lock",
              web: "lock",
            }}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              clearFieldError("confirmPassword");
            }}
            secureTextEntry={!showConfirmPassword}
            onToggleSecure={() => setShowConfirmPassword((current) => !current)}
            secureVisible={showConfirmPassword}
            error={formErrors.confirmPassword}
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

  fieldContainer: {
    width: "100%",
    marginBottom: 10,
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
  },

  fieldError: {
    borderColor: ERROR,
    backgroundColor: "#FFF7F7",
  },

  fieldErrorText: {
    marginTop: 4,
    marginLeft: 4,
    color: ERROR,
    fontSize: 11,
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
    color: ERROR,
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
