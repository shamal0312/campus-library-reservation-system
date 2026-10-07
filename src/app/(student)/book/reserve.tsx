import { useAuth } from '@/contexts/auth-context';
import {
    Book,
    createBookReservation,
    getBookById,
} from '@/services/bookService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type MessageType = 'info' | 'success';

export default function ReserveBookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { account } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);

  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);

  const [showPickupPicker, setShowPickupPicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);

  const [tempPickupDate, setTempPickupDate] = useState<Date>(
    new Date()
  );

  const [tempReturnDate, setTempReturnDate] = useState<Date>(
    new Date()
  );

  const [agreed, setAgreed] = useState(false);

  // CUSTOM MESSAGE MODAL
  const [showMessage, setShowMessage] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] =
    useState<MessageType>('info');
  const [messageAction, setMessageAction] = useState<
    (() => void) | null
  >(null);

  useEffect(() => {
    async function loadBook() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getBookById(id);
        setBook(data);
      } catch (error) {
        console.error(error);

        openMessage(
          'Unable to Load Book',
          'Could not load this book. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadBook();
  }, [id]);

  function openMessage(
    title: string,
    text: string,
    type: MessageType = 'info',
    action?: () => void
  ) {
    setMessageTitle(title);
    setMessageText(text);
    setMessageType(type);
    setMessageAction(() => action ?? null);
    setShowMessage(true);
  }

  function closeMessage() {
    setShowMessage(false);

    if (messageAction) {
      const action = messageAction;
      setMessageAction(null);

      setTimeout(() => {
        action();
      }, 150);
    }
  }

  function formatDate(date: Date | null) {
    if (!date) {
      return 'Select Date';
    }

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  function getMinimumReturnDate() {
    if (!pickupDate) {
      return new Date();
    }

    const minDate = new Date(pickupDate);
    minDate.setDate(minDate.getDate() + 1);

    return minDate;
  }

  function getMaximumReturnDate() {
    if (!pickupDate) {
      return new Date();
    }

    const maxDate = new Date(pickupDate);
    maxDate.setDate(maxDate.getDate() + 30);

    return maxDate;
  }

  function daysBetween(start: Date, end: Date) {
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
      (endUTC - startUTC) / (1000 * 60 * 60 * 24)
    );
  }

  function openPickupCalendar() {
    const startingDate = pickupDate ?? new Date();

    setTempPickupDate(startingDate);
    setShowPickupPicker(true);
  }

  function openReturnCalendar() {
    if (!pickupDate) {
      openMessage(
        'Pickup Date Required',
        'Please select a pickup date before choosing the return date.'
      );
      return;
    }

    const minimumDate = getMinimumReturnDate();

    let startingDate = returnDate ?? minimumDate;

    if (
      startingDate < minimumDate ||
      startingDate > getMaximumReturnDate()
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

    setShowPickupPicker(false);
    setPickupDate(selectedDate);

    if (returnDate) {
      const difference = daysBetween(
        selectedDate,
        returnDate
      );

      if (difference <= 0 || difference > 30) {
        setReturnDate(null);
      }
    }
  }

  function confirmPickupDate() {
    setPickupDate(tempPickupDate);

    if (returnDate) {
      const difference = daysBetween(
        tempPickupDate,
        returnDate
      );

      if (difference <= 0 || difference > 30) {
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

    const difference = daysBetween(
      pickupDate,
      selectedDate
    );

    if (difference <= 0 || difference > 30) {
      setShowReturnPicker(false);

      openMessage(
        'Invalid Return Date',
        'Please select a return date after the pickup date and within 30 days.'
      );

      return;
    }

    setShowReturnPicker(false);
    setReturnDate(selectedDate);
  }

  function confirmReturnDate() {
    if (!pickupDate) {
      return;
    }

    const difference = daysBetween(
      pickupDate,
      tempReturnDate
    );

    if (difference <= 0 || difference > 30) {
      setShowReturnPicker(false);

      setTimeout(() => {
        openMessage(
          'Invalid Return Date',
          'Please select a return date after the pickup date and within 30 days.'
        );
      }, 200);

      return;
    }

    setReturnDate(tempReturnDate);
    setShowReturnPicker(false);
  }

  async function handleReservation() {
    if (!book || !account) {
      openMessage(
        'Unable to Reserve',
        'Unable to create this reservation. Please try again.'
      );
      return;
    }

    if (!pickupDate) {
      openMessage(
        'Pickup Date Required',
        'Please select a pickup date.'
      );
      return;
    }

    if (!returnDate) {
      openMessage(
        'Return Date Required',
        'Please select an expected return date.'
      );
      return;
    }

    const difference = daysBetween(
      pickupDate,
      returnDate
    );

    if (difference <= 0 || difference > 30) {
      openMessage(
        'Invalid Return Date',
        'The return date must be after the pickup date and within 30 days.'
      );
      return;
    }

    if (!agreed) {
      openMessage(
        'Agreement Required',
        'Please agree to the library reservation and return policies.'
      );
      return;
    }

    try {
      setReserving(true);

      await createBookReservation({
        userId: account.id,
        studentId: account.universityId,
        studentName: account.fullName,
        book,
        pickupDate: pickupDate.toISOString(),
        returnDate: returnDate.toISOString(),
      });

      openMessage(
        'Reservation Confirmed!',
        `${book.title} has been successfully reserved.`,
        'success',
        () => router.back()
      );
    } catch (error) {
      console.error(error);

      openMessage(
        'Reservation Failed',
        'Could not reserve this book. Please try again.'
      );
    } finally {
      setReserving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#2563eb"
        />

        <Text style={styles.loadingText}>
          Loading book...
        </Text>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundTitle}>
          Book not found
        </Text>

        <Pressable
          style={styles.simpleBackButton}
          onPress={() => router.back()}
        >
          <Text style={styles.simpleBackButtonText}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const available = book.available_copies > 0;

  return (
    <>
      <ScrollView
        style={styles.screen}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* IMAGE-FOCUSED HERO */}

        <View style={styles.hero}>
          {book.cover_url ? (
            <Image
              source={{ uri: book.cover_url }}
              style={styles.heroBackground}
              resizeMode="cover"
              blurRadius={18}
            />
          ) : (
            <View style={styles.heroFallback} />
          )}

          <View style={styles.heroDarkOverlay} />

          <View style={styles.heroHeader}>
            <Pressable
              style={styles.heroBackButton}
              onPress={() => router.back()}
            >
              <Text style={styles.heroBackArrow}>
                ‹
              </Text>
            </Pressable>

            <Text style={styles.heroHeaderTitle}>
              Reserve Book
            </Text>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.heroContent}>
            <View style={styles.heroTextArea}>
              <Text
                style={styles.heroBookTitle}
                numberOfLines={3}
              >
                {book.title}
              </Text>

              <Text style={styles.heroAuthor}>
                {book.author}
              </Text>

              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {book.category ?? 'Book'}
                </Text>
              </View>

              <View style={styles.locationRow}>
                <Text style={styles.locationSymbol}>
                  ⌖
                </Text>

                <Text style={styles.locationText}>
                  Floor 2 · Shelf F-12
                </Text>
              </View>

              <View
                style={[
                  styles.availabilityBadge,
                  !available &&
                    styles.unavailableBadge,
                ]}
              >
                <View
                  style={[
                    styles.availabilityDot,
                    !available &&
                      styles.unavailableDot,
                  ]}
                />

                <Text
                  style={[
                    styles.availabilityText,
                    !available &&
                      styles.unavailableText,
                  ]}
                >
                  {available
                    ? 'Available'
                    : 'Unavailable'}
                </Text>
              </View>
            </View>

            {book.cover_url ? (
              <Image
                source={{ uri: book.cover_url }}
                style={styles.heroCover}
                resizeMode="cover"
              />
            ) : (
              <View
                style={styles.heroCoverPlaceholder}
              >
                <Text
                  style={
                    styles.heroCoverPlaceholderText
                  }
                >
                  BOOK
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* FORM */}

        <View style={styles.formSheet}>
          <View style={styles.sheetHandle} />

          <Text style={styles.sectionTitle}>
            Reservation Details
          </Text>

          <Text style={styles.sectionSubtitle}>
            Please confirm your information and select dates
          </Text>

          {/* FULL NAME */}

          <View style={styles.infoField}>
            <View style={styles.fieldIconCircle}>
              <Text style={styles.fieldIcon}>♙</Text>
            </View>

            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>
                Full Name
              </Text>

              <Text style={styles.fieldValue}>
                {account?.fullName || 'N/A'}
              </Text>
            </View>
          </View>

          {/* STUDENT ID */}

          <View style={styles.infoField}>
            <View style={styles.fieldIconCircle}>
              <Text style={styles.fieldIcon}>▣</Text>
            </View>

            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>
                Student ID
              </Text>

              <Text style={styles.fieldValue}>
                {account?.universityId || 'N/A'}
              </Text>
            </View>
          </View>

          {/* CONTACT NUMBER */}

          <View style={styles.infoField}>
            <View style={styles.fieldIconCircle}>
              <Text style={styles.fieldIcon}>☎</Text>
            </View>

            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>
                Contact Number
              </Text>

              <Text style={styles.fieldValue}>
                {account?.phone || 'N/A'}
              </Text>
            </View>
          </View>

          {/* DATES */}

          <View style={styles.dateRow}>
            <View style={styles.dateColumn}>
              <Text style={styles.dateLabel}>
                Pickup Date
              </Text>

              <Pressable
                style={styles.dateButton}
                onPress={openPickupCalendar}
              >
                <View style={styles.calendarCircle}>
                  <Text style={styles.calendarIcon}>
                    ▣
                  </Text>
                </View>

                <Text
                  style={[
                    styles.dateText,
                    !pickupDate &&
                      styles.placeholderText,
                  ]}
                  numberOfLines={1}
                >
                  {formatDate(pickupDate)}
                </Text>

                <Text style={styles.dateArrow}>
                  ›
                </Text>
              </Pressable>
            </View>

            <View style={styles.dateColumn}>
              <Text style={styles.dateLabel}>
                Expected Return Date
              </Text>

              <Pressable
                style={[
                  styles.dateButton,
                  !pickupDate &&
                    styles.disabledDate,
                ]}
                disabled={!pickupDate}
                onPress={openReturnCalendar}
              >
                <View style={styles.calendarCircle}>
                  <Text style={styles.calendarIcon}>
                    ▣
                  </Text>
                </View>

                <Text
                  style={[
                    styles.dateText,
                    !returnDate &&
                      styles.placeholderText,
                  ]}
                  numberOfLines={1}
                >
                  {formatDate(returnDate)}
                </Text>

                <Text style={styles.dateArrow}>
                  ›
                </Text>
              </Pressable>
            </View>
          </View>

          {/* RULE */}

          <View style={styles.ruleRow}>
            <Text style={styles.ruleIcon}>ⓘ</Text>

            <Text style={styles.ruleText}>
              Return date must be within 30 days of the
              selected pickup date.
            </Text>
          </View>

          {/* AGREEMENT */}

          <Pressable
            style={styles.agreementRow}
            onPress={() => setAgreed(!agreed)}
          >
            <View
              style={[
                styles.checkbox,
                agreed && styles.checkboxSelected,
              ]}
            >
              {agreed ? (
                <Text style={styles.checkmark}>
                  ✓
                </Text>
              ) : null}
            </View>

            <View style={styles.agreementContent}>
              <Text style={styles.agreementTitle}>
                I agree to the library reservation and
                return policies.
              </Text>

              <Text
                style={styles.agreementDescription}
              >
                By checking this, you agree to follow all
                library rules and return the book on time.
              </Text>
            </View>
          </Pressable>

          {/* CONFIRM BUTTON */}

          <Pressable
            style={[
              styles.confirmButton,
              (!available || reserving) &&
                styles.disabledButton,
            ]}
            onPress={handleReservation}
            disabled={!available || reserving}
          >
            {reserving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text style={styles.confirmButtonText}>
                  {available
                    ? 'Confirm Reservation'
                    : 'Book Unavailable'}
                </Text>

                {available ? (
                  <View
                    style={styles.confirmArrowCircle}
                  >
                    <Text
                      style={styles.confirmArrow}
                    >
                      →
                    </Text>
                  </View>
                ) : null}
              </>
            )}
          </Pressable>

          <View style={styles.bottomSpace} />
        </View>
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
        <View style={styles.modalOverlay}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <View>
                <Text
                  style={styles.calendarSmallTitle}
                >
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

            <View style={styles.pickerOuter}>
              <View
                style={
                  Platform.OS === 'ios'
                    ? styles.iosPickerScale
                    : styles.androidPicker
                }
              >
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
                />
              </View>
            </View>

            {Platform.OS === 'ios' && (
              <View style={styles.modalButtons}>
                <Pressable
                  style={styles.cancelDateButton}
                  onPress={() =>
                    setShowPickupPicker(false)
                  }
                >
                  <Text
                    style={
                      styles.cancelDateButtonText
                    }
                  >
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.selectDateButton}
                  onPress={confirmPickupDate}
                >
                  <Text
                    style={
                      styles.selectDateButtonText
                    }
                  >
                    Select Date
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
        <View style={styles.modalOverlay}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <View>
                <Text
                  style={styles.calendarSmallTitle}
                >
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

            <View style={styles.pickerOuter}>
              <View
                style={
                  Platform.OS === 'ios'
                    ? styles.iosPickerScale
                    : styles.androidPicker
                }
              >
                <DateTimePicker
                  value={tempReturnDate}
                  mode="date"
                  display={
                    Platform.OS === 'ios'
                      ? 'inline'
                      : 'default'
                  }
                  minimumDate={getMinimumReturnDate()}
                  maximumDate={getMaximumReturnDate()}
                  onChange={handleReturnChange}
                  accentColor="#2866e9"
                  themeVariant="light"
                />
              </View>
            </View>

            <Text style={styles.calendarRule}>
              Return date can be up to 30 days after the
              pickup date.
            </Text>

            {Platform.OS === 'ios' && (
              <View style={styles.modalButtons}>
                <Pressable
                  style={styles.cancelDateButton}
                  onPress={() =>
                    setShowReturnPicker(false)
                  }
                >
                  <Text
                    style={
                      styles.cancelDateButtonText
                    }
                  >
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.selectDateButton}
                  onPress={confirmReturnDate}
                >
                  <Text
                    style={
                      styles.selectDateButtonText
                    }
                  >
                    Select Date
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* CUSTOM BLUE MESSAGE */}

      <Modal
        visible={showMessage}
        transparent
        animationType="fade"
        onRequestClose={closeMessage}
      >
        <View style={styles.messageOverlay}>
          <View style={styles.messageCard}>
            <View
              style={[
                styles.messageIconCircle,
                messageType === 'success' &&
                  styles.successIconCircle,
              ]}
            >
              <Text
                style={[
                  styles.messageIcon,
                  messageType === 'success' &&
                    styles.successIcon,
                ]}
              >
                {messageType === 'success'
                  ? '✓'
                  : '!'}
              </Text>
            </View>

            <Text style={styles.messageTitle}>
              {messageTitle}
            </Text>

            <Text style={styles.messageDescription}>
              {messageText}
            </Text>

            <Pressable
              style={styles.messageButton}
              onPress={closeMessage}
            >
              <Text style={styles.messageButtonText}>
                OK
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef3fb',
  },

  scrollContent: {
    paddingBottom: 0,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eef3fb',
    gap: 10,
    paddingHorizontal: 30,
  },

  loadingText: {
    color: '#506582',
    fontSize: 14,
  },

  notFoundTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0648bd',
  },

  simpleBackButton: {
    backgroundColor: '#1769ff',
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 22,
  },

  simpleBackButtonText: {
    color: '#ffffff',
    fontWeight: '800',
  },

  /* HERO */

  hero: {
    height: 370,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#172235',
  },

  heroBackground: {
    position: 'absolute',
    top: -30,
    left: -30,
    right: -30,
    bottom: -30,
  },

  heroFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#172235',
  },

  heroDarkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8, 23, 43, 0.58)',
  },

  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 58 : 28,
    zIndex: 3,
  },

  heroBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.42)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroBackArrow: {
    color: '#ffffff',
    fontSize: 36,
    lineHeight: 37,
    marginTop: -3,
  },

  heroHeaderTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },

  headerSpacer: {
    width: 40,
  },

  heroContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 18,
  },

  heroTextArea: {
    flex: 1,
    paddingRight: 10,
  },

  heroBookTitle: {
    color: '#ffffff',
    fontSize: 25,
    lineHeight: 29,
    fontWeight: '900',
    marginBottom: 5,
  },

  heroAuthor: {
    color: '#eef4ff',
    fontSize: 15,
    marginBottom: 11,
  },

  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(72,134,229,0.58)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 11,
  },

  categoryText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },

  locationSymbol: {
    color: '#ffffff',
    fontSize: 19,
    marginRight: 6,
  },

  locationText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },

  availabilityBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d8ffe2',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  unavailableBadge: {
    backgroundColor: '#e7edf7',
  },

  availabilityDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#08ad47',
    marginRight: 7,
  },

  unavailableDot: {
    backgroundColor: '#75849b',
  },

  availabilityText: {
    color: '#07933d',
    fontSize: 12,
    fontWeight: '800',
  },

  unavailableText: {
    color: '#59697f',
  },

  heroCover: {
    width: 116,
    height: 176,
    borderRadius: 8,
    backgroundColor: '#eeeeee',
    transform: [{ rotate: '3deg' }],
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.35,
    shadowRadius: 9,
    elevation: 9,
  },

  heroCoverPlaceholder: {
    width: 116,
    height: 176,
    borderRadius: 8,
    backgroundColor: '#15243a',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '3deg' }],
  },

  heroCoverPlaceholderText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },

  /* FORM */

  formSheet: {
    marginTop: -20,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    paddingHorizontal: 20,
    paddingTop: 11,
    paddingBottom: 25,
    minHeight: 650,
  },

  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 3,
    backgroundColor: '#cbd6e7',
    alignSelf: 'center',
    marginBottom: 13,
  },

  sectionTitle: {
    color: '#0648bd',
    fontSize: 23,
    fontWeight: '900',
  },

  sectionSubtitle: {
    color: '#61779a',
    fontSize: 12,
    marginTop: 3,
    marginBottom: 16,
  },

  /* INFORMATION */

  infoField: {
    minHeight: 60,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c7dcff',
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    marginBottom: 9,
  },

  fieldIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#edf5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  fieldIcon: {
    color: '#1769ff',
    fontSize: 18,
  },

  fieldContent: {
    flex: 1,
  },

  fieldLabel: {
    color: '#63799c',
    fontSize: 10,
    marginBottom: 1,
  },

  fieldValue: {
    color: '#151515',
    fontSize: 15,
    fontWeight: '600',
  },

  /* DATES */

  dateRow: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 7,
  },

  dateColumn: {
    flex: 1,
  },

  dateLabel: {
    color: '#0754d8',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 5,
    marginLeft: 2,
  },

  dateButton: {
    minHeight: 58,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c7dcff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
  },

  disabledDate: {
    backgroundColor: '#f4f6fa',
    opacity: 0.65,
  },

  calendarCircle: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#edf5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },

  calendarIcon: {
    color: '#1769ff',
    fontSize: 15,
  },

  dateText: {
    flex: 1,
    color: '#1f2937',
    fontSize: 10,
    fontWeight: '600',
  },

  placeholderText: {
    color: '#7b879b',
    fontWeight: '500',
  },

  dateArrow: {
    color: '#315b9a',
    fontSize: 20,
    marginLeft: 1,
  },

  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },

  ruleIcon: {
    color: '#1769ff',
    fontSize: 16,
    marginRight: 7,
  },

  ruleText: {
    flex: 1,
    color: '#5f7596',
    fontSize: 10,
    lineHeight: 15,
  },

  /* AGREEMENT */

  agreementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#1769ff',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 1,
  },

  checkboxSelected: {
    backgroundColor: '#1769ff',
  },

  checkmark: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },

  agreementContent: {
    flex: 1,
  },

  agreementTitle: {
    color: '#0648bd',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
  },

  agreementDescription: {
    color: '#7184a1',
    fontSize: 9,
    lineHeight: 13,
    marginTop: 3,
  },

  /* CONFIRM */

  confirmButton: {
    minHeight: 54,
    borderRadius: 27,
    backgroundColor: '#1769ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 23,
    paddingHorizontal: 8,

    shadowColor: '#1769ff',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 5,
  },

  disabledButton: {
    opacity: 0.55,
  },

  confirmButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  confirmArrowCircle: {
    position: 'absolute',
    right: 7,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  confirmArrow: {
    color: '#ffffff',
    fontSize: 23,
    fontWeight: '600',
  },

  bottomSpace: {
    height: 70,
  },

  /* ==========================
     COMPACT BLUE CALENDAR
     ========================== */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(6,25,60,0.42)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 35,
  },

  calendarCard: {
    width: '100%',
    maxWidth: 335,
    backgroundColor: '#ffffff',
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#9bbcff',
    overflow: 'hidden',

    shadowColor: '#0a3d91',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.18,
    shadowRadius: 14,
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
    fontWeight: '700',
    letterSpacing: 1.3,
  },

  calendarTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 1,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButtonText: {
    color: '#ffffff',
    fontSize: 23,
    lineHeight: 25,
  },

  selectedDateBox: {
    marginHorizontal: 15,
    marginTop: 13,
    backgroundColor: '#e8f1ff',
    borderWidth: 1,
    borderColor: '#b7d0ff',
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

  /*
   * This container keeps the iOS inline calendar
   * from taking over the entire screen.
   */
  pickerOuter: {
    height: Platform.OS === 'ios' ? 270 : 70,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  iosPickerScale: {
    width: 360,
    height: 330,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scale: 0.78 }],
  },

  androidPicker: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  calendarRule: {
    color: '#506582',
    fontSize: 9,
    textAlign: 'center',
    marginHorizontal: 18,
    marginBottom: 2,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 9,
    paddingHorizontal: 15,
    paddingTop: 7,
    paddingBottom: 14,
  },

  cancelDateButton: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1.5,
    borderColor: '#2866e9',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },

  cancelDateButtonText: {
    color: '#2866e9',
    fontSize: 12,
    fontWeight: '800',
  },

  selectDateButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2866e9',
  },

  selectDateButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },

  /* ==========================
     CUSTOM BLUE MESSAGE POPUP
     ========================== */

  messageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(6,25,60,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 38,
  },

  messageCard: {
    width: '100%',
    maxWidth: 330,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#b7d0ff',
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 19,
    alignItems: 'center',

    shadowColor: '#0b4bb3',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 15,
    elevation: 8,
  },

  messageIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5efff',
    borderWidth: 1,
    borderColor: '#b8d1ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 13,
  },

  messageIcon: {
    color: '#1769ff',
    fontSize: 25,
    fontWeight: '900',
  },

  successIconCircle: {
    backgroundColor: '#e4f8e9',
    borderColor: '#8cdda0',
  },

  successIcon: {
    color: '#23923b',
  },

  messageTitle: {
    color: '#0648bd',
    fontSize: 19,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 7,
  },

  messageDescription: {
    color: '#61738e',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 19,
  },

  messageButton: {
    width: '100%',
    minHeight: 43,
    borderRadius: 22,
    backgroundColor: '#1769ff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  messageButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});