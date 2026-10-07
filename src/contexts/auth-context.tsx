import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  changePassword as changeAccountPassword,
  getSession,
  saveRole as saveAccountRole,
  signInWithGoogle as signInWithGoogleAccount,
  signIn as signInWithPassword,
  signOut as signOutAccount,
  signUp as signUpAccount,
  subscribeToAuthChanges,
  updatePassword as updateAccountPassword,
  updateProfile as updateAccountProfile,
  type SignUpInput,
  type UpdateProfileInput,
} from "@/services/auth";

import type { UserRole } from "@/types/account";

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

  signIn: (
    email: string,
    password: string,
  ) => ReturnType<typeof signInWithPassword>;

  signInWithGoogle: () => ReturnType<typeof signInWithGoogleAccount>;

  signOut: () => ReturnType<typeof signOutAccount>;

  saveRole: (role: UserRole) => ReturnType<typeof saveAccountRole>;

  updateProfile: (
    input: UpdateProfileInput,
  ) => ReturnType<typeof updateAccountProfile>;

  updatePassword: (
    newPassword: string,
  ) => ReturnType<typeof updateAccountPassword>;

  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{
    error: string | null;
  }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function accountFromUser(user: User): AccountSession {
  const metadata = user.user_metadata ?? {};

  const role =
    metadata.role === "student" || metadata.role === "lecturer"
      ? metadata.role
      : null;

  return {
    id: user.id,

    fullName: text(metadata.full_name),

    universityId: text(metadata.university_id),

    email: user.email ?? "",

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
      if (!active) {
        return;
      }

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

        if (result.session) {
          setSession(result.session);
        }

        return result;
      },

      signIn: async (email, password) => {
        const result = await signInWithPassword(email, password);

        if (result.session) {
          setSession(result.session);
        }

        return result;
      },

      signInWithGoogle: async () => {
        return await signInWithGoogleAccount();
      },

      signOut: async () => {
        const result = await signOutAccount();

        if (!result.error) {
          setSession(null);
        }

        return result;
      },

      saveRole: async (role) => {
        const result = await saveAccountRole(role);

        if (result.user) {
          const user = result.user;

          setSession((current) =>
            current
              ? {
                  ...current,
                  user,
                }
              : current,
          );
        }

        return result;
      },

      updateProfile: async (input) => {
        const result = await updateAccountProfile(input);

        if (result.user) {
          const user = result.user;

          setSession((current) =>
            current
              ? {
                  ...current,
                  user,
                }
              : current,
          );
        }

        return result;
      },

      updatePassword: async (newPassword) => {
        return await updateAccountPassword(newPassword);
      },

      changePassword: async (currentPassword, newPassword) => {
        const email = session?.user.email;

        if (!email) {
          return {
            error: "Unable to find your account email.",
          };
        }

        return await changeAccountPassword(email, currentPassword, newPassword);
      },
    }),
    [isLoading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return value;
}
