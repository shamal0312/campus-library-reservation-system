import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ICON = '#98A2B3';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 },
        ]}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <SymbolView
            name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
            size={22}
            tintColor="#1A1D26"
          />
        </Pressable>

        <Text style={styles.title}>Welcome Back !</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.field}>
          <SymbolView
            name={{ ios: 'envelope', android: 'mail', web: 'mail' }}
            size={20}
            tintColor={ICON}
          />
          <TextInput
            style={styles.input}
            placeholder="University Email"
            placeholderTextColor={ICON}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.field}>
          <SymbolView name={{ ios: 'lock', android: 'lock', web: 'lock' }} size={20} tintColor={ICON} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={ICON}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable onPress={() => setShowPassword((current) => !current)} hitSlop={8}>
            <SymbolView
              name={{
                ios: showPassword ? 'eye.slash' : 'eye',
                android: showPassword ? 'visibility_off' : 'visibility',
                web: showPassword ? 'visibility_off' : 'visibility',
              }}
              size={20}
              tintColor={ICON}
            />
          </Pressable>
        </View>

        <Pressable style={styles.forgotButton}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </Pressable>

        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <Pressable style={styles.googleButton}>
          <Text style={styles.googleMark}>G</Text>
          <Text style={styles.googleText}>Continue with Google</Text>
        </Pressable>

        <Text style={styles.footer}>
          Don't have an account?{' '}
          <Text style={styles.footerLink} onPress={() => router.push('/register')}>
            Sign up
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 24,
    gap: 14,
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
    fontSize: 15,
    color: '#8B93A7',
    textAlign: 'center',
    marginBottom: 12,
  },
  field: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#F4F6FA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1D26',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotText: {
    color: '#3B5CCC',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    marginTop: 6,
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E6E8EE',
  },
  dividerText: {
    color: '#8B93A7',
    fontSize: 14,
  },
  googleButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E8EE',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleMark: {
    color: '#4285F4',
    fontSize: 20,
    fontWeight: '700',
  },
  googleText: {
    color: '#1A1D26',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    color: '#8B93A7',
    fontSize: 15,
    marginTop: 8,
  },
  footerLink: {
    color: '#3B5CCC',
    fontWeight: '700',
  },
});
