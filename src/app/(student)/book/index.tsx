import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import BottomNavBar from "@/components/BottomNavBar";
import { Book, getBooks, searchBooks } from "../../../services/bookService";

/*
  ============================================================
  HEADER IMAGE
  ============================================================

  Paste your image URL between the quotes below.

  Example:
  const HEADER_IMAGE_URL =
    'https://your-image-url.com/library.jpg';

  If you later upload an image to Supabase Storage,
  paste its public URL here.
*/

const HEADER_IMAGE_URL =
  "https://yavaxhzaegetmwgfsqzh.supabase.co/storage/v1/object/public/book-covers/b.png";

export default function BookSearchScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  /*
    Refresh books every time this screen becomes active.

    This also helps the available copy count update
    immediately after reserving/cancelling a book.
  */
  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, []),
  );

  async function loadBooks() {
    try {
      setLoading(true);
      setError("");

      const data = await getBooks();

      setBooks(data);
    } catch (err) {
      console.error(err);
      setError("Could not load books.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(text: string) {
    setSearchText(text);

    try {
      setError("");

      const data = await searchBooks(text);

      setBooks(data);
    } catch (err) {
      console.error(err);
      setError("Could not search books.");
    }
  }

  function openBookDetails(bookId: string) {
    router.push({
      pathname: "/(student)/book/[id]",
      params: {
        id: bookId,
      },
    });
  }

  function openMyReservations() {
    router.push("/(student)/book/reservations");
  }

  /*
    ============================================================
    CATEGORIES
    ============================================================
  */

  const categories = useMemo(() => {
    const bookCategories = books
      .map((book) => book.category)
      .filter(
        (category): category is string =>
          !!category && category.trim().length > 0,
      );

    return ["All", ...Array.from(new Set(bookCategories))];
  }, [books]);

  /*
    ============================================================
    FILTERED BOOKS
    ============================================================
  */

  const filteredBooks = useMemo(() => {
    if (selectedCategory === "All") {
      return books;
    }

    return books.filter((book) => book.category === selectedCategory);
  }, [books, selectedCategory]);

  /*
    ============================================================
    LOADING
    ============================================================
  */

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1677ff" />

        <Text style={styles.loadingText}>Loading books...</Text>
      </View>
    );
  }

  /*
    ============================================================
    SCREEN
    ============================================================
  */

  return (
    <View style={styles.screen}>
      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* ================================================= */}
            {/* IMAGE HEADER */}
            {/* ================================================= */}

            <ImageBackground
              source={{ uri: HEADER_IMAGE_URL }}
              style={styles.header}
              imageStyle={styles.headerImage}
            >
              {/* Dark overlay so title is readable */}

              <View style={styles.headerOverlay} />

              <View style={styles.headerContent}>
                <Text style={styles.title}>Book Reservation</Text>

                <Text style={styles.subtitle}>Discover. Reserve. Read.</Text>
              </View>
            </ImageBackground>

            {/* ================================================= */}
            {/* SEARCH */}
            {/* ================================================= */}

            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>⌕</Text>

              <TextInput
                style={styles.searchInput}
                placeholder="Search title, author, ISBN or category..."
                placeholderTextColor="#7d8ba5"
                value={searchText}
                onChangeText={handleSearch}
                autoCapitalize="none"
              />
            </View>

            {/* ================================================= */}
            {/* MY RESERVATIONS - OPTION 7 STYLE */}
            {/* ================================================= */}

            <View style={styles.reservationSection}>
              <Pressable
                style={styles.reservationCard}
                onPress={openMyReservations}
              >
                <View style={styles.reservationLeft}>
                  <View style={styles.reservationSmallIcon}>
                    <Text style={styles.reservationSmallIconText}>◫</Text>
                  </View>

                  <View style={styles.reservationTextArea}>
                    <Text style={styles.reservationsButtonText}>
                      My Reservations
                    </Text>

                    <Text style={styles.reservationsButtonSubtitle}>
                      View, edit or cancel your book reservations
                    </Text>
                  </View>
                </View>

                <View style={styles.reservationAction}>
                  <Text style={styles.reservationActionText}>View</Text>

                  <Text style={styles.reservationArrow}>›</Text>
                </View>
              </Pressable>
            </View>

            {/* ================================================= */}
            {/* CATEGORIES */}
            {/* ================================================= */}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContainer}
            >
              {categories.map((category) => {
                const selected = selectedCategory === category;

                return (
                  <Pressable
                    key={category}
                    style={[
                      styles.categoryButton,
                      selected && styles.categoryButtonSelected,
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        selected && styles.categoryButtonTextSelected,
                      ]}
                    >
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* ================================================= */}
            {/* BOOK COUNT */}
            {/* ================================================= */}

            <View style={styles.resultRow}>
              <Text style={styles.resultText}>
                {filteredBooks.length}{" "}
                {filteredBooks.length === 1 ? "book" : "books"} found
              </Text>

              <View style={styles.sortBox}>
                <Text style={styles.sortText}>Title (A-Z)</Text>
              </View>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        }
        /*
          =========================================================
          EMPTY
          =========================================================
        */

        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No books found</Text>

            <Text style={styles.empty}>Try another search or category.</Text>
          </View>
        }
        /*
          =========================================================
          BOOK CARDS
          =========================================================
        */

        renderItem={({ item }) => {
          const available = item.available_copies > 0;

          return (
            <Pressable
              style={styles.bookCard}
              onPress={() => openBookDetails(item.id)}
            >
              {/* BOOK COVER */}

              {item.cover_url ? (
                <Image
                  source={{
                    uri: item.cover_url,
                  }}
                  style={styles.bookCover}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.coverPlaceholder}>
                  <Text style={styles.coverIcon}>📚</Text>

                  <Text style={styles.coverPlaceholderText} numberOfLines={2}>
                    {item.title}
                  </Text>
                </View>
              )}

              {/* BOOK INFO */}

              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={2}>
                  {item.title}
                </Text>

                <Text style={styles.author} numberOfLines={1}>
                  {item.author}
                </Text>

                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText} numberOfLines={1}>
                    {item.category ?? "Other"}
                  </Text>
                </View>

                <View style={styles.availabilityRow}>
                  <Text style={styles.bookStack}>▤</Text>

                  <Text style={styles.availableLabel}>Available:</Text>

                  <Text
                    style={[
                      styles.availableNumber,
                      !available && styles.unavailableNumber,
                    ]}
                  >
                    {item.available_copies}
                  </Text>
                </View>
              </View>

              {/* ARROW */}

              <View style={styles.arrowCircle}>
                <Text style={styles.arrow}>›</Text>
              </View>
            </Pressable>
          );
        }}
      />

      <BottomNavBar active="books" />
    </View>
  );
}

/*
  ================================================================
  STYLES
  ================================================================
*/

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f8fc",
  },

  listContent: {
    paddingBottom: 110,
  },

  /*
    LOADING
  */

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f8fc",
  },

  loadingText: {
    marginTop: 8,
    color: "#526581",
    fontSize: 13,
  },

  /*
    ============================================================
    IMAGE HEADER
    ============================================================
  */

  header: {
    height: 150,
    justifyContent: "flex-end",
    overflow: "hidden",
    backgroundColor: "#172b4d",
  },

  headerImage: {
    resizeMode: "cover",
  },

  headerOverlay: {
    ...StyleSheet.absoluteFill,

    /*
      This is NOT the old blue header.

      It is only a transparent dark layer over your picture
      so white text stays readable.
    */

    backgroundColor: "rgba(10, 25, 50, 0.38)",
  },

  headerContent: {
    paddingHorizontal: 20,
    paddingBottom: 34,
  },

  title: {
    color: "#ffffff",
    fontSize: 27,
    fontWeight: "800",

    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 4,
  },

  subtitle: {
    color: "#f1f5fb",
    fontSize: 15,
    marginTop: 3,

    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 3,
  },

  /*
    ============================================================
    SEARCH
    ============================================================
  */

  searchContainer: {
    marginHorizontal: 20,
    marginTop: -18,

    backgroundColor: "#ffffff",

    borderRadius: 17,

    minHeight: 55,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 16,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.08,
    shadowRadius: 8,

    elevation: 4,
  },

  searchIcon: {
    fontSize: 27,
    color: "#24436d",
    marginRight: 9,
  },

  searchInput: {
    flex: 1,

    fontSize: 14,

    color: "#172b4d",
  },

  /*
    ============================================================
    MY RESERVATIONS
    ============================================================
  */

  reservationSection: {
    paddingHorizontal: 20,
    paddingTop: 17,
  },

  reservationCard: {
    backgroundColor: "#ffffff",

    borderRadius: 17,

    minHeight: 72,

    paddingHorizontal: 14,
    paddingVertical: 12,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    borderWidth: 1,
    borderColor: "#e3e9f2",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.04,
    shadowRadius: 5,

    elevation: 2,
  },

  reservationLeft: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",
  },

  reservationSmallIcon: {
    width: 43,
    height: 43,

    borderRadius: 13,

    backgroundColor: "#f1f4f8",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 11,
  },

  reservationSmallIconText: {
    color: "#1d4f91",

    fontSize: 22,
    fontWeight: "600",
  },

  reservationTextArea: {
    flex: 1,
  },

  reservationsButtonText: {
    color: "#172b4d",

    fontSize: 15,
    fontWeight: "800",
  },

  reservationsButtonSubtitle: {
    color: "#718198",

    fontSize: 10,

    marginTop: 3,
  },

  reservationAction: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#f4f6f9",

    borderRadius: 15,

    paddingLeft: 11,
    paddingRight: 8,
    paddingVertical: 7,

    marginLeft: 7,
  },

  reservationActionText: {
    color: "#365779",

    fontSize: 10,
    fontWeight: "700",
  },

  reservationArrow: {
    color: "#365779",

    fontSize: 20,
    lineHeight: 20,

    marginLeft: 4,
  },

  /*
    ============================================================
    CATEGORIES
    ============================================================
  */

  categoryContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,

    gap: 8,
  },

  categoryButton: {
    backgroundColor: "#e8f0fa",

    borderRadius: 20,

    paddingHorizontal: 16,
    paddingVertical: 9,
  },

  categoryButtonSelected: {
    backgroundColor: "#2180f5",
  },

  categoryButtonText: {
    color: "#385477",

    fontSize: 12,

    fontWeight: "600",
  },

  categoryButtonTextSelected: {
    color: "#ffffff",
  },

  /*
    ============================================================
    RESULTS
    ============================================================
  */

  resultRow: {
    paddingHorizontal: 20,

    marginTop: 5,
    marginBottom: 12,

    flexDirection: "row",

    justifyContent: "space-between",
    alignItems: "center",
  },

  resultText: {
    color: "#16294a",

    fontSize: 14,

    fontWeight: "700",
  },

  sortBox: {
    backgroundColor: "#ffffff",

    borderRadius: 16,

    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  sortText: {
    color: "#304d74",

    fontSize: 11,

    fontWeight: "600",
  },

  /*
    ============================================================
    BOOK CARD
    ============================================================
  */

  bookCard: {
    backgroundColor: "#ffffff",

    marginHorizontal: 20,
    marginBottom: 12,

    borderRadius: 17,

    padding: 11,

    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.05,
    shadowRadius: 6,

    elevation: 2,
  },

  bookCover: {
    width: 68,
    height: 98,

    borderRadius: 8,

    backgroundColor: "#e8e8e8",
  },

  coverPlaceholder: {
    width: 68,
    height: 98,

    borderRadius: 8,

    backgroundColor: "#e8f0fa",

    justifyContent: "center",
    alignItems: "center",

    padding: 6,
  },

  coverIcon: {
    fontSize: 23,

    marginBottom: 5,
  },

  coverPlaceholderText: {
    textAlign: "center",

    color: "#415b7d",

    fontSize: 9,

    fontWeight: "700",
  },

  bookInfo: {
    flex: 1,

    marginLeft: 13,
  },

  bookTitle: {
    fontSize: 16,

    fontWeight: "800",

    color: "#10254a",
  },

  author: {
    fontSize: 13,

    color: "#52698a",

    marginTop: 2,
  },

  categoryBadge: {
    alignSelf: "flex-start",

    backgroundColor: "#e7f1ff",

    borderRadius: 14,

    paddingHorizontal: 9,
    paddingVertical: 4,

    marginTop: 7,

    maxWidth: "95%",
  },

  categoryBadgeText: {
    color: "#1672e8",

    fontSize: 10,

    fontWeight: "700",
  },

  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 7,
  },

  bookStack: {
    fontSize: 15,

    color: "#45658d",

    marginRight: 6,
  },

  availableLabel: {
    color: "#405b7d",

    fontSize: 12,
  },

  availableNumber: {
    color: "#0c9a42",

    fontSize: 14,

    fontWeight: "800",

    marginLeft: 4,
  },

  unavailableNumber: {
    color: "#e32626",
  },

  arrowCircle: {
    width: 34,
    height: 34,

    borderRadius: 17,

    backgroundColor: "#edf4fd",

    justifyContent: "center",
    alignItems: "center",

    marginLeft: 5,
  },

  arrow: {
    color: "#255990",

    fontSize: 27,

    lineHeight: 28,
  },

  /*
    ============================================================
    OTHER
    ============================================================
  */

  error: {
    color: "#d82323",

    marginHorizontal: 20,
    marginBottom: 12,

    fontSize: 12,
  },

  emptyBox: {
    marginHorizontal: 20,

    backgroundColor: "#ffffff",

    padding: 25,

    borderRadius: 17,

    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 15,

    fontWeight: "700",

    color: "#172b4d",
  },

  empty: {
    marginTop: 5,

    color: "#718198",

    textAlign: "center",

    fontSize: 12,
  },
});
