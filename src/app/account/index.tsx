import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BottomNavBar from "@/components/BottomNavBar";
import AppScreen from "@/components/themes/AppScreen";

import { useAppearance } from "@/contexts/appearance-context";
import { useAuth } from "@/contexts/auth-context";

import { listBookings } from "@/features/booking/repository";
import { getMyBookReservations } from "@/services/bookService";
import { getUnreadNotificationCount } from "@/services/notifications";
import { syncUpcomingReservationReminders } from "@/services/reservation-reminders";

import GetStartedScreen from "../(auth)/get-started";

const ACTIONS: {
  label: string;
  description: string;
  ios: "book.fill" | "chair.fill" | "door.left.hand.open" | "bell.fill";
  android: "menu_book" | "chair" | "meeting_room" | "notifications";
  route?: string;
}[] = [
  {
    label: "Books",
    description: "Find & reserve",
    ios: "book.fill",
    android: "menu_book",
    route: "/(student)/book",
  },
  {
    label: "Seats",
    description: "Book a seat",
    ios: "chair.fill",
    android: "chair",
    route: "/booking/seat-availability",
  },
  {
    label: "Study Rooms",
    description: "Reserve a room",
    ios: "door.left.hand.open",
    android: "meeting_room",
    route: "/booking/room-request",
  },
  {
    label: "Notifications",
    description: "View updates",
    ios: "bell.fill",
    android: "notifications",
    route: "/account/notifications",
  },
];

type HomeReservation = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  type: "Seat" | "Room" | "Book";
  ios: "chair.fill" | "door.left.hand.open" | "book.fill";
  android: "chair" | "meeting_room" | "menu_book";
  sortTime: number;
};

type BookReservationRow = {
  id: string;
  item_name?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  created_at?: string | null;
  books?:
    | {
        id?: string;
        title?: string;
        author?: string;
        category?: string;
        cover_url?: string;
      }
    | {
        id?: string;
        title?: string;
        author?: string;
        category?: string;
        cover_url?: string;
      }[]
    | null;
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const { session, account, isLoading } = useAuth();
  const { appearance, theme } = useAppearance();

  const isDark = appearance === "dark";

  const [unreadCount, setUnreadCount] = useState(0);

  const [reservations, setReservations] = useState<HomeReservation[]>([]);
  const [isReservationsLoading, setIsReservationsLoading] = useState(true);
  const [reservationError, setReservationError] = useState<string | null>(null);

  const isSignedIn = !isLoading && !!session && !!account?.role;

  const loadUnreadCount = useCallback(async () => {
    if (!session) {
      setUnreadCount(0);
      return;
    }

    await syncUpcomingReservationReminders();

    const result = await getUnreadNotificationCount();

    if (!result.error) {
      setUnreadCount(result.count);
    }
  }, [session]);

  const loadReservations = useCallback(async () => {
    if (!session?.user?.id) {
      setReservations([]);
      setIsReservationsLoading(false);
      setReservationError(null);
      return;
    }

    setIsReservationsLoading(true);
    setReservationError(null);

    try {
      const userId = session.user.id;

      const [bookingResult, bookResult] = await Promise.allSettled([
        listBookings(),
        getMyBookReservations(userId),
      ]);

      const combinedReservations: HomeReservation[] = [];

      const now = new Date();

      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).getTime();

      if (bookingResult.status === "fulfilled") {
        bookingResult.value
          .filter((booking) => {
            const startTime = new Date(booking.start_at).getTime();

            const inactiveStatuses = ["cancelled", "rejected"];

            return (
              !inactiveStatuses.includes(booking.status) &&
              Number.isFinite(startTime) &&
              startTime >= todayStart
            );
          })
          .forEach((booking) => {
            const isSeat = booking.kind === "seat";

            combinedReservations.push({
              id: `booking-${booking.id}`,

              title: booking.resource_label,

              subtitle: isSeat
                ? booking.floor > 0
                  ? `Floor ${booking.floor}`
                  : "Seat Reservation"
                : booking.floor > 0
                  ? `Study Room · Floor ${booking.floor}`
                  : "Study Room Reservation",

              date: formatReservationDate(booking.start_at),

              time: formatReservationTime(booking.start_at, booking.end_at),

              type: isSeat ? "Seat" : "Room",

              ios: isSeat ? "chair.fill" : "door.left.hand.open",

              android: isSeat ? "chair" : "meeting_room",

              sortTime: new Date(booking.start_at).getTime(),
            });
          });
      }

      if (bookResult.status === "fulfilled") {
        const bookReservations = bookResult.value as BookReservationRow[];

        bookReservations
          .filter((reservation) => {
            if (!reservation.start_time) {
              return false;
            }

            const startTime = new Date(reservation.start_time).getTime();

            return Number.isFinite(startTime) && startTime >= todayStart;
          })
          .forEach((reservation) => {
            const book = getBookDetails(reservation.books);

            combinedReservations.push({
              id: `book-${reservation.id}`,

              title: book?.title || reservation.item_name || "Book Reservation",

              subtitle: book?.author || "Book Reservation",

              date: reservation.start_time
                ? formatReservationDate(reservation.start_time)
                : "",

              time: "Pickup",

              type: "Book",

              ios: "book.fill",

              android: "menu_book",

              sortTime: reservation.start_time
                ? new Date(reservation.start_time).getTime()
                : Number.MAX_SAFE_INTEGER,
            });
          });
      }

      combinedReservations.sort((a, b) => a.sortTime - b.sortTime);

      setReservations(combinedReservations.slice(0, 6));

      if (
        bookingResult.status === "rejected" &&
        bookResult.status === "rejected"
      ) {
        setReservationError("Could not load your reservations.");
      }
    } catch (error) {
      console.error("Error loading home reservations:", error);

      setReservations([]);
      setReservationError("Could not load your reservations.");
    } finally {
      setIsReservationsLoading(false);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      loadUnreadCount();
      loadReservations();
    }, [loadUnreadCount, loadReservations]),
  );

  if (!isSignedIn) {
    return <GetStartedScreen />;
  }

  const firstName = account.fullName.trim().split(" ")[0] || "User";

  return (
    <AppScreen>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 110,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.greeting}>
            <Text
              style={[
                styles.greetingSmall,
                {
                  color: theme.textSecondary,
                },
              ]}
            >
              Welcome back
            </Text>

            <Text
              style={[
                styles.hello,
                {
                  color: theme.text,
                },
              ]}
            >
              Hello, {firstName}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <Pressable
              style={[
                styles.headerButton,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => router.push("/account/notifications")}
            >
              <SymbolView
                name={{
                  ios: "bell.fill",
                  android: "notifications",
                  web: "notifications",
                }}
                size={21}
                tintColor={theme.text}
              />

              {unreadCount > 0 ? (
                <View
                  style={[
                    styles.headerBadge,
                    {
                      borderColor: theme.surface,
                      backgroundColor: theme.danger,
                    },
                  ]}
                >
                  <Text style={styles.headerBadgeText}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Text>
                </View>
              ) : null}
            </Pressable>

            <Pressable
              style={[
                styles.avatar,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.surface,
                },
              ]}
              onPress={() => router.push("/account/profile")}
            >
              {account.avatarUrl ? (
                <Image
                  source={{
                    uri: account.avatarUrl,
                  }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <SymbolView
                  name={{
                    ios: "person.fill",
                    android: "person",
                    web: "person",
                  }}
                  size={23}
                  tintColor={theme.primary}
                />
              )}
            </Pressable>
          </View>
        </View>

        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.surfaceSecondary,
            },
          ]}
        >
          <Image
            source={require("@/assets/images/library-aisle.jpg")}
            style={styles.heroImage}
            contentFit="cover"
          />

          <LinearGradient
            colors={["rgba(8,29,53,0.12)", "rgba(8,29,53,0.88)"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.heroOverlay}
          >
            <View style={styles.heroBadge}>
              <SymbolView
                name={{
                  ios: "books.vertical.fill",
                  android: "local_library",
                  web: "local_library",
                }}
                size={16}
                tintColor="#FFFFFF"
              />

              <Text style={styles.heroBadgeText}>Smart Library</Text>
            </View>

            <View style={styles.heroBottom}>
              <Text style={styles.heroTitle}>Your library, one tap away</Text>

              <Text style={styles.heroText}>
                Reserve books, seats and study rooms with ease.
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.text,
              },
            ]}
          >
            Quick Access
          </Text>

          <Text
            style={[
              styles.sectionSubtitle,
              {
                color: theme.textSecondary,
              },
            ]}
          >
            What would you like to do?
          </Text>
        </View>

        <View style={styles.actionsGrid}>
          {ACTIONS.map((action) => {
            const isNotification = action.label === "Notifications";

            return (
              <Pressable
                key={action.label}
                style={({ pressed }) => [
                  styles.actionCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                  pressed && styles.actionCardPressed,
                ]}
                onPress={() => {
                  if (action.route) {
                    router.push(action.route as never);
                  }
                }}
              >
                <View
                  style={[
                    styles.actionIcon,
                    {
                      backgroundColor: theme.primarySoft,
                    },
                  ]}
                >
                  <SymbolView
                    name={{
                      ios: action.ios,
                      android: action.android,
                      web: action.android,
                    }}
                    size={27}
                    tintColor={theme.primary}
                  />

                  {isNotification && unreadCount > 0 ? (
                    <View
                      style={[
                        styles.actionBadge,
                        {
                          backgroundColor: theme.danger,
                          borderColor: theme.surface,
                        },
                      ]}
                    >
                      <Text style={styles.actionBadgeText}>
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <Text
                  style={[
                    styles.actionLabel,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  {action.label}
                </Text>

                <Text
                  style={[
                    styles.actionDescription,
                    {
                      color: theme.textSecondary,
                    },
                  ]}
                >
                  {action.description}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.reservationHeader}>
          <View style={styles.reservationHeaderText}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Upcoming Reservations
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                {
                  color: theme.textSecondary,
                },
              ]}
            >
              Your next library bookings
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.viewAllButton,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
              pressed && styles.viewAllButtonPressed,
            ]}
            onPress={() => router.push("/account/all-reservations" as never)}
          >
            <Text
              style={[
                styles.viewAllText,
                {
                  color: theme.primary,
                },
              ]}
            >
              View All
            </Text>

            <SymbolView
              name={{
                ios: "chevron.right",
                android: "chevron_right",
                web: "chevron_right",
              }}
              size={14}
              tintColor={theme.primary}
            />
          </Pressable>
        </View>

        {isReservationsLoading ? (
          <View
            style={[
              styles.reservationLoadingCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <ActivityIndicator size="small" color={theme.primary} />

            <Text
              style={[
                styles.reservationLoadingText,
                {
                  color: theme.textSecondary,
                },
              ]}
            >
              Loading reservations...
            </Text>
          </View>
        ) : reservationError && reservations.length === 0 ? (
          <View
            style={[
              styles.emptyReservationCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.emptyReservationIcon,
                {
                  backgroundColor: isDark ? "#3A2020" : "#FEF2F2",
                },
              ]}
            >
              <SymbolView
                name={{
                  ios: "exclamationmark.circle.fill",
                  android: "error",
                  web: "error",
                }}
                size={26}
                tintColor={theme.danger}
              />
            </View>

            <Text
              style={[
                styles.emptyReservationTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Could not load reservations
            </Text>

            <Text
              style={[
                styles.emptyReservationText,
                {
                  color: theme.textSecondary,
                },
              ]}
            >
              {reservationError}
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.reservationRetryButton,
                {
                  backgroundColor: theme.primary,
                },
                pressed && styles.reservationRetryPressed,
              ]}
              onPress={loadReservations}
            >
              <Text style={styles.reservationRetryText}>Try Again</Text>
            </Pressable>
          </View>
        ) : reservations.length === 0 ? (
          <View
            style={[
              styles.emptyReservationCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.emptyReservationIcon,
                {
                  backgroundColor: theme.primarySoft,
                },
              ]}
            >
              <SymbolView
                name={{
                  ios: "calendar",
                  android: "calendar_today",
                  web: "calendar_today",
                }}
                size={26}
                tintColor={theme.primary}
              />
            </View>

            <Text
              style={[
                styles.emptyReservationTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              No Upcoming Reservations
            </Text>

            <Text
              style={[
                styles.emptyReservationText,
                {
                  color: theme.textSecondary,
                },
              ]}
            >
              Your upcoming book, seat and study room reservations will appear
              here.
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reservationList}
          >
            {reservations.map((reservation) => (
              <View
                key={reservation.id}
                style={[
                  styles.reservationCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
              >
                <View style={styles.reservationTop}>
                  <View
                    style={[
                      styles.reservationIcon,
                      {
                        backgroundColor: theme.primarySoft,
                      },
                    ]}
                  >
                    <SymbolView
                      name={{
                        ios: reservation.ios,
                        android: reservation.android,
                        web: reservation.android,
                      }}
                      size={23}
                      tintColor={theme.primary}
                    />
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: isDark ? "#143322" : "#ECFDF3",
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor: theme.success,
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: isDark ? "#86EFAC" : "#15803D",
                        },
                      ]}
                    >
                      Upcoming
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.reservationName,
                    {
                      color: theme.text,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {reservation.title}
                </Text>

                <Text
                  style={[
                    styles.reservationSubtitle,
                    {
                      color: theme.textSecondary,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {reservation.subtitle}
                </Text>

                <View
                  style={[
                    styles.reservationDivider,
                    {
                      backgroundColor: theme.border,
                    },
                  ]}
                />

                <View style={styles.reservationMetaRow}>
                  <View
                    style={[
                      styles.smallMetaIcon,
                      {
                        backgroundColor: theme.primarySoft,
                      },
                    ]}
                  >
                    <SymbolView
                      name={{
                        ios: "calendar",
                        android: "calendar_today",
                        web: "calendar_today",
                      }}
                      size={14}
                      tintColor={theme.primary}
                    />
                  </View>

                  <Text
                    style={[
                      styles.metaValue,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    {reservation.date}
                  </Text>
                </View>

                <View style={styles.reservationMetaRow}>
                  <View
                    style={[
                      styles.smallMetaIcon,
                      {
                        backgroundColor: theme.primarySoft,
                      },
                    ]}
                  >
                    <SymbolView
                      name={{
                        ios: "clock.fill",
                        android: "schedule",
                        web: "schedule",
                      }}
                      size={14}
                      tintColor={theme.primary}
                    />
                  </View>

                  <Text
                    style={[
                      styles.metaValue,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    {reservation.time}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        <View
          style={[
            styles.tipCard,
            {
              backgroundColor: theme.primarySoft,
            },
          ]}
        >
          <View
            style={[
              styles.tipIcon,
              {
                backgroundColor: theme.surface,
              },
            ]}
          >
            <SymbolView
              name={{
                ios: "lightbulb.fill",
                android: "lightbulb",
                web: "lightbulb",
              }}
              size={22}
              tintColor={theme.primary}
            />
          </View>

          <View style={styles.tipContent}>
            <Text
              style={[
                styles.tipTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Plan your study time
            </Text>

            <Text
              style={[
                styles.tipText,
                {
                  color: theme.textSecondary,
                },
              ]}
            >
              Reserve your preferred space early to make your library visit
              easier.
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomNavBar active="home" />
    </AppScreen>
  );
}

function getBookDetails(books: BookReservationRow["books"]) {
  if (!books) {
    return null;
  }

  if (Array.isArray(books)) {
    return books[0] ?? null;
  }

  return books;
}

function formatReservationDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function formatReservationTime(startValue: string, endValue: string) {
  const start = new Date(startValue);
  const end = new Date(endValue);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "";
  }

  const startTime = start.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const endTime = end.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${startTime} - ${endTime}`;
}

const styles = StyleSheet.create({
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
    marginBottom: 20,
  },

  greeting: {
    flex: 1,
  },

  greetingSmall: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },

  hello: {
    fontSize: 26,
    fontWeight: "800",
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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

  headerBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },

  headerBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
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

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  heroCard: {
    height: 190,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 26,
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },

  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 18,
    justifyContent: "space-between",
  },

  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 16,
  },

  heroBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  heroBottom: {
    maxWidth: 300,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 29,
  },

  heroText: {
    marginTop: 5,
    color: "#E6EDF5",
    fontSize: 13,
    lineHeight: 18,
  },

  sectionHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
  },

  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    marginBottom: 26,
  },

  actionCard: {
    width: "48.3%",
    minHeight: 138,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
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

  actionCardPressed: {
    opacity: 0.78,
  },

  actionIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  actionLabel: {
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },

  actionDescription: {
    marginTop: 4,
    fontSize: 11,
    textAlign: "center",
  },

  actionBadge: {
    position: "absolute",
    top: -7,
    right: -7,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },

  actionBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  reservationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 10,
  },

  reservationHeaderText: {
    flex: 1,
  },

  viewAllButton: {
    minHeight: 34,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },

  viewAllButtonPressed: {
    opacity: 0.75,
  },

  viewAllText: {
    fontSize: 11,
    fontWeight: "700",
  },

  reservationList: {
    gap: 12,
    paddingRight: 20,
    paddingBottom: 22,
  },

  reservationCard: {
    width: 205,
    minHeight: 190,
    borderRadius: 20,
    padding: 15,
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

  reservationTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  reservationIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "700",
  },

  reservationName: {
    fontSize: 16,
    fontWeight: "800",
  },

  reservationSubtitle: {
    marginTop: 3,
    fontSize: 11,
  },

  reservationDivider: {
    height: 1,
    marginVertical: 12,
  },

  reservationMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 7,
  },

  smallMetaIcon: {
    width: 27,
    height: 27,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  metaValue: {
    fontSize: 11,
    fontWeight: "600",
    flexShrink: 1,
  },

  reservationLoadingCard: {
    minHeight: 120,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
    gap: 10,
  },

  reservationLoadingText: {
    fontSize: 12,
  },

  emptyReservationCard: {
    minHeight: 150,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginBottom: 22,
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  emptyReservationIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  emptyReservationTitle: {
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyReservationText: {
    marginTop: 5,
    maxWidth: 290,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },

  reservationRetryButton: {
    marginTop: 13,
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 13,
  },

  reservationRetryPressed: {
    opacity: 0.8,
  },

  reservationRetryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 15,
    marginBottom: 8,
  },

  tipIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 13,
    fontWeight: "800",
  },

  tipText: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
  },
});
