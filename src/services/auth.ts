import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types/account';

export type SignUpInput = {
  fullName: string;
  universityId: string;
  phone: string;
  email: string;
  password: string;
};

export async function signUp(input: SignUpInput) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        full_name: input.fullName.trim(),
        university_id: input.universityId.trim(),
        phone: input.phone.trim(),
      },
    },
  });

  return {
    user: data.user,
    session: data.session,
    error: error?.message ?? null,
  };
}

export async function saveRole(role: UserRole) {
  const { data, error } = await supabase.auth.updateUser({
    data: { role },
  });

  return {
    user: data.user,
    error: error?.message ?? null,
  };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  return {
    session: data.session,
    error: error?.message ?? null,
  };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error: error?.message ?? null };
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return {
    session: data.session,
    error: error?.message ?? null,
  };
}

export function subscribeToAuthChanges(onChange: (session: Session | null) => void) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    onChange(session);
  });

  return () => subscription.unsubscribe();
}
