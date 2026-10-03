import { createClient } from '@supabase/supabase-js';


const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://yavaxhzaegetmwgfsqzh.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_uSQT3JJUy4vC81rCC9iEBw_GEhrIV2oS';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
});

export async function checkIsAdmin(user: any): Promise<boolean> {
  if (!user) return false;

  // 1. Check user metadata if role is set
  if (user.user_metadata?.role === 'admin') return true;

  // 2. Check admin email pattern (e.g. admin@library.com or email containing 'admin')
  const email = user.email?.toLowerCase() || '';
  if (email === 'admin@library.com' || email.startsWith('admin@') || email.includes('admin')) {
    return true;
  }

  // 3. Try to fetch profile from Supabase profiles table
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!error && profile?.role === 'admin') {
      return true;
    }
  } catch {
    // Ignore database fetch error (e.g., 403 Forbidden due to RLS)
  }

  return false;
}