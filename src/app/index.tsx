import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/auth-context';

import GetStartedScreen from './(auth)/get-started';

const BLUE = '#3B5CCC';

const ACTIONS: {
  label: string;
  ios: 'book' | 'chair' | 'door.left.hand.open' | 'bell';
  android: 'menu_book' | 'chair' | 'meeting_room' | 'notifications';
  badge?: boolean;
}[] = [
  { label: 'Book Reservation', ios: 'book', android: 'menu_book' },
  { label: 'Seat Reservation', ios: 'chair', android: 'chair' },
  { label: 'Room reservation', ios: 'door.left.hand.open', android: 'meeting_room', badge: true },
  { label: 'Notification', ios: 'bell', android: 'notifications', badge: true },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { session, account, isLoading } = useAuth();
  const isSignedIn = !isLoading && !!session && !!account?.role;

  if (!isSignedIn) {
    return <GetStartedScreen />;
  }

  const firstName = account.fullName.trim().split(' ')[0] || 'Nimal';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text style={styles.hello}>Hello, {firstName} !</Text>
          <Text style={styles.subtitle}>Let's make today productive at the Smart library</Text>
        </View>
        <Pressable style={styles.avatar} onPress={() => router.push('/profile')} hitSlop={8}>
          <SymbolView name={{ ios: 'person.fill', android: 'person', web: 'person' }} size={26} tintColor={BLUE} />
        </Pressable>
      </View>

      <Text style={styles.sectionLabel}>Upcoming Reservation</Text>
      <View style={styles.reservationCard}>
        <Image
          source={require('@/assets/images/library-aisle.jpg')}
          style={styles.reservationPhoto}
          contentFit="cover"
        />
        <View style={styles.reservationBody}>
          <Text style={styles.roomName}>Room 3</Text>
          <Text style={styles.floor}>Floor 2</Text>
          <View style={styles.metaRow}>
            <SymbolView
              name={{ ios: 'calendar', android: 'calendar_today', web: 'calendar_today' }}
              size={15}
              tintColor={BLUE}
            />
            <Text style={styles.metaText}>Date - 18 Nov 2025</Text>
          </View>
          <View style={styles.metaRow}>
            <SymbolView name={{ ios: 'clock', android: 'schedule', web: 'schedule' }} size={15} tintColor={BLUE} />
            <Text style={styles.metaText}>Time - 9.00 AM - 11.00 AM</Text>
          </View>
        </View>
      </View>

      <View style={styles.grid}>
        {[ACTIONS.slice(0, 2), ACTIONS.slice(2)].map((row) => (
          <View key={row[0].label} style={styles.actionRow}>
            {row.map((action) => (
              <View key={action.label} style={styles.actionCard}>
                {action.badge ? <View style={styles.badge} /> : null}
                <View style={styles.actionIcon}>
                  <SymbolView
                    name={{ ios: action.ios, android: action.android, web: action.android }}
                    size={28}
                    tintColor={BLUE}
                  />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </View>
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
    backgroundColor: '#F6F7FB',
  },
  content: {
    paddingHorizontal: 20,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  greeting: {
    flex: 1,
    gap: 4,
  },
  hello: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1D26',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8B93A7',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1D26',
  },
  reservationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 12,
    shadowColor: '#1A1D26',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  reservationPhoto: {
    width: 92,
    height: 92,
    borderRadius: 14,
  },
  reservationBody: {
    flex: 1,
    gap: 4,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1D26',
  },
  floor: {
    fontSize: 14,
    color: '#8B93A7',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    color: '#5C6578',
  },
  grid: {
    gap: 12,
    marginTop: 6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minHeight: 132,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 18,
    shadowColor: '#1A1D26',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1D26',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5484D',
  },
});
