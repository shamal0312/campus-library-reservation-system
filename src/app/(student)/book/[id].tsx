import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import {
    Book,
    getBookById,
} from '../../../services/bookService';

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadBook() {
      if (!id) {
        setError('Book ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const data = await getBookById(id);
        setBook(data);
      } catch (err) {
        console.error(err);
        setError('Could not load book details.');
      } finally {
        setLoading(false);
      }
    }

    loadBook();
  }, [id]);

  function goBack() {
    router.back();
  }

  function reserveBook() {
    if (!book) return;

    router.push({
      pathname: '/(student)/book/reserve',
      params: { id: book.id },
    });
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#1677ff"
        />

        <Text style={styles.loadingText}>
          Loading book...
        </Text>
      </View>
    );
  }

  if (error || !book) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {error || 'Book not found.'}
        </Text>
      </View>
    );
  }

  const available = book.available_copies > 0;

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* IMAGE HERO */}
        <View style={styles.hero}>
          {/* BLURRED BACKGROUND */}
          {book.cover_url ? (
            <Image
              source={{ uri: book.cover_url }}
              style={styles.heroBackground}
              resizeMode="cover"
              blurRadius={25}
            />
          ) : (
            <View style={styles.heroFallback} />
          )}

          <View style={styles.heroOverlay} />

          {/* HEADER */}
          <View style={styles.header}>
            <Pressable
              style={styles.headerButton}
              onPress={goBack}
            >
              <Text style={styles.backArrow}>‹</Text>
            </Pressable>

            <Text style={styles.headerTitle}>
              Book Details
            </Text>

            <View style={styles.headerSpacer} />
          </View>

          {/* BOOK COVER */}
          <View style={styles.coverArea}>
            {book.cover_url ? (
              <Image
                source={{ uri: book.cover_url }}
                style={styles.cover}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Text style={styles.coverIcon}>📚</Text>

                <Text
                  style={styles.coverPlaceholderText}
                  numberOfLines={3}
                >
                  {book.title}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.dots}>
            <View style={styles.activeDot} />
          </View>
        </View>

        {/* WHITE DETAILS SECTION */}
        <View style={styles.detailsSheet}>
          {/* TITLE */}
          <Text style={styles.title}>
            {book.title}
          </Text>

          <Text style={styles.author}>
            {book.author}
          </Text>

          {/* CATEGORY + AVAILABILITY */}
          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {book.category ?? 'Other'}
              </Text>
            </View>

            <View
              style={[
                styles.availabilityBadge,
                available
                  ? styles.availableBadge
                  : styles.unavailableBadge,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  available
                    ? styles.availableDot
                    : styles.unavailableDot,
                ]}
              />

              <Text
                style={[
                  styles.availabilityText,
                  available
                    ? styles.availableText
                    : styles.unavailableText,
                ]}
              >
                {available
                  ? `Available · ${book.available_copies} ${
                      book.available_copies === 1
                        ? 'copy'
                        : 'copies'
                    }`
                  : 'Currently Unavailable'}
              </Text>
            </View>
          </View>

          {/* INFORMATION GRID */}
          <View style={styles.infoGrid}>
            {/* CATEGORY */}
            <View style={styles.infoCard}>
              <View style={styles.infoIconBox}>
                <Text style={styles.infoIcon}>▦</Text>
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>
                  Category
                </Text>

                <Text
                  style={styles.infoValue}
                  numberOfLines={2}
                >
                  {book.category ?? 'N/A'}
                </Text>
              </View>
            </View>

            {/* ISBN */}
            <View style={styles.infoCard}>
              <View style={styles.infoIconBox}>
                <Text style={styles.infoIcon}>▤</Text>
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>
                  ISBN
                </Text>

                <Text
                  style={styles.infoValue}
                  numberOfLines={2}
                >
                  {book.isbn ?? 'N/A'}
                </Text>
              </View>
            </View>

            {/* PUBLISHED */}
            <View style={styles.infoCard}>
              <View style={styles.infoIconBox}>
                <Text style={styles.infoIcon}>▣</Text>
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>
                  Published
                </Text>

                <Text style={styles.infoValue}>
                  {book.published_year ?? 'N/A'}
                </Text>
              </View>
            </View>

            {/* LOCATION */}
            <View style={styles.infoCard}>
              <View style={styles.infoIconBox}>
                <Text style={styles.locationIcon}>⌖</Text>
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>
                  Location
                </Text>

                <Text
                  style={styles.infoValue}
                  numberOfLines={2}
                >
                  Floor 2 · Shelf F-12
                </Text>
              </View>
            </View>
          </View>

          {/* ABOUT */}
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>
              About this book
            </Text>

            <Text style={styles.description}>
              {book.description ??
                'No description available.'}
            </Text>
          </View>

          {/* RESERVE BUTTON */}
          {available ? (
            <Pressable
              style={({ pressed }) => [
                styles.reserveButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={reserveBook}
            >
              <View style={styles.buttonIconBox}>
                <Text style={styles.buttonIcon}>▣</Text>
              </View>

              <Text style={styles.reserveButtonText}>
                Reserve Book
              </Text>
            </Pressable>
          ) : (
            <View style={styles.disabledButton}>
              <Text style={styles.disabledButtonText}>
                Currently Unavailable
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef3fb',
  },

  scrollContent: {
    paddingBottom: 55,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eef3fb',
    paddingHorizontal: 30,
  },

  loadingText: {
    color: '#526581',
    fontSize: 13,
    marginTop: 8,
  },

  errorText: {
    color: '#315d9b',
    fontSize: 14,
    textAlign: 'center',
  },

  /* =========================
     HERO
  ========================= */

  hero: {
    height: 430,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#151515',
  },

  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.65,
    transform: [{ scale: 1.15 }],
  },

  heroFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#172235',
  },

  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },

  /* =========================
     HEADER
  ========================= */

  header: {
    height: 92,
    paddingHorizontal: 18,
    paddingTop: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },

  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backArrow: {
    color: '#ffffff',
    fontSize: 42,
    lineHeight: 42,
    fontWeight: '300',
  },

  headerTitle: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '800',
  },

  headerSpacer: {
    width: 40,
    height: 40,
  },

  /* =========================
     COVER
  ========================= */

  coverArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 20,
  },

  cover: {
    width: 150,
    height: 225,
    borderRadius: 12,
    backgroundColor: '#dddddd',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.42,
    shadowRadius: 12,
    elevation: 10,
  },

  coverPlaceholder: {
    width: 150,
    height: 225,
    borderRadius: 12,
    backgroundColor: '#202020',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.42,
    shadowRadius: 12,
    elevation: 10,
  },

  coverIcon: {
    fontSize: 32,
    marginBottom: 10,
  },

  coverPlaceholderText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },

  dots: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#1680ff',
  },

  /* =========================
     DETAILS SHEET
  ========================= */

  detailsSheet: {
    marginTop: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 30,
    minHeight: 450,
  },

  title: {
    color: '#123f91',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 29,
  },

  author: {
    color: '#53698d',
    fontSize: 14,
    marginTop: 4,
  },

  /* =========================
     BADGES
  ========================= */

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 14,
    marginBottom: 18,
  },

  categoryBadge: {
    backgroundColor: '#e7f1ff',
    borderWidth: 1,
    borderColor: '#9cc2ff',
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 6,
  },

  categoryBadgeText: {
    color: '#1672e8',
    fontSize: 11,
    fontWeight: '700',
  },

  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderWidth: 1,
  },

  availableBadge: {
    backgroundColor: '#e0f9e7',
    borderColor: '#8bdfa0',
  },

  unavailableBadge: {
    backgroundColor: '#e8eef7',
    borderColor: '#b8c6da',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  availableDot: {
    backgroundColor: '#16b84e',
  },

  unavailableDot: {
    backgroundColor: '#718198',
  },

  availabilityText: {
    fontSize: 11,
    fontWeight: '700',
  },

  availableText: {
    color: '#139b40',
  },

  unavailableText: {
    color: '#64748b',
  },

  /* =========================
     INFORMATION GRID
  ========================= */

  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },

  infoCard: {
    width: '48.5%',
    minHeight: 72,
    backgroundColor: '#f8fbff',
    borderWidth: 1,
    borderColor: '#e0eafb',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIconBox: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: '#e9f2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  infoIcon: {
    color: '#1677ff',
    fontSize: 20,
    fontWeight: '700',
  },

  locationIcon: {
    color: '#1677ff',
    fontSize: 23,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    color: '#17243d',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 3,
  },

  infoValue: {
    color: '#53698d',
    fontSize: 10,
    lineHeight: 14,
  },

  /* =========================
     ABOUT
  ========================= */

  aboutSection: {
    marginTop: 22,
    marginBottom: 20,
    paddingHorizontal: 2,
  },

  sectionTitle: {
    color: '#123f91',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 7,
  },

  description: {
    color: '#566b8c',
    fontSize: 12,
    lineHeight: 18,
  },

  /* =========================
     BUTTON
  ========================= */

  reserveButton: {
    height: 52,
    backgroundColor: '#1677ff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#1677ff',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 4,
  },

  buttonPressed: {
    opacity: 0.86,
  },

  buttonIconBox: {
    marginRight: 8,
  },

  buttonIcon: {
    color: '#ffffff',
    fontSize: 18,
  },

  reserveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },

  disabledButton: {
    height: 52,
    backgroundColor: '#dce3ed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButtonText: {
    color: '#718198',
    fontSize: 14,
    fontWeight: '700',
  },
});