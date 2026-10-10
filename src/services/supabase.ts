import type { SupabaseClient } from '@supabase/supabase-js';

import {
  requireSupabase as getSharedSupabase,
} from '../lib/supabase';

export const DEMO_MODE =
  process.env.EXPO_PUBLIC_BOOKING_DEMO !== 'false';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  !DEMO_MODE && url && key
    ? getSharedSupabase()
    : null;

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Set EXPO_PUBLIC_BOOKING_DEMO=false and add your Supabase URL and anon/publishable key to the root .env, then restart Expo.',
    );
  }

  return supabase;
}