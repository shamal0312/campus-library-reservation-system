import type { Session } from "@supabase/supabase-js";

import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";

import { requireSupabase } from "@/services/supabase";
import type { UserRole } from "@/types/account";

WebBrowser.maybeCompleteAuthSession();

const redirectTo = makeRedirectUri();

export type SignUpInput = {
  fullName: string;
  universityId: string;
  phone: string;
  email: string;
  password: string;
};

export async function signUp(input: SignUpInput) {
  const supabase = requireSupabase();
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
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.updateUser({
    data: { role },
  });

  return {
    user: data.user,
    error: error?.message ?? null,
  };
}

export async function signIn(email: string, password: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  return {
    session: data.session,
    error: error?.message ?? null,
  };
}

export async function signInWithGoogle() {
  const supabase = requireSupabase();
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      return {
        session: null,
        error: error.message,
      };
    }

    if (!data.url) {
      return {
        session: null,
        error: "Could not start Google sign in.",
      };
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    if (result.type !== "success") {
      return {
        session: null,
        error:
          result.type === "cancel" ? null : "Google sign in was not completed.",
      };
    }

    const { params, errorCode } = QueryParams.getQueryParams(result.url);

    if (errorCode) {
      return {
        session: null,
        error: errorCode,
      };
    }

    const accessToken = params.access_token;
    const refreshToken = params.refresh_token;

    if (typeof accessToken !== "string" || typeof refreshToken !== "string") {
      return {
        session: null,
        error: "Could not create Google session.",
      };
    }

    const { data: sessionData, error: sessionError } =
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

    return {
      session: sessionData.session,
      error: sessionError?.message ?? null,
    };
  } catch (error) {
    return {
      session: null,
      error: error instanceof Error ? error.message : "Google sign in failed.",
    };
  }
}

export async function signOut() {
  const supabase = requireSupabase();
  const { error } = await supabase.auth.signOut();

  return {
    error: error?.message ?? null,
  };
}

export async function getSession() {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.getSession();

  return {
    session: data.session,
    error: error?.message ?? null,
  };
}

export function subscribeToAuthChanges(
  onChange: (session: Session | null) => void,
) {
  const supabase = requireSupabase();
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event: unknown, session: Session | null) => {
    onChange(session);
  });

  return () => subscription.unsubscribe();
}

export async function updatePassword(newPassword: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return {
    user: data.user,
    error: error?.message ?? null,
  };
}

// YOUR PART - Change password
// First verifies the current password, then updates to the new password.
export async function changePassword(
  email: string,
  currentPassword: string,
  newPassword: string,
) {
  // Verify the user's current password
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: currentPassword,
  });

  if (verifyError) {
    return {
      error: "Current password is incorrect.",
    };
  }

  // Update to the new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return {
    error: updateError?.message ?? null,
  };
}
