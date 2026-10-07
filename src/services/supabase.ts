import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

export const DEMO_MODE = process.env.EXPO_PUBLIC_BOOKING_DEMO !== 'false';
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

let supabaseClient: any = null;

export function requireSupabase(): any {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (DEMO_MODE || !url || !key) {
    throw new Error('Add Supabase URL and anon/publishable key to the root .env, then restart Expo.');
  }

  supabaseClient = createClient(url, key, {
    auth: {
      ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  });

  return supabaseClient;
}

export const supabase: any = null;
