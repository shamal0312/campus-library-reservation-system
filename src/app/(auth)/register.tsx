import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Link href="/role" style={styles.link}>
        Select Your Role
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
