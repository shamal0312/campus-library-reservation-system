import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';

import {
  getSession,
  saveRole as saveAccountRole,
  signIn as signInWithPassword,
  signOut as signOutAccount,
  signUp as signUpAccount,
  subscribeToAuthChanges,
  type SignUpInput,
} from '@/services/auth';
import type { UserRole } from '@/types/account';

export type AccountSession = {
  id: string;
  fullName: string;
  universityId: string;
  email: string;
  phone: string;
  role: UserRole | null;
  avatarUrl: string | null;
};

type AuthContextValue = {
  isLoading: boolean;
  session: Session | null;
  account: AccountSession | null;
  signUp: (input: SignUpInput) => ReturnType<typeof signUpAccount>;
  signIn: (email: string, password: string) => ReturnType<typeof signInWithPassword>;
  signOut: () => ReturnType<typeof signOutAccount>;
  saveRole: (role: UserRole) => ReturnType<typeof saveAccountRole>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function text(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function accountFromUser(user: User): AccountSession {
  const metadata = user.user_metadata ?? {};
  const role = metadata.role === 'student' || metadata.role === 'lecturer' ? metadata.role : null;

  return {
    id: user.id,
    fullName: text(metadata.full_name),
    universityId: text(metadata.university_id),
    email: user.email ?? '',
    phone: text(metadata.phone),
    role,
    avatarUrl: text(metadata.avatar_url) || null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getSession().then(({ session: current }) => {
      if (!active) return;
      setSession(current);
      setIsLoading(false);
    });

    const unsubscribe = subscribeToAuthChanges((next) => {
      setSession(next);
      setIsLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      session,
      account: session?.user ? accountFromUser(session.user) : null,
      signUp: async (input) => {
        const result = await signUpAccount(input);
        if (result.session) setSession(result.session);
        return result;
      },
      signIn: async (email, password) => {
        const result = await signInWithPassword(email, password);
        if (result.session) setSession(result.session);
        return result;
      },
      signOut: async () => {
        const result = await signOutAccount();
        if (!result.error) setSession(null);
        return result;
      },
      saveRole: async (role) => {
        const result = await saveAccountRole(role);
        if (result.user) {
          const user = result.user;
          setSession((current) => (current ? { ...current, user } : current));
        }
        return result;
      },
    }),
    [isLoading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return value;
}
