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

const BLUE = "#3B5CCC";
const LIGHT_BLUE = "#C9D9F7";
const BACKGROUND = "#E7EDF6";
const FIELD_BACKGROUND = "#DDE3EA";
const TEXT = "#111827";
const MUTED = "#6B7280";

export default function ChangePasswordScreen() {
  const insets = useSafeAreaInsets();

  // Auth function from AuthContext
  const { changePassword } = useAuth();

  //  Password form values
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Screen status
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate the new password using Figma requirements
  function isValidPassword(password: string) {
    return (
      password.length >= 8 &&
      /\d/.test(password) &&
      /[A-Z]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
  }

  //  Verify current password and save new password
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
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom + 28,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* YOUR PART - Header */}
      <View style={styles.header}>
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
            tintColor={TEXT}
          />
        </Pressable>

        <Text style={styles.title}>Change Password</Text>

        <View style={styles.headerSpacer} />
      </View>

      {/*  Lock illustration */}
      <View style={styles.lockCircle}>
        <SymbolView
          name={{
            ios: "lock.fill",
            android: "lock",
            web: "lock",
          }}
          size={48}
          tintColor={BLUE}
        />
      </View>

      <Text style={styles.subtitle}>Keep your app secure</Text>

      {/*  Current password */}
      <View style={styles.passwordField}>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Current password"
          placeholderTextColor="#8B93A1"
          secureTextEntry={!showCurrentPassword}
          autoCapitalize="none"
          autoCorrect={false}
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

      {/* New password */}
      <View style={styles.passwordField}>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="New Password"
          placeholderTextColor="#8B93A1"
          secureTextEntry={!showNewPassword}
          autoCapitalize="none"
          autoCorrect={false}
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

      {/*  Confirm password */}
      <View style={styles.passwordField}>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm Password"
          placeholderTextColor="#8B93A1"
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
          autoCorrect={false}
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

      {/* Error */}
      {errorMessage ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {/*  Submit */}
      <Pressable
        style={[styles.changeButton, isSubmitting && styles.disabledButton]}
        onPress={handleChangePassword}
        disabled={isSubmitting}
      >
        <Text style={styles.changeButtonText}>
          {isSubmitting ? "Changing password..." : "Change password"}
        </Text>
      </Pressable>

      {/*  password requirements */}
      <View style={styles.requirementsCard}>
        <Text style={styles.requirementsTitle}>Password must contain:</Text>

        <Text style={styles.requirement}>At least 8 characters</Text>

        <Text style={styles.requirement}>A number</Text>

        <Text style={styles.requirement}>An uppercase letter</Text>

        <Text style={styles.requirement}>A special character</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  content: {
    paddingHorizontal: 22,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  headerSpacer: {
    width: 40,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT,
  },

  lockCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#ABC6F6",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  subtitle: {
    marginTop: 12,
    marginBottom: 14,
    textAlign: "center",
    fontSize: 16,
    color: MUTED,
  },

  passwordField: {
    height: 50,
    borderRadius: 6,
    backgroundColor: FIELD_BACKGROUND,
    borderWidth: 1,
    borderColor: "#B9C2CE",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 12,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: TEXT,
  },

  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 10,
  },

  errorText: {
    fontSize: 12,
    color: "#DC2626",
  },

  changeButton: {
    height: 54,
    borderRadius: 11,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  disabledButton: {
    opacity: 0.65,
  },

  changeButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  requirementsCard: {
    marginTop: 12,
    backgroundColor: LIGHT_BLUE,
    borderRadius: 6,
    paddingHorizontal: 40,
    paddingVertical: 22,
  },

  requirementsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT,
    marginBottom: 2,
  },

  requirement: {
    fontSize: 14,
    lineHeight: 17,
    color: TEXT,
  },
});
