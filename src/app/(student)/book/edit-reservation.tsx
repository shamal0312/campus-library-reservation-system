import { useAuth } from '@/contexts/auth-context';

import {
    getBookReservationById,
    updateBookReservation,
} from '@/services/bookService';

import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Platform,
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
  start_time: string;
  end_time: string;
  status: string;
  item_name: string;
  books: BookInfo | null;
};

export default function EditReservationScreen() {
  const { reservationId } = useLocalSearchParams<{
    reservationId: string;
  }>();

  const { account } = useAuth();

  const [reservation, setReservation] =
    useState<Reservation | null>(null);

  const [pickupDate, setPickupDate] =
    useState<Date | null>(null);

  const [returnDate, setReturnDate] =
    useState<Date | null>(null);

  const [showPickupPicker, setShowPickupPicker] =
    useState(false);

  const [showReturnPicker, setShowReturnPicker] =
    useState(false);

  const [tempPickupDate, setTempPickupDate] =
    useState<Date>(new Date());

  const [tempReturnDate, setTempReturnDate] =
    useState<Date>(new Date());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showSuccessModal, setShowSuccessModal] =
    useState(false);

  useEffect(() => {
    loadReservation();
  }, [reservationId, account?.id]);

  async function loadReservation() {
    if (!reservationId || !account?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getBookReservationById(
        reservationId,
        account.id
      );

      const typedData = data as unknown as Reservation;

      setReservation(typedData);

      const loadedPickupDate = new Date(
        typedData.start_time
      );

      const loadedReturnDate = new Date(
        typedData.end_time
      );

      setPickupDate(loadedPickupDate);
      setReturnDate(loadedReturnDate);

      setTempPickupDate(loadedPickupDate);
      setTempReturnDate(loadedReturnDate);
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Error',
        'Could not load reservation.'
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: Date | null) {
    if (!date) return 'Select Date';

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  function getDay(date: Date | null) {
    if (!date) return '--';

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
    });
  }

  function getMonth(date: Date | null) {
    if (!date) return '---';

    return date
      .toLocaleDateString('en-GB', {
        month: 'short',
      })
      .toUpperCase();
  }

  function addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function getDaysBetween(start: Date, end: Date) {
    const startUTC = Date.UTC(
      start.getFullYear(),
      start.getMonth(),
      start.getDate()
    );

    const endUTC = Date.UTC(
      end.getFullYear(),
      end.getMonth(),
      end.getDate()
    );

    return Math.round(
      (endUTC - startUTC) /
        (1000 * 60 * 60 * 24)
    );
  }

  function goBack() {
    router.replace('/(student)/book/reservations');
  }

  function openPickupCalendar() {
    const startingDate = pickupDate ?? new Date();

    setTempPickupDate(startingDate);
    setShowPickupPicker(true);
  }

  function openReturnCalendar() {
    if (!pickupDate) return;

    const minimumDate = addDays(pickupDate, 1);
    const maximumDate = addDays(pickupDate, 30);

    let startingDate = returnDate ?? minimumDate;

    if (
      startingDate < minimumDate ||
      startingDate > maximumDate
    ) {
      startingDate = minimumDate;
    }

    setTempReturnDate(startingDate);
    setShowReturnPicker(true);
  }

  function handlePickupChange(
    event: any,
    selectedDate?: Date
  ) {
    if (!selectedDate) {
      if (Platform.OS !== 'ios') {
        setShowPickupPicker(false);
      }
      return;
    }

    if (Platform.OS === 'ios') {
      setTempPickupDate(selectedDate);
      return;
    }

    setPickupDate(selectedDate);
    setShowPickupPicker(false);

    if (returnDate) {
      const days = getDaysBetween(
        selectedDate,
        returnDate
      );

      if (days <= 0 || days > 30) {
        setReturnDate(null);
      }
    }
  }

  function confirmPickupDate() {
    setPickupDate(tempPickupDate);

    if (returnDate) {
      const days = getDaysBetween(
        tempPickupDate,
        returnDate
      );

      if (days <= 0 || days > 30) {
        setReturnDate(null);
      }
    }

    setShowPickupPicker(false);
  }

  function handleReturnChange(
    event: any,
    selectedDate?: Date
  ) {
    if (!selectedDate || !pickupDate) {
      if (Platform.OS !== 'ios') {
        setShowReturnPicker(false);
      }
      return;
    }

    if (Platform.OS === 'ios') {
      setTempReturnDate(selectedDate);
      return;
    }

    const days = getDaysBetween(
      pickupDate,
      selectedDate
    );

    if (days <= 0 || days > 30) {
      Alert.alert(
        'Invalid Return Date',
        'The return date must be after the pickup date and within 30 days.'
      );
      return;
    }

    setReturnDate(selectedDate);
    setShowReturnPicker(false);
  }

  function confirmReturnDate() {
    if (!pickupDate) return;

    const days = getDaysBetween(
      pickupDate,
      tempReturnDate
    );

    if (days <= 0 || days > 30) {
      Alert.alert(
        'Invalid Return Date',
        'The return date must be after the pickup date and within 30 days.'
      );
      return;
    }

    setReturnDate(tempReturnDate);
    setShowReturnPicker(false);
  }

  async function handleSaveChanges() {
    if (
      !reservation ||
      !pickupDate ||
      !returnDate
    ) {
      Alert.alert(
        'Dates Required',
        'Please select both pickup and return dates.'
      );
      return;
    }

    const days = getDaysBetween(
      pickupDate,
      returnDate
    );

    if (days <= 0) {
      Alert.alert(
        'Invalid Return Date',
        'The return date must be after the pickup date.'
      );
      return;
    }

    if (days > 30) {
      Alert.alert(
        'Invalid Return Date',
        'The return date cannot be more than 30 days after the pickup date.'
      );
      return;
    }

    try {
      setSaving(true);

      await updateBookReservation(
        reservation.id,
        pickupDate.toISOString(),
        returnDate.toISOString()
      );

      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Update Failed',
        'Could not update the reservation. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  }

  function closeSuccessModal() {
    setShowSuccessModal(false);

    router.replace(
      '/(student)/book/reservations'
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator
          size="small"
          color="#1464ff"
        />

        <Text style={styles.loadingText}>
          Loading reservation...
        </Text>
      </SafeAreaView>
    );
  }

  if (!reservation) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.notFoundText}>
          Reservation not found.
        </Text>
      </SafeAreaView>
    );
  }

  const book = reservation.books;

  const minimumReturnDate = pickupDate
    ? addDays(pickupDate, 1)
    : new Date();

  const maximumReturnDate = pickupDate
    ? addDays(pickupDate, 30)
    : new Date();

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* HEADER */}

        <View style={styles.headerRow}>
          <Pressable
            style={styles.backButton}
            onPress={goBack}
          >
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>

          <View style={styles.headerTextArea}>
            <Text style={styles.smallHeader}>
              BOOK RESERVATION
            </Text>

            <Text style={styles.heading}>
              Edit Reservation
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>
              ✎
            </Text>
          </View>
        </View>

        {/* BOOK CARD */}

        <View style={styles.bookGlassCard}>
          <View style={styles.coverWrapper}>
            {book?.cover_url ? (
              <Image
                source={{ uri: book.cover_url }}
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
          </View>

          <View style={styles.bookInfo}>
            <Text
              style={styles.bookTitle}
              numberOfLines={2}
            >
              {book?.title || reservation.item_name}
            </Text>

            <Text
              style={styles.author}
              numberOfLines={1}
            >
              {book?.author || 'Unknown Author'}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.categoryBadge}>
                <Text
                  style={styles.categoryText}
                  numberOfLines={1}
                >
                  {book?.category || 'Book'}
                </Text>
              </View>

              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />

                <Text style={styles.statusText}>
                  {reservation.status}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* DATE SECTION */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Reservation Dates
            </Text>

            <Text style={styles.sectionSubtitle}>
              Tap a card to change the date
            </Text>
          </View>

          <View style={styles.daysBadge}>
            <Text style={styles.daysBadgeText}>
              MAX 30 DAYS
            </Text>
          </View>
        </View>

        {/* DATE CARDS */}

        <View style={styles.dateRow}>
          <Pressable
            style={styles.dateGlassCard}
            onPress={openPickupCalendar}
          >
            <View style={styles.dateTopRow}>
              <View style={styles.miniCalendar}>
                <Text style={styles.miniCalendarMonth}>
                  {getMonth(pickupDate)}
                </Text>

                <Text style={styles.miniCalendarDay}>
                  {getDay(pickupDate)}
                </Text>
              </View>

              <View style={styles.editMiniIcon}>
                <Text style={styles.editMiniIconText}>
                  ✎
                </Text>
              </View>
            </View>

            <Text style={styles.dateLabel}>
              Pickup
            </Text>

            <Text
              style={styles.dateValue}
              numberOfLines={1}
            >
              {formatDate(pickupDate)}
            </Text>
          </Pressable>

          <View style={styles.dateArrow}>
            <Text style={styles.dateArrowText}>
              →
            </Text>
          </View>

          <Pressable
            style={[
              styles.dateGlassCard,
              !pickupDate &&
                styles.disabledDateButton,
            ]}
            disabled={!pickupDate}
            onPress={openReturnCalendar}
          >
            <View style={styles.dateTopRow}>
              <View style={styles.miniCalendar}>
                <Text style={styles.miniCalendarMonth}>
                  {getMonth(returnDate)}
                </Text>

                <Text style={styles.miniCalendarDay}>
                  {getDay(returnDate)}
                </Text>
              </View>

              <View style={styles.editMiniIcon}>
                <Text style={styles.editMiniIconText}>
                  ✎
                </Text>
              </View>
            </View>

            <Text style={styles.dateLabel}>
              Return
            </Text>

            <Text
              style={styles.dateValue}
              numberOfLines={1}
            >
              {formatDate(returnDate)}
            </Text>
          </Pressable>
        </View>

        {/* RETURN POLICY */}

        <View style={styles.ruleCard}>
          <View style={styles.ruleIcon}>
            <Text style={styles.ruleIconText}>
              i
            </Text>
          </View>

          <View style={styles.ruleContent}>
            <Text style={styles.ruleTitle}>
              Return policy
            </Text>

            <Text style={styles.ruleText}>
              Your return date must be after the
              pickup date and within 30 days.
            </Text>
          </View>
        </View>

        {/* SAVE BUTTON */}

        <Pressable
          style={[
            styles.saveButton,
            saving && styles.disabledButton,
          ]}
          disabled={saving}
          onPress={handleSaveChanges}
        >
          {saving ? (
            <ActivityIndicator
              size="small"
              color="#ffffff"
            />
          ) : (
            <>
              <Text style={styles.saveButtonText}>
                Save Changes
              </Text>

              <View style={styles.saveArrow}>
                <Text style={styles.saveArrowText}>
                  →
                </Text>
              </View>
            </>
          )}
        </Pressable>
      </ScrollView>

      {/* PICKUP CALENDAR */}

      <Modal
        visible={showPickupPicker}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowPickupPicker(false)
        }
      >
        <View style={styles.calendarOverlay}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <View>
                <Text style={styles.calendarSmallTitle}>
                  SELECT DATE
                </Text>

                <Text style={styles.calendarTitle}>
                  Pickup Date
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={() =>
                  setShowPickupPicker(false)
                }
              >
                <Text style={styles.closeButtonText}>
                  ×
                </Text>
              </Pressable>
            </View>

            <View style={styles.selectedDateBox}>
              <Text style={styles.selectedDateText}>
                {formatDate(tempPickupDate)}
              </Text>
            </View>

            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={tempPickupDate}
                mode="date"
                display={
                  Platform.OS === 'ios'
                    ? 'inline'
                    : 'default'
                }
                minimumDate={new Date()}
                onChange={handlePickupChange}
                accentColor="#2866e9"
                themeVariant="light"
                style={styles.datePicker}
              />
            </View>

            {Platform.OS === 'ios' && (
              <View style={styles.calendarButtons}>
                <Pressable
                  style={styles.calendarCancelButton}
                  onPress={() =>
                    setShowPickupPicker(false)
                  }
                >
                  <Text style={styles.calendarCancelText}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.calendarSelectButton}
                  onPress={confirmPickupDate}
                >
                  <Text style={styles.calendarSelectText}>
                    Select
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* RETURN CALENDAR */}

      <Modal
        visible={showReturnPicker}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowReturnPicker(false)
        }
      >
        <View style={styles.calendarOverlay}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <View>
                <Text style={styles.calendarSmallTitle}>
                  SELECT DATE
                </Text>

                <Text style={styles.calendarTitle}>
                  Return Date
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={() =>
                  setShowReturnPicker(false)
                }
              >
                <Text style={styles.closeButtonText}>
                  ×
                </Text>
              </Pressable>
            </View>

            <View style={styles.selectedDateBox}>
              <Text style={styles.selectedDateText}>
                {formatDate(tempReturnDate)}
              </Text>
            </View>

            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={tempReturnDate}
                mode="date"
                display={
                  Platform.OS === 'ios'
                    ? 'inline'
                    : 'default'
                }
                minimumDate={minimumReturnDate}
                maximumDate={maximumReturnDate}
                onChange={handleReturnChange}
                accentColor="#2866e9"
                themeVariant="light"
                style={styles.datePicker}
              />
            </View>

            <Text style={styles.calendarRule}>
              Up to 30 days after pickup.
            </Text>

            {Platform.OS === 'ios' && (
              <View style={styles.calendarButtons}>
                <Pressable
                  style={styles.calendarCancelButton}
                  onPress={() =>
                    setShowReturnPicker(false)
                  }
                >
                  <Text style={styles.calendarCancelText}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.calendarSelectButton}
                  onPress={confirmReturnDate}
                >
                  <Text style={styles.calendarSelectText}>
                    Select
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* SUCCESS */}

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={closeSuccessModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>
                ✓
              </Text>
            </View>

            <Text style={styles.modalTitle}>
              Reservation Updated
            </Text>

            <Text style={styles.modalMessage}>
              Your reservation dates have been
              updated successfully.
            </Text>

            <Pressable
              style={styles.okButton}
              onPress={closeSuccessModal}
            >
              <Text style={styles.okButtonText}>
                Done
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 150,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    gap: 8,
  },

  loadingText: {
    color: '#64748b',
    fontSize: 13,
  },

  notFoundText: {
    color: '#475569',
    fontSize: 14,
  },

  /* HEADER */

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    minHeight: 58,
  },

  backButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#f2f6fc',
    borderWidth: 1,
    borderColor: '#dce7f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  backArrow: {
    color: '#1464ff',
    fontSize: 30,
    lineHeight: 31,
    fontWeight: '400',
    marginTop: -2,
  },

  headerTextArea: {
    flex: 1,
  },

  smallHeader: {
    fontSize: 8,
    fontWeight: '800',
    color: '#7a9fe8',
    letterSpacing: 1.3,
    marginBottom: 2,
  },

  heading: {
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '800',
    color: '#0645c4',
  },

  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eef5ff',
    borderWidth: 1,
    borderColor: '#d6e5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  headerIconText: {
    fontSize: 16,
    color: '#1464ff',
    fontWeight: '700',
  },

  /* BOOK CARD */

  bookGlassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#dce7f8',
    padding: 11,
    marginBottom: 23,

    shadowColor: '#315b9f',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
  },

  coverWrapper: {
    backgroundColor: '#eef4fd',
    borderRadius: 11,
    padding: 4,
  },

  cover: {
    width: 64,
    height: 87,
    borderRadius: 8,
  },

  coverPlaceholder: {
    width: 64,
    height: 87,
    borderRadius: 8,
    backgroundColor: '#1d2430',
    justifyContent: 'center',
    alignItems: 'center',
  },

  coverText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  bookInfo: {
    flex: 1,
    marginLeft: 12,
  },

  bookTitle: {
    color: '#0f172a',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },

  author: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },

  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 9,
  },

  categoryBadge: {
    maxWidth: 120,
    backgroundColor: '#f5f8fd',
    borderWidth: 1,
    borderColor: '#e0e8f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  categoryText: {
    color: '#52647e',
    fontSize: 9.5,
    fontWeight: '600',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#edf4ff',
    borderWidth: 1,
    borderColor: '#c7dcff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#1464ff',
    marginRight: 5,
  },

  statusText: {
    color: '#1464ff',
    fontSize: 9.5,
    fontWeight: '700',
  },

  /* SECTION */

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '800',
  },

  sectionSubtitle: {
    color: '#94a3b8',
    fontSize: 10.5,
    marginTop: 3,
  },

  daysBadge: {
    backgroundColor: '#f3f7fd',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
  },

  daysBadgeText: {
    color: '#6b85ae',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  /* DATE CARDS */

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  dateGlassCard: {
    flex: 1,
    minHeight: 132,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dce7f8',
    borderRadius: 16,
    padding: 11,

    shadowColor: '#315b9f',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 9,
    elevation: 2,
  },

  disabledDateButton: {
    opacity: 0.45,
  },

  dateTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  miniCalendar: {
    width: 42,
    height: 42,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#eef5ff',
    alignItems: 'center',
  },

  miniCalendarMonth: {
    width: '100%',
    textAlign: 'center',
    backgroundColor: '#1464ff',
    color: '#ffffff',
    fontSize: 7,
    fontWeight: '800',
    paddingVertical: 2,
  },

  miniCalendarDay: {
    color: '#0754d8',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '800',
  },

  editMiniIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f4f7fb',
    alignItems: 'center',
    justifyContent: 'center',
  },

  editMiniIconText: {
    color: '#1464ff',
    fontSize: 10,
    fontWeight: '700',
  },

  dateLabel: {
    color: '#94a3b8',
    fontSize: 9.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  dateValue: {
    color: '#172033',
    fontSize: 11.5,
    fontWeight: '800',
    marginTop: 3,
  },

  dateArrow: {
    width: 24,
    alignItems: 'center',
  },

  dateArrowText: {
    color: '#8eaddd',
    fontSize: 18,
    fontWeight: '600',
  },

  /* RULE */

  ruleCard: {
    flexDirection: 'row',
    backgroundColor: '#f8fbff',
    borderWidth: 1,
    borderColor: '#e0eafa',
    borderRadius: 14,
    padding: 11,
    alignItems: 'center',
  },

  ruleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e6f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  ruleIconText: {
    color: '#1464ff',
    fontSize: 13,
    fontWeight: '800',
  },

  ruleContent: {
    flex: 1,
  },

  ruleTitle: {
    color: '#254b84',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 2,
  },

  ruleText: {
    color: '#718096',
    fontSize: 10,
    lineHeight: 14,
  },

  /* SAVE */

  saveButton: {
    minHeight: 49,
    backgroundColor: '#1464ff',
    borderRadius: 25,
    marginTop: 21,
    paddingLeft: 21,
    paddingRight: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    shadowColor: '#1464ff',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 9,
    elevation: 4,
  },

  disabledButton: {
    opacity: 0.55,
  },

  saveButtonText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '800',
    marginLeft: 5,
  },

  saveArrow: {
    width: 37,
    height: 37,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveArrowText: {
    color: '#ffffff',
    fontSize: 19,
  },

  /* CALENDAR */

  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 28, 55, 0.38)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 34,
  },

  calendarCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d5e4ff',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },

  calendarHeader: {
    backgroundColor: '#2866e9',
    paddingHorizontal: 17,
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  calendarSmallTitle: {
    color: '#dce9ff',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  calendarTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },

  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.17)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButtonText: {
    color: '#ffffff',
    fontSize: 22,
    lineHeight: 24,
  },

  selectedDateBox: {
    marginHorizontal: 15,
    marginTop: 13,
    backgroundColor: '#f1f6ff',
    borderWidth: 1,
    borderColor: '#d6e5ff',
    borderRadius: 11,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  selectedDateText: {
    color: '#0754d8',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },

  pickerContainer: {
    marginHorizontal: 4,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  datePicker: {
    alignSelf: 'center',
  },

  calendarRule: {
    color: '#718096',
    fontSize: 9.5,
    textAlign: 'center',
    marginHorizontal: 16,
    marginBottom: 3,
  },

  calendarButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 15,
    paddingTop: 7,
    paddingBottom: 14,
  },

  calendarCancelButton: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1.2,
    borderColor: '#2866e9',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },

  calendarCancelText: {
    color: '#2866e9',
    fontSize: 12,
    fontWeight: '800',
  },

  calendarSelectButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2866e9',
  },

  calendarSelectText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },

  /* SUCCESS MODAL */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 28, 55, 0.38)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 35,
  },

  modalCard: {
    width: '100%',
    maxWidth: 330,
    backgroundColor: '#ffffff',
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#d6e5ff',
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 18,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.13,
    shadowRadius: 15,
    elevation: 7,
  },

  successIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5efff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  successIconText: {
    color: '#1464ff',
    fontSize: 25,
    fontWeight: '800',
  },

  modalTitle: {
    color: '#0645c4',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },

  modalMessage: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 7,
    marginBottom: 18,
  },

  okButton: {
    width: '100%',
    backgroundColor: '#1464ff',
    borderRadius: 20,
    minHeight: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },

  okButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});