import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/auth-context';

export default function GetStartedScreen() {
  const { session, account } = useAuth();
  const insets = useSafeAreaInsets();

  if (session && !account?.role) {
    return <Redirect href="/role" />;
  }

  return (
    <View style={styles.screen}>
      <Image
        source={require('@/assets/images/library-aisle.jpg')}
        style={styles.photo}
        contentFit="cover"
      />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.iconBadge}>
          <View style={styles.book}>
            <View style={styles.bookPage} />
            <View style={styles.bookSpine} />
          </View>
        </View>
        <Text style={styles.brand}>Smart Library</Text>
        <Text style={styles.tagline}>Your Learning Space</Text>
        <Text style={styles.tagline}>Anytime, Anywhere</Text>
        <Pressable style={styles.button} onPress={() => router.push('/login')}>
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
        <Text style={styles.footer}>Knowledge for a brighter tomorrow</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  photo: {
    width: '100%',
    height: '56%',
  },
  sheet: {
    flex: 1,
    marginTop: -40,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 28,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  book: {
    width: 28,
    height: 22,
    borderWidth: 2,
    borderColor: '#3B5CCC',
    borderRadius: 3,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  bookPage: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  bookSpine: {
    width: 2,
    backgroundColor: '#3B5CCC',
  },
  brand: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1D26',
  },
  tagline: {
    marginTop: 4,
    fontSize: 16,
    color: '#8B93A7',
  },
  button: {
    marginTop: 28,
    width: '100%',
    height: 52,
    borderRadius: 14,
    backgroundColor: '#3B5CCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  footer: {
    marginTop: 16,
    fontSize: 13,
    color: '#B0B6C3',
  },
});
