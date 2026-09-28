import { StyleSheet, Text, View } from 'react-native';

import { USER_ROLE_LABELS } from '@/types/account';

export default function RoleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Role</Text>
      <Text style={styles.choice}>{USER_ROLE_LABELS.lecturer}</Text>
      <Text style={styles.choice}>{USER_ROLE_LABELS.student}</Text>
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
  choice: {
    fontSize: 16,
    color: '#333333',
  },
});
