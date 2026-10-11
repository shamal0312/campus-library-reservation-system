import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

// 1. False the demo mode
export const DEMO_MODE = false;

// 2.Add Fallback values to url and key, so that the app can run without .env file (for demo purposes)
const url =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://yavaxhzaegetmwgfsqzh.supabase.co';

const key =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdmF4aHphZWdldG13Z2ZzcXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMjQxMzYsImV4cCI6MjEwNTcwMDEzNn0.Mjkj8pZQK1Vgu-OF7k5klEObp3pt0rtytk7gteT_wx8';

let supabaseClient: any = null;

export function requireSupabase(): any {
  if (supabaseClient) {
    return supabaseClient;
  }

  // if the url or key is missing, throw an error to inform the developer to add them to the .env file
  if (!url || !key) {
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

export const supabase: any = requireSupabase();