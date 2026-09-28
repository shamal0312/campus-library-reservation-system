import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import Svg, { Path } from 'react-native-svg';
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

import { useAuth } from '@/contexts/auth-context';

const ICON = '#98A2B3';

function GoogleIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <Path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <Path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <Path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </Svg>
  );
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();

  async function handleLogin() {
    if (!email.trim() || !password) {
      setErrorMessage('Enter your university email and password.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    const result = await signIn(email, password);
    setIsSubmitting(false);

    if (result.error || !result.session) {
      setErrorMessage(result.error ?? 'Could not sign in.');
      return;
    }

    const role = result.session.user.user_metadata?.role;
    if (role !== 'student' && role !== 'lecturer') {
      router.replace('/role');
    }
  }

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

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <Pressable
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isSubmitting}>
          <Text style={styles.buttonText}>{isSubmitting ? 'Signing in...' : 'Login'}</Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <Pressable style={styles.googleButton}>
          <GoogleIcon />
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
  buttonDisabled: {
    opacity: 0.6,
  },
  error: {
    color: '#D92D20',
    fontSize: 14,
    textAlign: 'center',
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
