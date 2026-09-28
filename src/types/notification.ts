export type NotificationKind = 'booking_confirmed' | 'pickup_reminder' | 'seat_reminder' | 'general';

export type AppNotification = {
  id: string;
  userId: string;
  title: string;
  body: string;
  kind: NotificationKind;
  createdAt: string;
  readAt: string | null;
};

export type ReminderMinutes = 15 | 30 | 60;

export type AppTheme = 'light' | 'dark';

export type NotificationPreferences = {
  userId: string;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  reminderMinutesBefore: ReminderMinutes;
  theme: AppTheme;
};
