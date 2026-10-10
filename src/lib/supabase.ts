import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createClient,
  type SupabaseClient,
} from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const isServer =
  Platform.OS === 'web' && typeof window === 'undefined';

let supabaseClient: SupabaseClient | null = null;

export function requireSupabase(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Add Supabase URL and anon/publishable key to the root .env, then restart Expo.',
    );
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      ...(Platform.OS !== 'web'
        ? { storage: AsyncStorage }
        : {}),
      autoRefreshToken: !isServer,
      persistSession: !isServer,
      detectSessionInUrl: false,
    },
  });

  return supabaseClient;
}

export const supabase = requireSupabase();