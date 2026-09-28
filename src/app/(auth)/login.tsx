import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
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
