import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BLUE = "#3B5CCC";
const BACKGROUND = "#E7EDF6";
const TEXT = "#111827";
const MUTED = "#6B7280";

const STORAGE_KEY = "notification_preferences";

type NotificationPreferences = {
  reservationConfirmations: boolean;
  reservationReminders: boolean;
  reservationUpdates: boolean;
  generalNotifications: boolean;
};

const DEFAULT_PREFERENCES: NotificationPreferences = {
  reservationConfirmations: true,
  reservationReminders: true,
  reservationUpdates: true,
  generalNotifications: true,
};

export default function NotificationPreferencesScreen() {
  const insets = useSafeAreaInsets();

  const [preferences, setPreferences] =
    useState<NotificationPreferences>(DEFAULT_PREFERENCES);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch {
      Alert.alert("Error", "Could not load notification preferences.");
    } finally {
      setIsLoading(false);
    }
  }

  function updatePreference(
    key: keyof NotificationPreferences,
    value: boolean,
  ) {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSave() {
    try {
      setIsSaving(true);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));

      Alert.alert(
        "Preferences Saved",
        "Your notification preferences have been updated.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      );
    } catch {
      Alert.alert("Error", "Could not save notification preferences.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
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
            tintColor={TEXT}
          />
        </Pressable>

        <Text style={styles.title}>Notification Preferences</Text>

        <View style={styles.headerButton} />
      </View>

      <Text style={styles.description}>
        Choose which library notifications you would like to receive.
      </Text>

      <View style={styles.card}>
        <PreferenceRow
          title="Reservation Confirmations"
          description="Receive notifications when your reservation is confirmed."
          value={preferences.reservationConfirmations}
          onValueChange={(value) =>
            updatePreference("reservationConfirmations", value)
          }
        />

        <View style={styles.divider} />

        <PreferenceRow
          title="Reservation Reminders"
          description="Receive reminders before your reservation starts."
          value={preferences.reservationReminders}
          onValueChange={(value) =>
            updatePreference("reservationReminders", value)
          }
        />

        <View style={styles.divider} />

        <PreferenceRow
          title="Reservation Updates"
          description="Receive notifications about seat or room reservation changes."
          value={preferences.reservationUpdates}
          onValueChange={(value) =>
            updatePreference("reservationUpdates", value)
          }
        />

        <View style={styles.divider} />

        <PreferenceRow
          title="General Notifications"
          description="Receive general library notices and updates."
          value={preferences.generalNotifications}
          onValueChange={(value) =>
            updatePreference("generalNotifications", value)
          }
        />
      </View>

      <Pressable
        style={[styles.saveButton, isSaving && styles.disabledButton]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={styles.saveButtonText}>
          {isSaving ? "Saving..." : "Save Preferences"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function PreferenceRow({
  title,
  description,
  value,
  onValueChange,
}: {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.preferenceRow}>
      <View style={styles.preferenceText}>
        <Text style={styles.preferenceTitle}>{title}</Text>

        <Text style={styles.preferenceDescription}>{description}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: "#C9D1DC",
          true: "#9FB1E9",
        }}
        thumbColor={value ? BLUE : "#FFFFFF"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BACKGROUND,
  },

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
    fontSize: 20,
    fontWeight: "800",
    color: TEXT,
  },

  description: {
    fontSize: 14,
    lineHeight: 20,
    color: MUTED,
    marginBottom: 18,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#D9E0EA",
  },

  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
  },

  preferenceText: {
    flex: 1,
    paddingRight: 14,
  },

  preferenceTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT,
  },

  preferenceDescription: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: MUTED,
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
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
