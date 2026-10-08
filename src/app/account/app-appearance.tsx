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

const BLUE = "#3B5CCC";

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
    description: "Use the light appearance.",
    ios: "sun.max.fill",
    android: "light_mode",
  },
  {
    value: "dark",
    title: "Dark Mode",
    description: "Use the dark appearance.",
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
    background: isDark ? "#111827" : "#E7EDF6",
    card: isDark ? "#1F2937" : "#FFFFFF",
    text: isDark ? "#F9FAFB" : "#111827",
    muted: isDark ? "#9CA3AF" : "#6B7280",
    border: isDark ? "#374151" : "#D9E0EA",
    iconBackground: isDark ? "#283451" : "#DCE6FF",
    divider: isDark ? "#374151" : "#E5E7EB",
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
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom + 30,
        },
      ]}
      showsVerticalScrollIndicator={false}
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

        <View style={styles.headerButton} />
      </View>

      <Text
        style={[
          styles.description,
          {
            color: colors.muted,
          },
        ]}
      >
        Choose the appearance you prefer for the Smart Library app.
      </Text>

      <View
        style={[
          styles.card,
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
                style={styles.optionRow}
                onPress={() => setSelectedAppearance(option.value)}
              >
                <View
                  style={[
                    styles.iconCircle,
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
                      borderColor: selected ? BLUE : colors.muted,
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
                      backgroundColor: colors.divider,
                    },
                  ]}
                />
              ) : null}
            </View>
          );
        })}
      </View>

      <Pressable
        style={[styles.saveButton, isSaving && styles.disabledButton]}
        onPress={handleSave}
        disabled={isSaving}
      >
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
    marginBottom: 12,
  },

  headerButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 21,
    fontWeight: "800",
  },

  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },

  card: {
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
  },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
  },

  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
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
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
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
  },

  saveButton: {
    height: 54,
    borderRadius: 11,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
