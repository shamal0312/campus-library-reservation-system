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

import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  getNotificationPreferences,
  saveNotificationPreferences,
  type NotificationPreferences,
} from "@/services/notifications";

const BLUE = "#2F80ED";
const NAVY = "#102A43";
const BACKGROUND = "#F2F6FC";
const MUTED = "#718096";
const LIGHT_BLUE = "#EAF4FF";
const BORDER = "#E4EAF2";

export default function NotificationPreferencesScreen() {
  const insets = useSafeAreaInsets();

  const [preferences, setPreferences] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    try {
      setIsLoading(true);

      const result = await getNotificationPreferences();

      if (result.error) {
        Alert.alert("Error", result.error);
        return;
      }

      setPreferences(result.preferences);
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

      const result = await saveNotificationPreferences(preferences);

      if (result.error) {
        Alert.alert("Error", result.error);
        return;
      }

      if (result.preferences) {
        setPreferences(result.preferences);
      }

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
        <View style={styles.loadingIcon}>
          <ActivityIndicator size="large" color={BLUE} />
        </View>

        <Text style={styles.loadingText}>Loading preferences...</Text>
      </View>
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

        <Text style={styles.title}>Notification Preferences</Text>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.introCard}>
        <View style={styles.introIcon}>
          <SymbolView
            name={{
              ios: "bell.badge.fill",
              android: "notifications",
              web: "notifications",
            }}
            size={30}
            tintColor={BLUE}
          />
        </View>

        <Text style={styles.introTitle}>Stay Updated</Text>

        <Text style={styles.description}>
          Choose which library notifications you would like to receive.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Notification Settings</Text>

      <View style={styles.card}>
        <PreferenceRow
          icon={{
            ios: "checkmark.circle.fill",
            android: "check_circle",
            web: "check_circle",
          }}
          title="Reservation Confirmations"
          description="Receive notifications when your reservation is confirmed."
          value={preferences.reservationConfirmations}
          onValueChange={(value) =>
            updatePreference("reservationConfirmations", value)
          }
        />

        <View style={styles.divider} />

        <PreferenceRow
          icon={{
            ios: "clock.fill",
            android: "schedule",
            web: "schedule",
          }}
          title="Reservation Reminders"
          description="Receive reminders before your reservation starts."
          value={preferences.reservationReminders}
          onValueChange={(value) =>
            updatePreference("reservationReminders", value)
          }
        />

        <View style={styles.divider} />

        <PreferenceRow
          icon={{
            ios: "arrow.triangle.2.circlepath",
            android: "sync",
            web: "sync",
          }}
          title="Reservation Updates"
          description="Receive notifications about seat or room reservation changes."
          value={preferences.reservationUpdates}
          onValueChange={(value) =>
            updatePreference("reservationUpdates", value)
          }
        />

        <View style={styles.divider} />

        <PreferenceRow
          icon={{
            ios: "bell.fill",
            android: "notifications",
            web: "notifications",
          }}
          title="General Notifications"
          description="Receive general library notices and updates."
          value={preferences.generalNotifications}
          onValueChange={(value) =>
            updatePreference("generalNotifications", value)
          }
        />
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoIcon}>
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

        <Text style={styles.infoText}>
          You can change these preferences anytime from your profile settings.
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
        {isSaving ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <SymbolView
            name={{
              ios: "checkmark",
              android: "check",
              web: "check",
            }}
            size={19}
            tintColor="#FFFFFF"
          />
        )}

        <Text style={styles.saveButtonText}>
          {isSaving ? "Saving..." : "Save Preferences"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

type PreferenceIcon = {
  ios:
    | "checkmark.circle.fill"
    | "clock.fill"
    | "arrow.triangle.2.circlepath"
    | "bell.fill";

  android: "check_circle" | "schedule" | "sync" | "notifications";

  web: "check_circle" | "schedule" | "sync" | "notifications";
};

function PreferenceRow({
  icon,
  title,
  description,
  value,
  onValueChange,
}: {
  icon: PreferenceIcon;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.preferenceRow}>
      <View style={styles.preferenceIcon}>
        <SymbolView name={icon} size={20} tintColor={BLUE} />
      </View>

      <View style={styles.preferenceText}>
        <Text style={styles.preferenceTitle}>{title}</Text>

        <Text style={styles.preferenceDescription}>{description}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: "#D7DEE8",
          true: "#A9D0FF",
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

  loadingIcon: {
    width: 74,
    height: 74,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 2,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: MUTED,
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
    flex: 1,
    textAlign: "center",
    fontSize: 20,
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
    fontSize: 19,
    fontWeight: "800",
    color: NAVY,
  },

  description: {
    marginTop: 6,
    maxWidth: 290,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: MUTED,
  },

  sectionTitle: {
    marginLeft: 3,
    marginBottom: 9,
    fontSize: 16,
    fontWeight: "800",
    color: NAVY,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 15,
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

  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },

  preferenceIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: LIGHT_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  preferenceText: {
    flex: 1,
    paddingRight: 10,
  },

  preferenceTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
  },

  preferenceDescription: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    color: MUTED,
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF2F6",
    marginLeft: 54,
  },

  infoCard: {
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: "#F8FAFD",
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: LIGHT_BLUE,
    alignItems: "center",
    justifyContent: "center",
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: MUTED,
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
