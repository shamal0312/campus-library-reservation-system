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
  const [selectedRole, setSelectedRole] = useState<UserRole>('lecturer');

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <SymbolView
            name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
            size={20}
            tintColor="#1A1D26"
          />
        </Pressable>
        <Text style={styles.title}>Select Your Role</Text>
      </View>

      <Text style={styles.subtitle}>Choose how you want to use{'\n'}Smart Library</Text>
      <Text style={styles.sectionLabel}>Registration Role</Text>

      <View style={styles.cards}>
        {ROLES.map((item) => {
          const selected = selectedRole === item.role;
          return (
            <Pressable
              key={item.role}
              style={[styles.card, selected ? styles.cardSelected : styles.cardIdle]}
              onPress={() => setSelectedRole(item.role)}>
              <View style={styles.cardTop}>
                <SymbolView
                  name={{ ios: item.ios, android: item.android, web: item.android }}
                  size={34}
                  tintColor="#3B5CCC"
                />
                <SymbolView
                  name={
                    selected
                      ? { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }
                      : { ios: 'circle', android: 'radio_button_unchecked', web: 'radio_button_unchecked' }
                  }
                  size={24}
                  tintColor={selected ? '#3B5CCC' : '#C5CAD3'}
                />
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.cardLabel}>{USER_ROLE_LABELS[item.role]}</Text>
                <SymbolView
                  name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                  size={22}
                  tintColor="#98A2B3"
                />
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.spacer} />

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F5F8',
    paddingHorizontal: 20,
  },
  header: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1D26',
  },
  subtitle: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 22,
    color: '#8B93A7',
    textAlign: 'center',
  },
  sectionLabel: {
    marginTop: 28,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D26',
  },
  cards: {
    gap: 14,
  },
  card: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 18,
  },
  cardSelected: {
    backgroundColor: '#E4EBFF',
  },
  cardIdle: {
    backgroundColor: '#E7E9EE',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1D26',
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
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});
