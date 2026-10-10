import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  type AppearanceMode,
  useAppearance,
} from "@/contexts/appearance-context";

const BLUE = "#2F80ED";
const NAVY = "#102A43";

const OPTIONS: {
  value: AppearanceMode;
  title: string;
  description: string;
  ios: "sun.max.fill" | "moon.fill";
  android: "light_mode" | "dark_mode";
}[] = [
  {
    value: "light",
    title: "Light Mode",
    description: "Use a bright and clean appearance.",
    ios: "sun.max.fill",
    android: "light_mode",
  },
  {
    value: "dark",
    title: "Dark Mode",
    description: "Use a darker appearance for low-light environments.",
    ios: "moon.fill",
    android: "dark_mode",
  },
];

export default function AppAppearanceScreen() {
  const insets = useSafeAreaInsets();

  const { appearance: savedAppearance, setAppearance } = useAppearance();

  const [selectedAppearance, setSelectedAppearance] =
    useState<AppearanceMode>(savedAppearance);

  const [isSaving, setIsSaving] = useState(false);

  const isDark = selectedAppearance === "dark";

  const colors = {
    background: isDark ? "#111827" : "#F2F6FC",

    card: isDark ? "#1F2937" : "#FFFFFF",

    text: isDark ? "#F9FAFB" : NAVY,

    muted: isDark ? "#9CA3AF" : "#718096",

    border: isDark ? "#374151" : "#E4EAF2",

    iconBackground: isDark ? "#263244" : "#EAF4FF",

    secondaryCard: isDark ? "#172033" : "#F8FAFD",
  };

  async function handleSave() {
    try {
      setIsSaving(true);

      await setAppearance(selectedAppearance);

      Alert.alert(
        "Appearance Saved",
        `${
          selectedAppearance === "dark" ? "Dark Mode" : "Light Mode"
        } has been applied.`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      );
    } catch {
      Alert.alert("Error", "Could not save appearance settings.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScrollView
      style={[
        styles.screen,
        {
          backgroundColor: colors.background,
        },
      ]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 32,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable
          style={[
            styles.headerButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
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
            tintColor={colors.text}
          />
        </Pressable>

        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          App Appearance
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <View
        style={[
          styles.previewCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.previewIcon,
            {
              backgroundColor: colors.iconBackground,
            },
          ]}
        >
          <SymbolView
            name={{
              ios: isDark ? "moon.fill" : "sun.max.fill",
              android: isDark ? "dark_mode" : "light_mode",
              web: isDark ? "dark_mode" : "light_mode",
            }}
            size={34}
            tintColor={BLUE}
          />
        </View>

        <Text
          style={[
            styles.previewTitle,
            {
              color: colors.text,
            },
          ]}
        >
          {isDark ? "Dark Mode" : "Light Mode"}
        </Text>

        <Text
          style={[
            styles.previewDescription,
            {
              color: colors.muted,
            },
          ]}
        >
          Choose the appearance that feels most comfortable for you.
        </Text>
      </View>

      <Text
        style={[
          styles.sectionTitle,
          {
            color: colors.text,
          },
        ]}
      >
        Choose Appearance
      </Text>

      <View
        style={[
          styles.optionsCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        {OPTIONS.map((option, index) => {
          const selected = selectedAppearance === option.value;

          return (
            <View key={option.value}>
              <Pressable
                style={({ pressed }) => [
                  styles.optionRow,
                  pressed && {
                    opacity: 0.75,
                  },
                ]}
                onPress={() => setSelectedAppearance(option.value)}
              >
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: colors.iconBackground,
                    },
                  ]}
                >
                  <SymbolView
                    name={{
                      ios: option.ios,
                      android: option.android,
                      web: option.android,
                    }}
                    size={22}
                    tintColor={BLUE}
                  />
                </View>

                <View style={styles.optionText}>
                  <Text
                    style={[
                      styles.optionTitle,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    {option.title}
                  </Text>

                  <Text
                    style={[
                      styles.optionDescription,
                      {
                        color: colors.muted,
                      },
                    ]}
                  >
                    {option.description}
                  </Text>
                </View>

                <View
                  style={[
                    styles.radioOuter,
                    {
                      borderColor: selected ? BLUE : colors.border,
                    },
                  ]}
                >
                  {selected ? <View style={styles.radioInner} /> : null}
                </View>
              </Pressable>

              {index < OPTIONS.length - 1 ? (
                <View
                  style={[
                    styles.divider,
                    {
                      backgroundColor: colors.border,
                    },
                  ]}
                />
              ) : null}
            </View>
          );
        })}
      </View>

      <View
        style={[
          styles.infoCard,
          {
            backgroundColor: colors.secondaryCard,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.infoIcon,
            {
              backgroundColor: colors.iconBackground,
            },
          ]}
        >
          <SymbolView
            name={{
              ios: "info.circle.fill",
              android: "info",
              web: "info",
            }}
            size={19}
            tintColor={BLUE}
          />
        </View>

        <Text
          style={[
            styles.infoText,
            {
              color: colors.muted,
            },
          ]}
        >
          Your appearance preference will be saved on this device.
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.saveButton,
          pressed && styles.saveButtonPressed,
          isSaving && styles.disabledButton,
        ]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <SymbolView
          name={{
            ios: "checkmark",
            android: "check",
            web: "check",
          }}
          size={19}
          tintColor="#FFFFFF"
        />

        <Text style={styles.saveButtonText}>
          {isSaving ? "Saving..." : "Save Appearance"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    flexGrow: 1,
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

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,

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
  },

  previewCard: {
    borderRadius: 24,

    paddingVertical: 24,
    paddingHorizontal: 20,

    alignItems: "center",

    borderWidth: 1,

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

  previewIcon: {
    width: 76,
    height: 76,

    borderRadius: 24,

    alignItems: "center",
    justifyContent: "center",
  },

  previewTitle: {
    marginTop: 14,

    fontSize: 20,
    fontWeight: "800",
  },

  previewDescription: {
    marginTop: 6,

    maxWidth: 290,

    fontSize: 13,
    lineHeight: 19,

    textAlign: "center",
  },

  sectionTitle: {
    marginLeft: 3,
    marginBottom: 9,

    fontSize: 16,
    fontWeight: "800",
  },

  optionsCard: {
    borderRadius: 20,

    paddingHorizontal: 15,

    borderWidth: 1,

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,

    elevation: 2,
  },

  optionRow: {
    minHeight: 82,

    flexDirection: "row",
    alignItems: "center",

    paddingVertical: 13,
  },

  iconBox: {
    width: 46,
    height: 46,

    borderRadius: 15,

    alignItems: "center",
    justifyContent: "center",
  },

  optionText: {
    flex: 1,

    marginLeft: 13,
    marginRight: 12,
  },

  optionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },

  optionDescription: {
    marginTop: 3,

    fontSize: 12,
    lineHeight: 17,
  },

  radioOuter: {
    width: 22,
    height: 22,

    borderRadius: 11,

    borderWidth: 2,

    alignItems: "center",
    justifyContent: "center",
  },

  radioInner: {
    width: 12,
    height: 12,

    borderRadius: 6,

    backgroundColor: BLUE,
  },

  divider: {
    height: 1,

    marginLeft: 59,
  },

  infoCard: {
    marginTop: 18,

    borderRadius: 18,

    borderWidth: 1,

    padding: 14,

    flexDirection: "row",
    alignItems: "center",

    gap: 10,
  },

  infoIcon: {
    width: 38,
    height: 38,

    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",
  },

  infoText: {
    flex: 1,

    fontSize: 12,
    lineHeight: 18,
  },

  saveButton: {
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

  saveButtonPressed: {
    opacity: 0.85,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    fontSize: 15,
    fontWeight: "700",

    color: "#FFFFFF",
  },
});
