import { requireSupabase } from "@/services/supabase";

export type NotificationType =
  | "reservation_confirmation"
  | "reservation_reminder"
  | "reservation_update"
  | "general";

export type NotificationPreferences = {
  reservationConfirmations: boolean;
  reservationReminders: boolean;
  reservationUpdates: boolean;
  generalNotifications: boolean;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  reservationConfirmations: true,
  reservationReminders: true,
  reservationUpdates: true,
  generalNotifications: true,
};

export type NotificationItem = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  is_read: boolean;
  created_at: string;
};

type NotificationPreferenceRow = {
  user_id: string;
  reservation_confirmations: boolean;
  reservation_reminders: boolean;
  reservation_updates: boolean;
  general_notifications: boolean;
  created_at?: string;
  updated_at?: string;
};

type CreateNotificationRpcResult = {
  created: boolean;
  notification: NotificationItem | null;
};

function mapPreferenceRow(
  row: NotificationPreferenceRow,
): NotificationPreferences {
  return {
    reservationConfirmations: row.reservation_confirmations,
    reservationReminders: row.reservation_reminders,
    reservationUpdates: row.reservation_updates,
    generalNotifications: row.general_notifications,
  };
}

export async function getNotificationPreferences() {
  const supabase = requireSupabase();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      preferences: DEFAULT_NOTIFICATION_PREFERENCES,
      error: userError?.message ?? "User not found.",
    };
  }

  const { data, error } = await supabase
    .from("notification_preferences")
    .select(
      `
        user_id,
        reservation_confirmations,
        reservation_reminders,
        reservation_updates,
        general_notifications
      `,
    )
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return {
      preferences: DEFAULT_NOTIFICATION_PREFERENCES,
      error: error?.message ?? "Notification preferences not found.",
    };
  }

  return {
    preferences: mapPreferenceRow(data as NotificationPreferenceRow),
    error: null,
  };
}

export async function saveNotificationPreferences(
  preferences: NotificationPreferences,
) {
  const supabase = requireSupabase();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      preferences: null,
      error: userError?.message ?? "User not found.",
    };
  }

  const { data, error } = await supabase
    .from("notification_preferences")
    .update({
      reservation_confirmations: preferences.reservationConfirmations,

      reservation_reminders: preferences.reservationReminders,

      reservation_updates: preferences.reservationUpdates,

      general_notifications: preferences.generalNotifications,

      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .select(
      `
        user_id,
        reservation_confirmations,
        reservation_reminders,
        reservation_updates,
        general_notifications
      `,
    )
    .single();

  if (error || !data) {
    return {
      preferences: null,
      error: error?.message ?? "Could not save notification preferences.",
    };
  }

  return {
    preferences: mapPreferenceRow(data as NotificationPreferenceRow),
    error: null,
  };
}

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

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: userError?.message ?? "User not found.",
    };
  }

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
    })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  return {
    error: error?.message ?? null,
  };
}

export async function createNotification(input: {
  title: string;
  message: string;
  type: NotificationType;
}) {
  const supabase = requireSupabase();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      notification: null,
      skipped: false,
      error: userError?.message ?? "User not found.",
    };
  }

  const { data, error } = await supabase.rpc("create_app_notification", {
    p_title: input.title,
    p_message: input.message,
    p_type: input.type,
  });

  if (error) {
    return {
      notification: null,
      skipped: false,
      error: error.message,
    };
  }

  const result = data as CreateNotificationRpcResult | null;

  if (!result?.created) {
    return {
      notification: null,
      skipped: true,
      error: null,
    };
  }

  return {
    notification: result.notification,
    skipped: false,
    error: null,
  };
}

export function notifyReservation(
  type: Extract<NotificationType, "reservation_confirmation" | "reservation_update">,
  title: string,
  message: string,
) {
  void createNotification({ type, title, message }).catch(() => undefined);
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
