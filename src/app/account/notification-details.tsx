import { router, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BACKGROUND = "#E7EDF6";
const TEXT = "#111827";
const MUTED = "#6B7280";
const BLUE = "#3B5CCC";

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
            size={24}
            tintColor={TEXT}
          />
        </Pressable>

        <Text style={styles.headerTitle}>Notification Details</Text>

        <View style={styles.headerButton} />
      </View>

      <View style={styles.iconCircle}>
        <SymbolView
          name={{
            ios: "bell.fill",
            android: "notifications",
            web: "notifications",
          }}
          size={34}
          tintColor={BLUE}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>

        {time ? <Text style={styles.time}>{time}</Text> : null}

        <View style={styles.divider} />

        <Text style={styles.message}>{message}</Text>
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
  },

  headerButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: TEXT,
  },

  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#DCE6FF",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    marginBottom: 24,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#D9E0EA",
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT,
  },

  time: {
    marginTop: 6,
    fontSize: 12,
    color: MUTED,
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 18,
  },

  message: {
    fontSize: 15,
    lineHeight: 22,
    color: TEXT,
  },
});
