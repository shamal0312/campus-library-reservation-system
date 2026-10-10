import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/auth-context";

const BLUE = "#2F80ED";
const NAVY = "#102A43";
const BACKGROUND = "#F2F6FC";
const MUTED = "#718096";
const LIGHT_BLUE = "#EAF4FF";
const BORDER = "#E4EAF2";
const FIELD_BACKGROUND = "#F8FAFD";

export default function ChangePasswordScreen() {
  const insets = useSafeAreaInsets();
  const { changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  function isValidPassword(password: string) {
    return (
      password.length >= 8 &&
      /\d/.test(password) &&
      /[A-Z]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
  }

  async function handleChangePassword() {
    setErrorMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    if (!isValidPassword(newPassword)) {
      setErrorMessage("New password does not meet the password requirements.");
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage(
        "New password must be different from your current password.",
      );
      return;
    }

    setIsSubmitting(true);

    const result = await changePassword(currentPassword, newPassword);

    setIsSubmitting(false);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    Alert.alert(
      "Password Changed",
      "Your password has been changed successfully.",
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ],
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 32,
        },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Pressable
          style={styles.headerButton}
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
            tintColor={NAVY}
          />
        </Pressable>

        <Text style={styles.title}>Change Password</Text>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.securityCard}>
        <View style={styles.lockCircle}>
          <SymbolView
            name={{
              ios: "lock.shield.fill",
              android: "lock",
              web: "lock",
            }}
            size={38}
            tintColor={BLUE}
          />
        </View>

        <Text style={styles.securityTitle}>Keep your account secure</Text>

        <Text style={styles.subtitle}>
          Choose a strong password that you do not use elsewhere.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Password Details</Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>Current Password</Text>

        <View style={styles.passwordField}>
          <SymbolView
            name={{
              ios: "lock",
              android: "lock",
              web: "lock",
            }}
            size={19}
            tintColor={MUTED}
          />

          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Current password"
            placeholderTextColor={MUTED}
            secureTextEntry={!showCurrentPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting}
          />

          <Pressable
            onPress={() => setShowCurrentPassword((current) => !current)}
            hitSlop={8}
          >
            <SymbolView
              name={{
                ios: showCurrentPassword ? "eye.slash" : "eye",
                android: showCurrentPassword ? "visibility_off" : "visibility",
                web: showCurrentPassword ? "visibility_off" : "visibility",
              }}
              size={20}
              tintColor={MUTED}
            />
          </Pressable>
        </View>

        <Text style={styles.label}>New Password</Text>

        <View style={styles.passwordField}>
          <SymbolView
            name={{
              ios: "key.fill",
              android: "key",
              web: "key",
            }}
            size={19}
            tintColor={MUTED}
          />

          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
            placeholderTextColor={MUTED}
            secureTextEntry={!showNewPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting}
          />

          <Pressable
            onPress={() => setShowNewPassword((current) => !current)}
            hitSlop={8}
          >
            <SymbolView
              name={{
                ios: showNewPassword ? "eye.slash" : "eye",
                android: showNewPassword ? "visibility_off" : "visibility",
                web: showNewPassword ? "visibility_off" : "visibility",
              }}
              size={20}
              tintColor={MUTED}
            />
          </Pressable>
        </View>

        <Text style={styles.label}>Confirm Password</Text>

        <View style={[styles.passwordField, styles.lastField]}>
          <SymbolView
            name={{
              ios: "checkmark.shield.fill",
              android: "verified_user",
              web: "verified_user",
            }}
            size={19}
            tintColor={MUTED}
          />

          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            placeholderTextColor={MUTED}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting}
          />

          <Pressable
            onPress={() => setShowConfirmPassword((current) => !current)}
            hitSlop={8}
          >
            <SymbolView
              name={{
                ios: showConfirmPassword ? "eye.slash" : "eye",
                android: showConfirmPassword ? "visibility_off" : "visibility",
                web: showConfirmPassword ? "visibility_off" : "visibility",
              }}
              size={20}
              tintColor={MUTED}
            />
          </Pressable>
        </View>
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

          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      <View style={styles.requirementsCard}>
        <View style={styles.requirementsHeader}>
          <View style={styles.requirementIcon}>
            <SymbolView
              name={{
                ios: "checkmark.shield.fill",
                android: "verified_user",
                web: "verified_user",
              }}
              size={20}
              tintColor={BLUE}
            />
          </View>

          <Text style={styles.requirementsTitle}>Password requirements</Text>
        </View>

        <Requirement text="At least 8 characters" />
        <Requirement text="At least one number" />
        <Requirement text="At least one uppercase letter" />
        <Requirement text="At least one special character" />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.changeButton,
          pressed && styles.changeButtonPressed,
          isSubmitting && styles.disabledButton,
        ]}
        onPress={handleChangePassword}
        disabled={isSubmitting}
      >
        <SymbolView
          name={{
            ios: "lock.rotation",
            android: "lock_reset",
            web: "lock_reset",
          }}
          size={20}
          tintColor="#FFFFFF"
        />

        <Text style={styles.changeButtonText}>
          {isSubmitting ? "Changing password..." : "Change Password"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function Requirement({ text }: { text: string }) {
  return (
    <View style={styles.requirementRow}>
      <View style={styles.requirementDot}>
        <SymbolView
          name={{
            ios: "checkmark",
            android: "check",
            web: "check",
          }}
          size={12}
          tintColor={BLUE}
        />
      </View>

      <Text style={styles.requirement}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  content: {
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 20,
  },

  headerButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: BORDER,

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,

    elevation: 2,
  },

  headerSpacer: {
    width: 42,
  },

  title: {
    fontSize: 21,
    fontWeight: "800",
    color: NAVY,
  },

  securityCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 24,

    paddingVertical: 22,
    paddingHorizontal: 20,

    alignItems: "center",

    borderWidth: 1,
    borderColor: BORDER,

    marginBottom: 24,

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 10,

    elevation: 3,
  },

  lockCircle: {
    width: 76,
    height: 76,

    borderRadius: 24,

    backgroundColor: LIGHT_BLUE,

    alignItems: "center",
    justifyContent: "center",
  },

  securityTitle: {
    marginTop: 14,

    fontSize: 19,
    fontWeight: "800",

    color: NAVY,
  },

  subtitle: {
    marginTop: 6,

    maxWidth: 290,

    textAlign: "center",

    fontSize: 13,
    lineHeight: 19,

    color: MUTED,
  },

  sectionTitle: {
    marginLeft: 3,
    marginBottom: 9,

    fontSize: 16,
    fontWeight: "800",

    color: NAVY,
  },

  formCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,

    borderWidth: 1,
    borderColor: BORDER,

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,

    elevation: 2,
  },

  label: {
    marginBottom: 7,

    fontSize: 13,
    fontWeight: "700",

    color: NAVY,
  },

  passwordField: {
    minHeight: 52,

    borderRadius: 14,

    backgroundColor: FIELD_BACKGROUND,

    borderWidth: 1,
    borderColor: BORDER,

    flexDirection: "row",
    alignItems: "center",

    gap: 10,

    paddingHorizontal: 14,

    marginBottom: 14,
  },

  lastField: {
    marginBottom: 12,
  },

  input: {
    flex: 1,

    minHeight: 50,

    fontSize: 14,

    color: NAVY,
  },

  errorBox: {
    marginTop: 16,

    flexDirection: "row",
    alignItems: "center",

    gap: 8,

    padding: 12,

    borderRadius: 14,

    backgroundColor: "#FEF2F2",

    borderWidth: 1,
    borderColor: "#FECACA",
  },

  errorText: {
    flex: 1,

    fontSize: 13,

    color: "#DC2626",
  },

  requirementsCard: {
    marginTop: 18,

    backgroundColor: LIGHT_BLUE,

    borderRadius: 20,

    padding: 16,

    borderWidth: 1,
    borderColor: "#D6E9FF",
  },

  requirementsHeader: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 12,
  },

  requirementIcon: {
    width: 34,
    height: 34,

    borderRadius: 12,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,
  },

  requirementsTitle: {
    fontSize: 14,
    fontWeight: "800",

    color: NAVY,
  },

  requirementRow: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 7,
  },

  requirementDot: {
    width: 20,
    height: 20,

    borderRadius: 10,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 9,
  },

  requirement: {
    flex: 1,

    fontSize: 13,

    color: NAVY,
  },

  changeButton: {
    marginTop: 20,

    height: 52,

    borderRadius: 16,

    backgroundColor: BLUE,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 8,

    shadowColor: BLUE,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.18,
    shadowRadius: 6,

    elevation: 3,
  },

  changeButtonPressed: {
    opacity: 0.85,
  },

  disabledButton: {
    opacity: 0.65,
  },

  changeButtonText: {
    color: "#FFFFFF",

    fontSize: 15,
    fontWeight: "700",
  },
});
