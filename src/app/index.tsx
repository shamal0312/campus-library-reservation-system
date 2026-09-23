import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Campus Library Reservation System
      </Text>

      <Text style={styles.subtitle}>
        Base project setup successfully.
      </Text>
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
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111111',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
    color: '#666666',
  },
});