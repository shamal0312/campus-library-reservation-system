import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/auth-context";
import { USER_ROLE_LABELS, type UserRole } from "@/types/account";

const BLUE = "#2F80ED";
const NAVY = "#102A43";
const BACKGROUND = "#F2F6FC";
const MUTED = "#718096";
const LIGHT_BLUE = "#EAF4FF";
const BORDER = "#E4EAF2";

const ROLES: {
  role: UserRole;
  ios: "person" | "graduationcap";
  android: "person" | "school";
  description: string;
}[] = [
  {
    role: "lecturer",
    ios: "person",
    android: "person",
    description: "Access library services as a lecturer.",
  },
  {
    role: "student",
    ios: "graduationcap",
    android: "school",
    description: "Reserve books, seats and study spaces.",
  },
];

export default function RoleScreen() {
  const insets = useSafeAreaInsets();
  const { saveRole } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>("lecturer");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleContinue() {
    setErrorMessage(null);
    setIsSubmitting(true);

    const result = await saveRole(selectedRole);

    setIsSubmitting(false);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }
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
            tintColor={NAVY}
          />
        </Pressable>

        <Text style={styles.title}>Select Your Role</Text>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.introCard}>
        <View style={styles.introIcon}>
          <SymbolView
            name={{
              ios: "person.2.fill",
              android: "groups",
              web: "groups",
            }}
            size={30}
            tintColor={BLUE}
          />
        </View>

        <Text style={styles.introTitle}>How will you use Smart Library?</Text>

        <Text style={styles.subtitle}>
          Choose your role so we can show the right library features for you.
        </Text>
      </View>

      <Text style={styles.sectionLabel}>Registration Role</Text>

      <View style={styles.cards}>
        {ROLES.map((item) => {
          const selected = selectedRole === item.role;

          return (
            <Pressable
              key={item.role}
              style={({ pressed }) => [
                styles.card,
                selected ? styles.cardSelected : styles.cardIdle,
                pressed && styles.cardPressed,
              ]}
              onPress={() => setSelectedRole(item.role)}
            >
              <View
                style={[
                  styles.roleIconBox,
                  selected && styles.roleIconBoxSelected,
                ]}
              >
                <SymbolView
                  name={{
                    ios: item.ios,
                    android: item.android,
                    web: item.android,
                  }}
                  size={28}
                  tintColor={BLUE}
                />
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>
                  {USER_ROLE_LABELS[item.role]}
                </Text>

                <Text style={styles.cardDescription}>{item.description}</Text>
              </View>

              <View
                style={[
                  styles.radioOuter,
                  selected && styles.radioOuterSelected,
                ]}
              >
                {selected ? <View style={styles.radioInner} /> : null}
              </View>
            </Pressable>
          );
        })}
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

      <View style={styles.spacer} />

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          isSubmitting && styles.buttonDisabled,
        ]}
        onPress={handleContinue}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? "Saving..." : "Continue"}
        </Text>

        {!isSubmitting ? (
          <SymbolView
            name={{
              ios: "arrow.right",
              android: "arrow_forward",
              web: "arrow_forward",
            }}
            size={20}
            tintColor="#FFFFFF"
          />
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 20,
  },

  backButton: {
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

  introCard: {
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

  introIcon: {
    width: 70,
    height: 70,

    borderRadius: 23,

    backgroundColor: LIGHT_BLUE,

    alignItems: "center",
    justifyContent: "center",
  },

  introTitle: {
    marginTop: 13,

    fontSize: 18,
    fontWeight: "800",

    color: NAVY,

    textAlign: "center",
  },

  subtitle: {
    marginTop: 6,

    maxWidth: 290,

    fontSize: 13,
    lineHeight: 19,

    color: MUTED,

    textAlign: "center",
  },

  sectionLabel: {
    marginLeft: 3,
    marginBottom: 10,

    fontSize: 16,
    fontWeight: "800",

    color: NAVY,
  },

  cards: {
    gap: 12,
  },

  card: {
    minHeight: 92,

    borderRadius: 20,

    padding: 14,

    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,

    elevation: 2,
  },

  cardIdle: {
    backgroundColor: "#FFFFFF",
    borderColor: BORDER,
  },

  cardSelected: {
    backgroundColor: "#F8FBFF",
    borderColor: "#A9D0FF",
  },

  cardPressed: {
    opacity: 0.8,
  },

  roleIconBox: {
    width: 54,
    height: 54,

    borderRadius: 17,

    backgroundColor: "#F1F5F9",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 13,
  },

  roleIconBoxSelected: {
    backgroundColor: LIGHT_BLUE,
  },

  cardContent: {
    flex: 1,

    paddingRight: 10,
  },

  cardLabel: {
    fontSize: 16,
    fontWeight: "800",

    color: NAVY,
  },

  cardDescription: {
    marginTop: 4,

    fontSize: 12,
    lineHeight: 17,

    color: MUTED,
  },

  radioOuter: {
    width: 23,
    height: 23,

    borderRadius: 12,

    borderWidth: 2,
    borderColor: "#CBD5E1",

    alignItems: "center",
    justifyContent: "center",
  },

  radioOuterSelected: {
    borderColor: BLUE,
  },

  radioInner: {
    width: 13,
    height: 13,

    borderRadius: 7,

    backgroundColor: BLUE,
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

  error: {
    flex: 1,

    color: "#DC2626",

    fontSize: 13,
  },

  spacer: {
    flex: 1,
    minHeight: 24,
  },

  button: {
    minHeight: 52,

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

  buttonPressed: {
    opacity: 0.85,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",

    fontSize: 15,
    fontWeight: "700",
  },
});
