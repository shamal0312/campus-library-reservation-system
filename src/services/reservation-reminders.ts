import AsyncStorage from "@react-native-async-storage/async-storage";

import { listBookings } from "@/features/booking/repository";
import { getMyBookReservations } from "@/services/bookService";
import { createNotification } from "@/services/notifications";
import { requireSupabase } from "@/services/supabase";

const REMINDER_WINDOW_MS = 24 * 60 * 60 * 1000;
const SENT_REMINDERS_KEY = "sent-reservation-reminders";

function isUpcoming(start: Date, now: number) {
  const time = start.getTime();
  return time > now && time - now <= REMINDER_WINDOW_MS;
}

async function loadSentReminderIds() {
  const raw = await AsyncStorage.getItem(SENT_REMINDERS_KEY);
  return new Set(raw ? (JSON.parse(raw) as string[]) : []);
}

async function saveSentReminderIds(ids: Set<string>) {
  await AsyncStorage.setItem(SENT_REMINDERS_KEY, JSON.stringify([...ids]));
}

export async function syncUpcomingReservationReminders() {
  try {
    const supabase = requireSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const now = Date.now();
    const reminded = await loadSentReminderIds();

    const seatAndRoom = await listBookings().catch(() => []);

    for (const booking of seatAndRoom) {
      if (!["reserved", "pending", "approved"].includes(booking.status)) {
        continue;
      }

      const start = new Date(booking.start_at);
      if (!isUpcoming(start, now) || reminded.has(booking.id)) {
        continue;
      }

      const kind = booking.kind === "seat" ? "seat" : "study room";
      const result = await createNotification({
        type: "reservation_reminder",
        title: "Upcoming reservation",
        message: `Your ${kind} reservation for ${booking.resource_label} starts soon.`,
      });

      if (result.notification) {
        reminded.add(booking.id);
      }
    }

    const books = await getMyBookReservations(user.id).catch(() => []);

    for (const reservation of books) {
      const start = new Date(reservation.start_time);
      if (
        Number.isNaN(start.getTime()) ||
        !isUpcoming(start, now) ||
        reminded.has(reservation.id)
      ) {
        continue;
      }

      const title = reservation.item_name || "your book";
      const result = await createNotification({
        type: "reservation_reminder",
        title: "Upcoming reservation",
        message: `Pickup for ${title} is coming up soon.`,
      });

      if (result.notification) {
        reminded.add(reservation.id);
      }
    }

    await saveSentReminderIds(reminded);
  } catch {
    return;
  }
}
