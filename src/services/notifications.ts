import { requireSupabase } from "@/services/supabase";

export type NotificationItem = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export async function getNotifications() {
  const supabase = requireSupabase();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      notifications: [],
      error: userError?.message ?? "User not found.",
    };
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  return {
    notifications: (data ?? []) as NotificationItem[],
    error: error?.message ?? null,
  };
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = requireSupabase();

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
    })
    .eq("id", notificationId);

  return {
    error: error?.message ?? null,
  };
}

export async function createNotification(input: {
  title: string;
  message: string;
}) {
  const supabase = requireSupabase();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      notification: null,
      error: userError?.message ?? "User not found.",
    };
  }

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: user.id,
      title: input.title,
      message: input.message,
    })
    .select()
    .single();

  return {
    notification: data as NotificationItem | null,
    error: error?.message ?? null,
  };
}

export async function getUnreadNotificationCount() {
  const supabase = requireSupabase();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      count: 0,
      error: userError?.message ?? "User not found.",
    };
  }

  const { count, error } = await supabase
    .from("notifications")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return {
    count: count ?? 0,
    error: error?.message ?? null,
  };
}
