import { useAuth } from '@/contexts/auth-context';
import {
    cancelBookReservation,
    getBookReservationById,
} from '@/services/bookService';
import {
    router,
    useFocusEffect,
    useLocalSearchParams,
} from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type BookInfo = {
  id: string;
  title: string;
  author: string;
  category: string | null;
  cover_url: string | null;
};

type Reservation = {
  id: string;
  user_id: string;
  student_id: string;
  student_name: string;
  item_type: string;
  item_name: string;
  book_id: string | null;
  status: string;
  start_time: string;
  end_time: string;
  created_at: string;
  books: BookInfo | null;
};

export default function ReservationDetailsScreen() {
  const { reservationId } = useLocalSearchParams<{
    reservationId: string;
  }>();

  const { account } = useAuth();

  const [reservation, setReservation] =
    useState<Reservation | null>(null);

  const [loading, setLoading] = useState(true);

  const [showCancelModal, setShowCancelModal] =
    useState(false);

  const [cancelling, setCancelling] =
    useState(false);

  // Refresh whenever this screen becomes active again.
  // This keeps edited dates immediately updated.
  useFocusEffect(
    useCallback(() => {
      loadReservation();
    }, [reservationId, account?.id])
  );

  async function loadReservation() {
    if (!reservationId || !account?.id) {
      setLoading(false);
      return;
    }

    try {
      const data = await getBookReservationById(
        reservationId,
        account.id
      );

      setReservation(
        data as unknown as Reservation
      );
    } catch (error) {
      console.error(
        'Error loading reservation:',
        error
      );

      Alert.alert(
        'Error',
        'Could not load reservation details.'
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  function getDisplayStatus(status: string) {
    if (status === 'Returned') {
      return 'Completed';
    }

    return status;
  }

  function openEditReservation() {
    if (!reservation) return;

    if (reservation.status !== 'Reserved') {
      return;
    }

    router.push({
      pathname:
        '/(student)/book/edit-reservation',
      params: {
        reservationId: reservation.id,
      },
    });
  }

  function openCancelReservation() {
    if (!reservation) return;

    if (reservation.status !== 'Reserved') {
      return;
    }

    setShowCancelModal(true);
  }

  async function confirmCancellation() {
    if (!reservation || !account?.id) {
      return;
    }

    try {
      setCancelling(true);

      await cancelBookReservation(
        reservation.id,
        account.id
      );

      setShowCancelModal(false);

      router.replace(
        '/(student)/book/reservations'
      );
    } catch (error) {
      console.error(
        'Error cancelling reservation:',
        error
      );

      Alert.alert(
        'Cancellation Failed',
        'Could not cancel this reservation. Please try again.'
      );
    } finally {
      setCancelling(false);
    }
  }

  function goBackToReservations() {
    router.replace(
      '/(student)/book/reservations'
    );
  }

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top']}
      >
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#1464ff"
          />

          <Text style={styles.loadingText}>
            Loading reservation...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!reservation) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top']}
      >
        <View style={styles.center}>
          <Text style={styles.notFoundText}>
            Reservation not found.
          </Text>

          <Pressable
            style={styles.backButton}
            onPress={goBackToReservations}
          >
            <Text style={styles.backButtonText}>
              Back to My Reservations
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const book = reservation.books;

  const isCurrent =
    reservation.status === 'Reserved';

  const isCompleted =
    reservation.status === 'Returned';

  const displayStatus =
    getDisplayStatus(reservation.status);

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.pageHeader}>
          <Pressable
            style={({ pressed }) => [
              styles.topBackButton,
              pressed && styles.topBackButtonPressed,
            ]}
            onPress={goBackToReservations}
            hitSlop={10}
          >
            <Text style={styles.topBackArrow}>‹</Text>
          </Pressable>

          <View style={styles.headerTextArea}>
            <Text style={styles.heading}>
              Reservation Details
            </Text>

            <Text style={styles.subtitle}>
              Review your book reservation
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>
              ✓
            </Text>
          </View>
        </View>

        {/* MODERN GLASS BOOK CARD */}

        <View style={styles.heroCard}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />

          <View style={styles.bookContent}>
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
                <Text style={styles.coverText}>
                  BOOK
                </Text>
              </View>
            )}

            <View style={styles.bookInfo}>
              <Text
                style={styles.bookTitle}
                numberOfLines={2}
              >
                {book?.title ||
                  reservation.item_name}
              </Text>

              <Text
                style={styles.author}
                numberOfLines={1}
              >
                {book?.author ||
                  'Unknown Author'}
              </Text>

              {book?.category ? (
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryText}>
                    {book.category}
                  </Text>
                </View>
              ) : null}

              <View
                style={[
                  styles.statusBadge,
                  isCompleted
                    ? styles.completedBadge
                    : styles.blueStatusBadge,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    isCompleted
                      ? styles.completedDot
                      : styles.blueDot,
                  ]}
                />

                <Text
                  style={[
                    styles.statusText,
                    isCompleted
                      ? styles.completedStatusText
                      : styles.blueStatusText,
                  ]}
                >
                  {displayStatus}
                </Text>
              </View>
            </View>
          </View>

          {/* DATE STRIP */}

          <View style={styles.dateStrip}>
            <View style={styles.dateBlock}>
              <Text style={styles.dateLabel}>
                PICKUP
              </Text>

              <Text style={styles.dateValue}>
                {formatDate(
                  reservation.start_time
                )}
              </Text>
            </View>

            <View style={styles.dateArrowCircle}>
              <Text style={styles.dateArrow}>
                →
              </Text>
            </View>

            <View
              style={[
                styles.dateBlock,
                styles.returnDateBlock,
              ]}
            >
              <Text style={styles.dateLabel}>
                RETURN
              </Text>

              <Text style={styles.dateValue}>
                {formatDate(
                  reservation.end_time
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* RESERVATION INFORMATION */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Reservation Information
          </Text>

          <View style={styles.sectionLine} />
        </View>

        <View style={styles.infoCard}>
          {/* MEMBER */}

          <View style={styles.infoSection}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>
                ♙
              </Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoSmallLabel}>
                MEMBER
              </Text>

              <Text style={styles.infoMainText}>
                {reservation.student_name}
              </Text>

              <Text style={styles.infoSubText}>
                {reservation.student_id}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* BOOK */}

          <View style={styles.infoSection}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>
                ▤
              </Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoSmallLabel}>
                BOOK
              </Text>

              <Text
                style={styles.infoMainText}
                numberOfLines={2}
              >
                {book?.title ||
                  reservation.item_name}
              </Text>

              <Text style={styles.infoSubText}>
                {book?.author ||
                  'Unknown Author'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* STATUS */}

          <View style={styles.infoSection}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>
                ✓
              </Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoSmallLabel}>
                STATUS
              </Text>

              <Text
                style={[
                  styles.infoMainText,
                  isCompleted &&
                    styles.completedDetailText,
                ]}
              >
                {displayStatus}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* RESERVATION ID */}

          <View style={styles.infoSection}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>
                #
              </Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoSmallLabel}>
                RESERVATION ID
              </Text>

              <Text
                style={styles.reservationId}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {reservation.id}
              </Text>
            </View>
          </View>
        </View>

        {/* ACTIONS */}

        {isCurrent ? (
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={openCancelReservation}
            >
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.editButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={openEditReservation}
            >
              <Text style={styles.editButtonText}>
                Edit Reservation
              </Text>

              <Text style={styles.editArrow}>
                ›
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={goBackToReservations}
          >
            <Text style={styles.backButtonText}>
              Back to My Reservations
            </Text>
          </Pressable>
        )}

        <Text style={styles.bottomHint}>
          Need to make a change? You can edit or
          cancel an active reservation.
        </Text>
      </ScrollView>

      {/* CUSTOM CANCEL MODAL */}

      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!cancelling) {
            setShowCancelModal(false);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Text style={styles.modalIconText}>
                ?
              </Text>
            </View>

            <Text style={styles.modalTitle}>
              Cancel Reservation
            </Text>

            <Text style={styles.modalMessage}>
              Are you sure you want to cancel{' '}
              <Text style={styles.modalBookName}>
                "{reservation.item_name}"
              </Text>
              ?
            </Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.modalNoButton}
                disabled={cancelling}
                onPress={() =>
                  setShowCancelModal(false)
                }
              >
                <Text style={styles.modalNoText}>
                  Keep
                </Text>
              </Pressable>

              <Pressable
                style={styles.modalYesButton}
                disabled={cancelling}
                onPress={confirmCancellation}
              >
                {cancelling ? (
                  <ActivityIndicator
                    size="small"
                    color="#ffffff"
                  />
                ) : (
                  <Text style={styles.modalYesText}>
                    Yes, Cancel
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },

  screen: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 45,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f7fb',
    paddingHorizontal: 25,
  },

  loadingText: {
    marginTop: 10,
    color: '#667085',
    fontSize: 13,
  },

  notFoundText: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 20,
    fontWeight: '600',
  },

  /* HEADER */

  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  topBackButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d5e2fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  topBackButtonPressed: {
    opacity: 0.65,
  },

  topBackArrow: {
    color: '#1464ff',
    fontSize: 30,
    lineHeight: 31,
    fontWeight: '400',
    marginTop: -2,
  },

  headerTextArea: {
    flex: 1,
  },

  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0645c4',
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 12,
    color: '#75839a',
    marginTop: 3,
  },

  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e7efff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  headerIconText: {
    color: '#1464ff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  /* HERO / GLASS CARD */

  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d5e2fa',
    padding: 14,
    marginBottom: 22,
    overflow: 'hidden',

    shadowColor: '#315b9c',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,

    elevation: 3,
  },

  heroGlowOne: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#e6efff',
    top: -70,
    right: -45,
    opacity: 0.8,
  },

  heroGlowTwo: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#edf4ff',
    bottom: -45,
    left: -35,
  },

  bookContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  cover: {
    width: 76,
    height: 108,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
  },

  coverPlaceholder: {
    width: 76,
    height: 108,
    borderRadius: 10,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
  },

  coverText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },

  bookInfo: {
    flex: 1,
    marginLeft: 14,
  },

  bookTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    color: '#102a56',
  },

  author: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },

  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef4ff',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginTop: 8,
  },

  categoryText: {
    color: '#2866d7',
    fontSize: 10,
    fontWeight: '600',
  },

  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginTop: 7,
  },

  blueStatusBadge: {
    backgroundColor: '#e7efff',
    borderColor: '#a9c5ff',
  },

  completedBadge: {
    backgroundColor: '#e5f8e9',
    borderColor: '#8dd99a',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  blueDot: {
    backgroundColor: '#1464ff',
  },

  completedDot: {
    backgroundColor: '#25a244',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },

  blueStatusText: {
    color: '#2866d7',
  },

  completedStatusText: {
    color: '#23923b',
  },

  /* DATE STRIP */

  dateStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    backgroundColor: '#f5f8fd',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  dateBlock: {
    flex: 1,
  },

  returnDateBlock: {
    alignItems: 'flex-end',
  },

  dateLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8793a6',
    letterSpacing: 0.8,
    marginBottom: 3,
  },

  dateValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#183153',
  },

  dateArrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e4edfc',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },

  dateArrow: {
    color: '#1464ff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  /* SECTION */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#13294b',
  },

  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#dce4ef',
    marginLeft: 12,
  },

  /* INFO CARD */

  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dfe6ef',
    paddingHorizontal: 15,
    paddingVertical: 4,

    shadowColor: '#233b60',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 10,

    elevation: 1,
  },

  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#eef4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  infoIconText: {
    color: '#1464ff',
    fontSize: 16,
    fontWeight: '700',
  },

  infoContent: {
    flex: 1,
  },

  infoSmallLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8a96a8',
    letterSpacing: 0.8,
    marginBottom: 2,
  },

  infoMainText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1c2d46',
  },

  infoSubText: {
    fontSize: 11,
    color: '#718096',
    marginTop: 2,
  },

  reservationId: {
    fontSize: 11,
    color: '#53647c',
  },

  divider: {
    height: 1,
    backgroundColor: '#edf1f6',
    marginLeft: 48,
  },

  completedDetailText: {
    color: '#23923b',
  },

  /* BUTTONS */

  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },

  cancelButton: {
    width: 105,
    borderWidth: 1.5,
    borderColor: '#1464ff',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    color: '#1464ff',
    fontSize: 14,
    fontWeight: '700',
  },

  editButton: {
    flex: 1,
    backgroundColor: '#1464ff',
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#1464ff',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.16,
    shadowRadius: 9,

    elevation: 3,
  },

  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },

  editArrow: {
    color: '#ffffff',
    fontSize: 21,
    lineHeight: 20,
    marginLeft: 8,
  },

  buttonPressed: {
    opacity: 0.78,
  },

  backButton: {
    backgroundColor: '#1464ff',
    borderRadius: 18,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 25,
  },

  backButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },

  bottomHint: {
    textAlign: 'center',
    fontSize: 10,
    color: '#94a0b2',
    marginTop: 13,
    paddingHorizontal: 25,
    lineHeight: 15,
  },

  /* CANCEL MODAL */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 28, 55, 0.48)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  modalCard: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 23,
    paddingBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c9dafa',
  },

  modalIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#e7efff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  modalIconText: {
    color: '#1464ff',
    fontSize: 23,
    fontWeight: 'bold',
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#123a80',
    marginBottom: 8,
  },

  modalMessage: {
    fontSize: 13,
    lineHeight: 20,
    color: '#667085',
    textAlign: 'center',
    marginBottom: 20,
  },

  modalBookName: {
    fontWeight: '700',
    color: '#1e293b',
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },

  modalNoButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#1464ff',
    borderRadius: 17,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },

  modalNoText: {
    color: '#1464ff',
    fontWeight: '700',
    fontSize: 13,
  },

  modalYesButton: {
    flex: 1,
    backgroundColor: '#1464ff',
    borderRadius: 17,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalYesText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
});