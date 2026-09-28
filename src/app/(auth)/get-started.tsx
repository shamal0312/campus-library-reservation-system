import { Link, Redirect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/contexts/auth-context';

export default function GetStartedScreen() {
  const { session, account } = useAuth();

  if (session && !account?.role) {
    return <Redirect href="/role" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Get Started</Text>
      <Link href="/login" style={styles.link}>
        Login
      </Link>
      <Link href="/register" style={styles.link}>
        Create Account
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111111',
  },
  link: {
    fontSize: 16,
    color: '#208AEF',
  },
});
