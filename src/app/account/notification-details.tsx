import { router, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BLUE = "#2F80ED";
const NAVY = "#102A43";
const BACKGROUND = "#F2F6FC";
const MUTED = "#718096";
const LIGHT_BLUE = "#EAF4FF";
const BORDER = "#E4EAF2";

export default function NotificationDetailsScreen() {
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{
    title?: string;
    message?: string;
    time?: string;
  }>();

  const title = params.title || "Notification";
  const message = params.message || "No notification details available.";
  const time = params.time || "";

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

        <Text style={styles.headerTitle}>Notification Details</Text>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.iconBox}>
          <SymbolView
            name={{
              ios: "bell.fill",
              android: "notifications",
              web: "notifications",
            }}
            size={32}
            tintColor={BLUE}
          />
        </View>

        <Text style={styles.summaryTitle}>Library Notification</Text>

        <Text style={styles.summaryText}>
          View the complete notification details below.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Notification</Text>

      <View style={styles.card}>
        <View style={styles.notificationHeader}>
          <View style={styles.smallIconBox}>
            <SymbolView
              name={{
                ios: "bell.badge.fill",
                android: "notifications_active",
                web: "notifications_active",
              }}
              size={20}
              tintColor={BLUE}
            />
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.title}>{title}</Text>

            {time ? (
              <View style={styles.timeRow}>
                <SymbolView
                  name={{
                    ios: "clock",
                    android: "schedule",
                    web: "schedule",
                  }}
                  size={14}
                  tintColor={MUTED}
                />

                <Text style={styles.time}>{time}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.message}>{message}</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoIcon}>
          <SymbolView
            name={{
              ios: "info.circle.fill",
              android: "info",
              web: "info",
            }}
            size={18}
            tintColor={BLUE}
          />
        </View>

        <Text style={styles.infoText}>
          This notification was sent by the Smart Library system.
        </Text>
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

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",

    color: NAVY,

    textAlign: "center",
  },

  summaryCard: {
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

  iconBox: {
    width: 72,
    height: 72,

    borderRadius: 24,

    backgroundColor: LIGHT_BLUE,

    alignItems: "center",
    justifyContent: "center",
  },

  summaryTitle: {
    marginTop: 13,

    fontSize: 19,
    fontWeight: "800",

    color: NAVY,
  },

  summaryText: {
    marginTop: 6,

    maxWidth: 280,

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

    padding: 18,

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

  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  smallIconBox: {
    width: 44,
    height: 44,

    borderRadius: 14,

    backgroundColor: LIGHT_BLUE,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  titleBlock: {
    flex: 1,
  },

  title: {
    fontSize: 17,
    fontWeight: "800",

    color: NAVY,
  },

  timeRow: {
    marginTop: 5,

    flexDirection: "row",
    alignItems: "center",

    gap: 5,
  },

  time: {
    fontSize: 12,

    color: MUTED,
  },

  divider: {
    height: 1,

    backgroundColor: "#EEF2F6",

    marginVertical: 16,
  },

  message: {
    fontSize: 14,
    lineHeight: 22,

    color: NAVY,
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
    width: 36,
    height: 36,

    borderRadius: 12,

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
});
