import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createClient,
  processLock,
  type SupabaseClient,
} from '@supabase/supabase-js';
import { Platform } from 'react-native';

export const DEMO_MODE =
  process.env.EXPO_PUBLIC_BOOKING_DEMO !== 'false';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const isServer =
  Platform.OS === 'web' && typeof window === 'undefined';

export const supabase: SupabaseClient | null =
  !DEMO_MODE && url && key
    ? createClient(url, key, {
        auth: {
          ...(Platform.OS !== 'web'
            ? { storage: AsyncStorage }
            : {}),
          autoRefreshToken: !isServer,
          persistSession: !isServer,
          detectSessionInUrl: false,
          lock: processLock,
        },
      })
    : null;

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Set EXPO_PUBLIC_BOOKING_DEMO=false and add your Supabase URL and anon/publishable key to the root .env, then restart Expo.',
    );
  }

  return supabase;
}