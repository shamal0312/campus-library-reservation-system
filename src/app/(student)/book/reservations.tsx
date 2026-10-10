import { useAuth } from "@/contexts/auth-context";

import {
  getMyBookReservations,
  getPreviousBookReservations,
} from "@/services/bookService";

import { router, useFocusEffect } from "expo-router";

import { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

type BookInfo = {
  id: string;
  title: string;
  author: string;
  category: string | null;
  cover_url: string | null;
};

type Reservation = {
  id: string;
  item_name: string;
  status: string;
  start_time: string;
  end_time: string;
  created_at: string;
  book_id: string | null;
  books: BookInfo | null;
};

export default function MyReservationsScreen() {
  const { account } = useAuth();

  const [currentReservations, setCurrentReservations] = useState<Reservation[]>(
    [],
  );

  const [previousReservations, setPreviousReservations] = useState<
    Reservation[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * REFRESH FIX
   *
   * Every time this screen becomes active again,
   * reservations are fetched again.
   *
   * So after editing a reservation and coming
   * back here, the new dates appear immediately.
   */

  useFocusEffect(
    useCallback(() => {
      loadReservations();
    }, [account?.id]),
  );

  async function loadReservations() {
    if (!account?.id) {
      setLoading(false);
      return;
    }

    try {
      setError("");

      const [currentData, previousData] = await Promise.all([
        getMyBookReservations(account.id),
        getPreviousBookReservations(account.id),
      ]);

      setCurrentReservations(currentData as unknown as Reservation[]);

      setPreviousReservations(previousData as unknown as Reservation[]);
    } catch (err) {
      console.error(err);

      setError("Could not load your reservations.");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  /*
   * BACK TO BOOKS INDEX
   */

  function goBackToBooks() {
    router.back();
  }

  function openReservationDetails(reservation: Reservation) {
    router.push({
      pathname: "/(student)/book/reservation-details",
      params: {
        reservationId: reservation.id,
      },
    });
  }

  function getDisplayStatus(item: Reservation, previous: boolean) {
    if (!previous) {
      return "Upcoming";
    }

    if (item.status === "Returned") {
      return "Completed";
    }

    if (item.status === "Cancelled") {
      return "Cancelled";
    }

    return item.status;
  }

  function getStatusBadgeStyle(item: Reservation, previous: boolean) {
    if (!previous) {
      return styles.upcomingBadge;
    }

    if (item.status === "Returned") {
      return styles.completedBadge;
    }

    if (item.status === "Cancelled") {
      return styles.cancelledBadge;
    }

    return styles.previousBadge;
  }

  function getStatusTextStyle(item: Reservation, previous: boolean) {
    if (!previous) {
      return styles.upcomingText;
    }

    if (item.status === "Returned") {
      return styles.completedText;
    }

    if (item.status === "Cancelled") {
      return styles.cancelledText;
    }

    return styles.previousText;
  }

  function renderReservationCard(item: Reservation, previous = false) {
    const book = item.books;

    return (
      <Pressable
        key={item.id}
        style={styles.card}
        onPress={() => openReservationDetails(item)}
      >
        {/* LEFT ACCENT */}

        <View
          style={[
            styles.leftAccent,
            previous && item.status === "Returned"
              ? styles.completedAccent
              : styles.blueAccent,
          ]}
        />

        {/* BOOK COVER */}

        {book?.cover_url ? (
          <Image
            source={{
              uri: book.cover_url,
            }}
            style={styles.cover}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Text style={styles.coverPlaceholderText}>BOOK</Text>
          </View>
        )}

        {/* BOOK INFORMATION */}

        <View style={styles.bookInfo}>
          <View style={styles.topRow}>
            <Text style={styles.bookTitle} numberOfLines={1}>
              {book?.title || item.item_name}
            </Text>

            <View
              style={[styles.statusBadge, getStatusBadgeStyle(item, previous)]}
            >
              <Text
                style={[styles.statusText, getStatusTextStyle(item, previous)]}
              >
                {getDisplayStatus(item, previous)}
              </Text>
            </View>
          </View>

          <Text style={styles.author} numberOfLines={1}>
            {book?.author || "Unknown Author"}
          </Text>

          {/* DATE ROW */}

          <View style={styles.dateRow}>
            <Text style={styles.calendarIcon}>▣</Text>

            <Text style={styles.dateText}>{formatDate(item.start_time)}</Text>

            <Text style={styles.dateArrow}>→</Text>

            <Text style={styles.dateText}>{formatDate(item.end_time)}</Text>
          </View>
        </View>

        {/* ARROW */}

        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>›</Text>
        </View>
      </Pressable>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator size="large" color="#1464ff" />

        <Text style={styles.loadingText}>Loading reservations...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* BACK ARROW */}

            <Pressable
              style={styles.backButton}
              onPress={goBackToBooks}
              hitSlop={10}
            >
              <Text style={styles.backArrow}>‹</Text>
            </Pressable>

            {/* TITLE */}

            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>My Reservations</Text>

              <Text style={styles.subtitle}>Manage your book reservations</Text>
            </View>
          </View>

          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>⌕</Text>
          </View>
        </View>

        {/* SUMMARY TABS */}

        <View style={styles.summaryContainer}>
          <View style={styles.activeSummary}>
            <Text style={styles.activeSummaryText}>
              Current ({currentReservations.length})
            </Text>
          </View>

          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              Previous ({previousReservations.length})
            </Text>
          </View>
        </View>

        {/* ERROR */}

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : null}

        {/* CURRENT RESERVATIONS */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current Reservations</Text>

          {currentReservations.length > 0 ? (
            <Text style={styles.countText}>
              {currentReservations.length}{" "}
              {currentReservations.length === 1 ? "book" : "books"}
            </Text>
          ) : null}
        </View>

        {currentReservations.length === 0 ? (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>📚</Text>
            </View>

            <Text style={styles.emptyTitle}>No current reservations</Text>

            <Text style={styles.empty}>
              Your upcoming book reservations will appear here.
            </Text>
          </View>
        ) : (
          currentReservations.map((item) => renderReservationCard(item))
        )}

        {/* PREVIOUS RESERVATIONS */}

        <View style={styles.previousHeader}>
          <Text style={styles.sectionTitle}>Previous Reservations</Text>

          {previousReservations.length > 0 ? (
            <Text style={styles.countText}>
              {previousReservations.length}{" "}
              {previousReservations.length === 1 ? "book" : "books"}
            </Text>
          ) : null}
        </View>

        {previousReservations.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No previous reservations</Text>

            <Text style={styles.empty}>
              Completed and cancelled reservations will appear here.
            </Text>
          </View>
        ) : (
          previousReservations.map((item) => renderReservationCard(item, true))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f7fb",
  },

  screen: {
    flex: 1,
    backgroundColor: "#f4f7fb",
  },

  container: {
    paddingHorizontal: 20,

    /*
     * Small space AFTER SafeAreaView.
     * This prevents the title from going
     * behind the iPhone time/status bar.
     */
    paddingTop: 8,

    /*
     * Extra bottom room so the final cards
     * can scroll above your bottom tabs.
     */
    paddingBottom: 150,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f7fb",
    gap: 10,
  },

  loadingText: {
    color: "#64748b",
    fontSize: 13,
  },

  /* =========================
     HEADER
  ========================= */

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    minHeight: 52,
  },

  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  /* SMALL BACK BUTTON */

  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,

    backgroundColor: "#ffffff",

    borderWidth: 1,
    borderColor: "#d9e5f7",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 10,

    shadowColor: "#315b9f",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 1,
  },

  backArrow: {
    color: "#1464ff",
    fontSize: 29,
    lineHeight: 30,
    fontWeight: "400",
    marginTop: -2,
  },

  headerTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#0645c4",
    letterSpacing: -0.5,
  },

  subtitle: {
    color: "#74829a",
    fontSize: 11.5,
    marginTop: 3,
  },

  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#e5efff",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  headerIconText: {
    color: "#1464ff",
    fontSize: 22,
    fontWeight: "600",
  },

  /* =========================
     SUMMARY
  ========================= */

  summaryContainer: {
    flexDirection: "row",
    backgroundColor: "#e8eef8",
    borderRadius: 11,
    padding: 4,
    marginBottom: 25,
  },

  activeSummary: {
    flex: 1,
    backgroundColor: "#1464ff",
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: "center",
  },

  activeSummaryText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },

  summary: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
  },

  summaryText: {
    color: "#72809a",
    fontSize: 12,
    fontWeight: "600",
  },

  /* =========================
     SECTIONS
  ========================= */

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 11,
  },

  previousHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 11,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#12203b",
  },

  countText: {
    color: "#7c8aa2",
    fontSize: 11,
    fontWeight: "600",
  },

  /* =========================
     RESERVATION CARD
  ========================= */

  card: {
    position: "relative",
    overflow: "hidden",

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#ffffff",

    borderRadius: 14,

    paddingVertical: 10,
    paddingLeft: 13,
    paddingRight: 10,

    marginBottom: 10,

    borderWidth: 1,
    borderColor: "#e2e9f4",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  leftAccent: {
    position: "absolute",

    left: 0,
    top: 12,
    bottom: 12,

    width: 3,

    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },

  blueAccent: {
    backgroundColor: "#1464ff",
  },

  completedAccent: {
    backgroundColor: "#39b75d",
  },

  /* =========================
     BOOK COVER
  ========================= */

  cover: {
    width: 50,
    height: 70,

    borderRadius: 7,

    backgroundColor: "#e8e8e8",
  },

  coverPlaceholder: {
    width: 50,
    height: 70,

    borderRadius: 7,

    backgroundColor: "#1f1f1f",

    justifyContent: "center",
    alignItems: "center",
  },

  coverPlaceholderText: {
    color: "#ffffff",
    fontSize: 8,
    fontWeight: "800",
  },

  /* =========================
     BOOK INFORMATION
  ========================= */

  bookInfo: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },

  bookTitle: {
    flex: 1,

    fontSize: 14,
    fontWeight: "800",
    color: "#111827",

    marginRight: 6,
  },

  author: {
    fontSize: 11,
    color: "#718096",
    marginBottom: 9,
  },

  /* =========================
     STATUS
  ========================= */

  statusBadge: {
    borderWidth: 1,
    borderRadius: 10,

    paddingHorizontal: 7,
    paddingVertical: 2,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "700",
  },

  /* UPCOMING */

  upcomingBadge: {
    backgroundColor: "#edf4ff",
    borderColor: "#8bb4ff",
  },

  upcomingText: {
    color: "#1464ff",
  },

  /* CANCELLED - BLUE */

  cancelledBadge: {
    backgroundColor: "#edf4ff",
    borderColor: "#8bb4ff",
  },

  cancelledText: {
    color: "#1464ff",
  },

  /* COMPLETED - GREEN */

  completedBadge: {
    backgroundColor: "#e9f9ed",
    borderColor: "#7bd28e",
  },

  completedText: {
    color: "#279143",
  },

  /* FALLBACK */

  previousBadge: {
    backgroundColor: "#f1f3f5",
    borderColor: "#d3d8df",
  },

  previousText: {
    color: "#657080",
  },

  /* =========================
     DATE
  ========================= */

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  calendarIcon: {
    color: "#1464ff",
    fontSize: 11,
    marginRight: 5,
  },

  dateText: {
    color: "#45546d",
    fontSize: 9.5,
    fontWeight: "600",
  },

  dateArrow: {
    color: "#9aa7ba",
    fontSize: 11,
    marginHorizontal: 5,
  },

  /* =========================
     CARD ARROW
  ========================= */

  arrowContainer: {
    width: 27,
    height: 27,

    borderRadius: 14,

    backgroundColor: "#edf4ff",

    justifyContent: "center",
    alignItems: "center",

    marginLeft: 5,
  },

  arrow: {
    color: "#1464ff",

    fontSize: 24,
    fontWeight: "500",

    lineHeight: 25,
  },

  /* =========================
     EMPTY STATE
  ========================= */

  emptyBox: {
    backgroundColor: "#ffffff",

    borderWidth: 1,
    borderColor: "#e2e9f4",

    borderRadius: 14,

    paddingVertical: 25,
    paddingHorizontal: 20,

    alignItems: "center",
  },

  emptyIcon: {
    width: 46,
    height: 46,

    borderRadius: 23,

    backgroundColor: "#edf4ff",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 10,
  },

  emptyIconText: {
    fontSize: 20,
  },

  emptyTitle: {
    color: "#17233b",

    fontSize: 14,
    fontWeight: "700",

    marginBottom: 5,
  },

  empty: {
    color: "#7c899c",

    fontSize: 11,
    textAlign: "center",

    lineHeight: 16,
  },

  /* =========================
     ERROR
  ========================= */

  errorBox: {
    backgroundColor: "#edf4ff",

    borderRadius: 10,

    padding: 11,
    marginBottom: 18,
  },

  error: {
    color: "#1464ff",
    fontSize: 12,
  },
});
