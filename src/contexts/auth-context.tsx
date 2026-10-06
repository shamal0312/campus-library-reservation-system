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
  //  verifies current password before changing it
  changePassword as changeAccountPassword,
  getSession,
  saveRole as saveAccountRole,
  //  Google Sign-In
  signInWithGoogle as signInWithGoogleAccount,
  signIn as signInWithPassword,
  signOut as signOutAccount,
  signUp as signUpAccount,
  subscribeToAuthChanges,

  //direct password update
  updatePassword as updateAccountPassword,
  type SignUpInput,
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

  //  Sign Up
  signUp: (input: SignUpInput) => ReturnType<typeof signUpAccount>;

  //  Email / Password Sign In
  signIn: (
    email: string,
    password: string,
  ) => ReturnType<typeof signInWithPassword>;

  //  Google Sign In
  signInWithGoogle: () => ReturnType<typeof signInWithGoogleAccount>;

  // Sign Out
  signOut: () => ReturnType<typeof signOutAccount>;

  // Save Student / Lecturer Role
  saveRole: (role: UserRole) => ReturnType<typeof saveAccountRole>;

  //  Direct password update
  updatePassword: (
    newPassword: string,
  ) => ReturnType<typeof updateAccountPassword>;

  //  Change password
  // Current password is verified before updating
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{
    error: string | null;
  }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// safely convert metadata values to strings
function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

//  convert Supabase user into app account format
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

  // Load current Supabase session
  // and listen for auth changes
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

      //  Sign Up
      signUp: async (input) => {
        const result = await signUpAccount(input);

        if (result.session) {
          setSession(result.session);
        }

        return result;
      },

      // Email / Password Sign In
      signIn: async (email, password) => {
        const result = await signInWithPassword(email, password);

        if (result.session) {
          setSession(result.session);
        }

        return result;
      },

      // Google Sign In
      signInWithGoogle: async () => {
        return await signInWithGoogleAccount();
      },

      //  Sign Out
      signOut: async () => {
        const result = await signOutAccount();

        if (!result.error) {
          setSession(null);
        }

        return result;
      },

      // Save role
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

      //  Direct password update
      updatePassword: async (newPassword) => {
        return await updateAccountPassword(newPassword);
      },

      // =====================================
      //  Change Password
      // =====================================
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
