import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { requireSupabase } from "@/services/supabase";

const PRIMARY = "#4F6FD8";
const PRIMARY_DARK = "#3F5FBF";
const BACKGROUND = "#F4F7FB";
const TEXT = "#1F2937";
const MUTED = "#6B7280";
const BORDER = "#DCE3EC";
const ERROR = "#DC2626";

export default function CompleteProfileScreen() {
  const insets = useSafeAreaInsets();

  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleContinue() {
    setError(null);

    const trimmedId = studentId.trim().toUpperCase();
    const studentIdPattern = /^[A-Z]{2}\d{8}$/;

    if (!trimmedId) {
      setError("SLIIT Student ID is required.");
      return;
    }

    if (!studentIdPattern.test(trimmedId)) {
      setError("Enter a valid SLIIT Student ID.");
      return;
    }

    setIsSaving(true);

    const supabase = requireSupabase();

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        university_id: trimmedId,
      },
    });

    setIsSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.replace("/role");
  }

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
        },
      ]}
    >
      <View style={styles.iconBox}>
        <SymbolView
          name={{
            ios: "person.text.rectangle",
            android: "badge",
            web: "badge",
          }}
          size={30}
          tintColor={PRIMARY}
        />
      </View>

      <Text style={styles.title}>Complete Your Profile</Text>

      <Text style={styles.subtitle}>
        Enter your SLIIT Student ID to continue.
      </Text>

      <View style={styles.formCard}>
        <View style={[styles.field, error ? styles.fieldError : null]}>
          <SymbolView
            name={{
              ios: "person.text.rectangle",
              android: "badge",
              web: "badge",
            }}
            size={19}
            tintColor={error ? ERROR : "#94A3B8"}
          />

          <TextInput
            style={styles.input}
            placeholder="SLIIT Student ID"
            placeholderTextColor="#94A3B8"
            value={studentId}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={10}
            onChangeText={(value) => {
              const cleanedValue = value
                .replace(/[^A-Za-z0-9]/g, "")
                .toUpperCase()
                .slice(0, 10);

              setStudentId(cleanedValue);
              setError(null);
            }}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          style={[styles.buttonWrapper, isSaving && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={isSaving}
        >
          <LinearGradient
            colors={["#6280DF", PRIMARY, PRIMARY_DARK]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {isSaving ? "Saving..." : "Continue"}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
    paddingHorizontal: 22,
    justifyContent: "center",
  },

  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 14,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: TEXT,
    textAlign: "center",
  },

  subtitle: {
    marginTop: 6,
    marginBottom: 22,
    fontSize: 13,
    color: MUTED,
    textAlign: "center",
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
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

  input: {
    flex: 1,
    fontSize: 14,
    color: TEXT,
  },

  errorText: {
    color: ERROR,
    fontSize: 11,
    marginTop: 5,
    marginLeft: 4,
  },

  buttonWrapper: {
    height: 48,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 16,
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
});
