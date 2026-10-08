import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/auth-context";
import { getUnreadNotificationCount } from "@/services/notifications";

import GetStartedScreen from "../(auth)/get-started";

const BLUE = "#2F80ED";
const NAVY = "#102A43";
const BACKGROUND = "#F2F6FC";
const MUTED = "#718096";
const LIGHT_BLUE = "#EAF4FF";
const BORDER = "#E4EAF2";

const ACTIONS: {
  label: string;
  ios: "book" | "chair" | "door.left.hand.open" | "bell";
  android: "menu_book" | "chair" | "meeting_room" | "notifications";
  route?: string;
}[] = [
  {
    label: "Book Reservation",
    ios: "book",
    android: "menu_book",
    route: "/(student)/book",
  },
  {
    label: "Seat Reservation",
    ios: "chair",
    android: "chair",
    route: "/booking",
  },
  {
    label: "Room Reservation",
    ios: "door.left.hand.open",
    android: "meeting_room",
    route: "/booking/room-request",
  },
  {
    label: "Notifications",
    ios: "bell",
    android: "notifications",
    route: "/account/notifications",
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const { session, account, isLoading } = useAuth();

  const [unreadCount, setUnreadCount] = useState(0);

  const isSignedIn = !isLoading && !!session && !!account?.role;

  const loadUnreadCount = useCallback(async () => {
    if (!session) {
      setUnreadCount(0);
      return;
    }

    const result = await getUnreadNotificationCount();

    if (!result.error) {
      setUnreadCount(result.count);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      loadUnreadCount();
    }, [loadUnreadCount]),
  );

  if (!isSignedIn) {
    return <GetStartedScreen />;
  }

  const firstName = account.fullName.trim().split(" ")[0] || "User";

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 28,
            paddingBottom: insets.bottom + 105,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.greeting}>
            <Text style={styles.hello}>Hello, {firstName}</Text>

            <Text style={styles.subtitle}>Let’s make today productive</Text>
          </View>

          <View style={styles.headerRight}>
            <Pressable
              style={styles.notificationButton}
              onPress={() => router.push("/account/notifications")}
            >
              <SymbolView
                name={{
                  ios: "bell.fill",
                  android: "notifications",
                  web: "notifications",
                }}
                size={21}
                tintColor={NAVY}
              />

              {unreadCount > 0 ? <View style={styles.headerBadge} /> : null}
            </Pressable>

            <Pressable
              style={styles.avatar}
              onPress={() => router.push("/account/profile")}
            >
              {account.avatarUrl ? (
                <Image
                  source={{
                    uri: account.avatarUrl,
                  }}
                  style={styles.headerAvatarImage}
                  contentFit="cover"
                />
              ) : (
                <SymbolView
                  name={{
                    ios: "person.fill",
                    android: "person",
                    web: "person",
                  }}
                  size={24}
                  tintColor={BLUE}
                />
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.welcomeCard}>
          <View>
            <Text style={styles.welcomeTitle}>Smart Library</Text>

            <Text style={styles.welcomeText}>Reserve. Study. Learn.</Text>
          </View>

          <View style={styles.welcomeIcon}>
            <SymbolView
              name={{
                ios: "books.vertical.fill",
                android: "local_library",
                web: "local_library",
              }}
              size={28}
              tintColor={BLUE}
            />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Reservation</Text>

          <Pressable style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View</Text>

            <SymbolView
              name={{
                ios: "chevron.right",
                android: "chevron_right",
                web: "chevron_right",
              }}
              size={16}
              tintColor={BLUE}
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
            <Text style={styles.roomName}>Seat A8</Text>

            <Text style={styles.floor}>Floor 2</Text>

            <View style={styles.metaRow}>
              <SymbolView
                name={{
                  ios: "calendar",
                  android: "calendar_today",
                  web: "calendar_today",
                }}
                size={15}
                tintColor={MUTED}
              />

              <Text style={styles.metaText}>15 Sep 2026</Text>
            </View>

            <View style={styles.metaRow}>
              <SymbolView
                name={{
                  ios: "clock",
                  android: "schedule",
                  web: "schedule",
                }}
                size={15}
                tintColor={MUTED}
              />

              <Text style={styles.metaText}>10.00 AM - 12.00 PM</Text>
            </View>
          </View>

          <View style={styles.arrowButton}>
            <SymbolView
              name={{
                ios: "chevron.right",
                android: "chevron_right",
                web: "chevron_right",
              }}
              size={20}
              tintColor={BLUE}
            />
          </View>
        </View>

        <Text style={styles.quickTitle}>Quick Access</Text>

        <View style={styles.grid}>
          {[ACTIONS.slice(0, 2), ACTIONS.slice(2)].map((row, rowIndex) => (
            <View key={rowIndex} style={styles.actionRow}>
              {row.map((action) => {
                const isNotification = action.label === "Notifications";

                return (
                  <Pressable
                    key={action.label}
                    style={({ pressed }) => [
                      styles.actionCard,
                      pressed && styles.actionCardPressed,
                    ]}
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
                        size={28}
                        tintColor={BLUE}
                      />

                      {isNotification && unreadCount > 0 ? (
                        <View style={styles.actionBadge}>
                          <Text style={styles.actionBadgeText}>
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <Text style={styles.actionLabel}>{action.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomNav,
          {
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ]}
      >
        <BottomNavItem
          label="Home"
          ios="house.fill"
          android="home"
          active
          onPress={() => {}}
        />

        <BottomNavItem
          label="Seat"
          ios="chair.fill"
          android="chair"
          onPress={() => router.push("/booking")}
        />

        <BottomNavItem
          label="Books"
          ios="book.fill"
          android="menu_book"
          onPress={() => router.push("/(student)/book" as never)}
        />

        <BottomNavItem
          label="Profile"
          ios="person.fill"
          android="person"
          onPress={() => router.push("/account/profile")}
        />
      </View>
    </View>
  );
}

type BottomNavItemProps = {
  label: string;
  ios: "house.fill" | "chair.fill" | "book.fill" | "person.fill";
  android: "home" | "chair" | "menu_book" | "person";
  active?: boolean;
  onPress: () => void;
};

function BottomNavItem({
  label,
  ios,
  android,
  active = false,
  onPress,
}: BottomNavItemProps) {
  return (
    <Pressable style={styles.navItem} onPress={onPress}>
      <SymbolView
        name={{
          ios,
          android,
          web: android,
        }}
        size={23}
        tintColor={active ? BLUE : "#8A94A6"}
      />

      <Text style={[styles.navLabel, active && styles.navLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  greeting: {
    flex: 1,
  },

  hello: {
    fontSize: 26,
    fontWeight: "800",
    color: NAVY,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: MUTED,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  notificationButton: {
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
    shadowOpacity: 0.06,
    shadowRadius: 5,

    elevation: 2,
  },

  headerBadge: {
    position: "absolute",
    top: 7,
    right: 8,

    width: 8,
    height: 8,

    borderRadius: 4,

    backgroundColor: "#EF4444",

    borderWidth: 1.5,
    borderColor: "#FFFFFF",
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

    overflow: "hidden",

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,

    elevation: 3,
  },

  headerAvatarImage: {
    width: "100%",
    height: "100%",
  },

  welcomeCard: {
    minHeight: 94,

    borderRadius: 22,

    backgroundColor: "#DCEEFF",

    paddingHorizontal: 20,
    paddingVertical: 18,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 24,
  },

  welcomeTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: NAVY,
  },

  welcomeText: {
    marginTop: 5,
    fontSize: 14,
    color: MUTED,
  },

  welcomeIcon: {
    width: 52,
    height: 52,

    borderRadius: 18,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: NAVY,
  },

  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    paddingHorizontal: 12,
    paddingVertical: 7,

    borderRadius: 16,
  },

  viewAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: BLUE,
  },

  reservationCard: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 22,

    padding: 14,

    marginBottom: 24,

    borderWidth: 1,
    borderColor: BORDER,

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 8,

    elevation: 3,
  },

  reservationPhoto: {
    width: 82,
    height: 82,

    borderRadius: 14,
  },

  reservationBody: {
    flex: 1,
    marginLeft: 14,
  },

  roomName: {
    fontSize: 17,
    fontWeight: "800",
    color: NAVY,
  },

  floor: {
    marginTop: 2,
    marginBottom: 7,

    fontSize: 13,
    color: MUTED,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",

    gap: 5,

    marginTop: 3,
  },

  metaText: {
    fontSize: 12,
    color: MUTED,
  },

  arrowButton: {
    width: 38,
    height: 38,

    borderRadius: 19,

    backgroundColor: LIGHT_BLUE,

    alignItems: "center",
    justifyContent: "center",
  },

  quickTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: NAVY,

    marginBottom: 12,
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

    minHeight: 120,

    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    alignItems: "center",
    justifyContent: "center",

    padding: 14,

    borderWidth: 1,
    borderColor: BORDER,

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 7,

    elevation: 2,
  },

  actionCardPressed: {
    opacity: 0.75,
  },

  actionIcon: {
    width: 58,
    height: 58,

    borderRadius: 20,

    backgroundColor: LIGHT_BLUE,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 10,
  },

  actionLabel: {
    fontSize: 13,
    fontWeight: "700",

    color: NAVY,

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
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  bottomNav: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    minHeight: 70,

    backgroundColor: "#FFFFFF",

    flexDirection: "row",

    paddingTop: 9,
    paddingHorizontal: 10,

    borderTopWidth: 1,
    borderTopColor: BORDER,

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,

    elevation: 12,
  },

  navItem: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    gap: 3,
  },

  navLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8A94A6",
  },

  navLabelActive: {
    color: BLUE,
    fontWeight: "800",
  },
});
