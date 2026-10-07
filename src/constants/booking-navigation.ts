import type { Href } from 'expo-router';

// The responsible members should set these to their existing routes.
// No Home, Book, or Profile screens are created by this booking module.
export const APP_DESTINATIONS: {
  home: Href;
  seat: Href;
  book: Href | null;
  profile: Href | null;
} = {
  home: '/',
  seat: '/booking',
  book: null,
  profile: null,
};

// Routes for buttons on the other member's Profile screen.
export const BOOKING_PROFILE_LINKS = {
  seatReservations: '/booking/reservations',
  roomBookings: '/booking/room-bookings',
} as const;
