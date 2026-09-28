import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { USER_ROLE_LABELS, type UserRole } from '@/types/account';

const ROLES: {
  role: UserRole;
  ios: 'person' | 'graduationcap';
  android: 'person' | 'school';
}[] = [
  { role: 'lecturer', ios: 'person', android: 'person' },
  { role: 'student', ios: 'graduationcap', android: 'school' },
];

export default function RoleScreen() {
  const insets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}>
      <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
        <SymbolView
          name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
          size={22}
          tintColor="#1A1D26"
        />
      </Pressable>

      <Text style={styles.title}>Select Your Role</Text>
      <Text style={styles.subtitle}>Choose how you want to use Smart Library</Text>

      <View style={styles.cards}>
        {ROLES.map((item) => {
          const selected = selectedRole === item.role;
          return (
            <Pressable
              key={item.role}
              style={[styles.card, selected && styles.cardSelected]}
              onPress={() => setSelectedRole(item.role)}>
              <SymbolView
                name={{ ios: item.ios, android: item.android, web: item.android }}
                size={36}
                tintColor={selected ? '#3B5CCC' : '#1A1D26'}
              />
              <Text style={[styles.cardLabel, selected && styles.cardLabelSelected]}>
                {USER_ROLE_LABELS[item.role]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.spacer} />

      <Pressable style={[styles.button, !selectedRole && styles.buttonDisabled]} disabled={!selectedRole}>
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1D26',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 28,
    fontSize: 15,
    lineHeight: 22,
    color: '#8B93A7',
    textAlign: 'center',
  },
  cards: {
    flexDirection: 'row',
    gap: 14,
  },
  card: {
    flex: 1,
    minHeight: 160,
    borderRadius: 18,
    backgroundColor: '#F4F6FA',
    borderWidth: 2,
    borderColor: '#F4F6FA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 14,
  },
  cardSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#3B5CCC',
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D26',
    textAlign: 'center',
  },
  cardLabelSelected: {
    color: '#3B5CCC',
  },
  spacer: {
    flex: 1,
  },
  button: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#3B5CCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
});
