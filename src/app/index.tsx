import { Image } from "expo-image";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/auth-context";

import GetStartedScreen from "./(auth)/get-started";

const BLUE = "#3B5CCC";
const LIGHT_BLUE = "#DCE6FF";
const BACKGROUND = "#E8EEF6";
const TEXT = "#1A1D26";
const MUTED = "#7E8798";

const ACTIONS: {
  label: string;
  ios: "book" | "chair" | "door.left.hand.open" | "bell";
  android: "menu_book" | "chair" | "meeting_room" | "notifications";
  route?: string;
  badge?: number;
}[] = [
  {
    label: "Book Reservation",
    ios: "book",
    android: "menu_book",
  },
  {
    label: "Seat Reservation",
    ios: "chair",
    android: "chair",
  },
  {
    label: "Room Reservation",
    ios: "door.left.hand.open",
    android: "meeting_room",
  },
  {
    label: "Notification",
    ios: "bell",
    android: "notifications",
    route: "/notifications",
    badge: 3,
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { session, account, isLoading } = useAuth();

  const isSignedIn = !isLoading && !!session && !!account?.role;

  if (!isSignedIn) {
    return <GetStartedScreen />;
  }

  const firstName = account.fullName.trim().split(" ")[0] || "Nimal";

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 24,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text style={styles.hello}>Hello, {firstName} !</Text>

          <Text style={styles.subtitle}>Let’s make today productive</Text>
        </View>

        <View style={styles.headerRight}>
          <Pressable style={styles.notificationButton} hitSlop={8}>
            <SymbolView
              name={{
                ios: "bell.fill",
                android: "notifications",
                web: "notifications",
              }}
              size={21}
              tintColor={BLUE}
            />

            <View style={styles.headerBadge} />
          </Pressable>

          <Pressable
            style={styles.avatar}
            onPress={() => router.push("/profile")}
            hitSlop={8}
          >
            <SymbolView
              name={{
                ios: "person.fill",
                android: "person",
                web: "person",
              }}
              size={25}
              tintColor={BLUE}
            />
          </Pressable>
        </View>
      </View>

      {/* Upcoming Reservation */}
      <View style={styles.reservationSection}>
        <View style={styles.reservationHeader}>
          <Text style={styles.reservationTitle}>Upcoming Reservation</Text>

          <Pressable style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>

            <SymbolView
              name={{
                ios: "arrow.right",
                android: "arrow_forward",
                web: "arrow_forward",
              }}
              size={16}
              tintColor={TEXT}
            />
          </Pressable>
        </View>

        <View style={styles.reservationCard}>
          <Image
            source={require("@/assets/images/library-aisle.jpg")}
            style={styles.reservationPhoto}
            contentFit="cover"
          />

          <View style={styles.reservationBody}>
            <Text style={styles.roomName}>Seat - A8</Text>
            <Text style={styles.floor}>Floor - 2</Text>

            <Text style={styles.metaText}>Date - 15 Sep 2026</Text>

            <Text style={styles.metaText}>Time - 10.00 AM - 12.00 PM</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.grid}>
        {[ACTIONS.slice(0, 2), ACTIONS.slice(2)].map((row, rowIndex) => (
          <View key={rowIndex} style={styles.actionRow}>
            {row.map((action) => (
              <Pressable
                key={action.label}
                style={styles.actionCard}
                onPress={() => {
                  if (action.route) {
                    router.push(action.route as never);
                  }
                }}
              >
                <View style={styles.actionIcon}>
                  <SymbolView
                    name={{
                      ios: action.ios,
                      android: action.android,
                      web: action.android,
                    }}
                    size={30}
                    tintColor={BLUE}
                  />

                  {action.badge ? (
                    <View style={styles.actionBadge}>
                      <Text style={styles.actionBadgeText}>{action.badge}</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={styles.actionLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        ))}
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
    paddingHorizontal: 18,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  greeting: {
    flex: 1,
  },

  hello: {
    fontSize: 25,
    fontWeight: "800",
    color: TEXT,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: MUTED,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  notificationButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  headerBadge: {
    position: "absolute",
    top: 6,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: BACKGROUND,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  reservationSection: {
    backgroundColor: "#8EA6D8",
    borderRadius: 18,
    padding: 12,
    marginBottom: 18,
  },

  reservationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  reservationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  viewAllText: {
    fontSize: 11,
    color: TEXT,
  },

  reservationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
  },

  reservationPhoto: {
    width: 76,
    height: 76,
    borderRadius: 10,
  },

  reservationBody: {
    flex: 1,
    marginLeft: 12,
  },

  roomName: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT,
  },

  floor: {
    marginTop: 2,
    fontSize: 14,
    color: TEXT,
    marginBottom: 8,
  },

  metaText: {
    fontSize: 12,
    lineHeight: 17,
    color: TEXT,
  },

  grid: {
    gap: 14,
  },

  actionRow: {
    flexDirection: "row",
    gap: 14,
  },

  actionCard: {
    flex: 1,
    minHeight: 126,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,

    borderWidth: 1,
    borderColor: "#DDE3EC",
  },

  actionIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: LIGHT_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  actionLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: TEXT,
    textAlign: "center",
  },

  actionBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  actionBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
