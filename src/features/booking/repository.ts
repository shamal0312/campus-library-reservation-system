import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEMO_MODE, requireSupabase } from '../../services/supabase';
import { active, Booking, overlaps, RoomDraft, SEATS, validateRoom, validateSlot } from './model';

const STORE = 'campus-booking-demo-v1';
let mutationQueue: Promise<unknown> = Promise.resolve();
function serialize<T>(operation: () => Promise<T>): Promise<T> {
  const next = mutationQueue.then(operation, operation);
  mutationQueue = next.catch(() => undefined); return next;
}
async function demoRows(): Promise<Booking[]> { const raw = await AsyncStorage.getItem(STORE); return raw ? JSON.parse(raw) as Booking[] : []; }
async function currentUser() {
  if (DEMO_MODE) return 'demo-student';
  const { data, error } = await requireSupabase().auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Sign in before making or viewing bookings.');
  return data.user.id;
}
export async function listBookings(): Promise<Booking[]> {
  const user = await currentUser();
  if (DEMO_MODE) return (await demoRows()).filter(b => b.user_id === user).sort((a,b) => b.created_at.localeCompare(a.created_at));
  const { data, error } = await requireSupabase().from('booking_reservations').select('*').eq('user_id', user).order('created_at', { ascending: false });
  if (error) throw error; return (data ?? []) as Booking[];
}
export async function occupiedSeats(date: string, slot: string, floor: number): Promise<string[]> {
  const times = validateSlot(date, slot);
  if (DEMO_MODE) return (await demoRows()).filter(b => b.kind === 'seat' && b.floor === floor && overlaps(b, times.start_at, times.end_at)).map(b => b.resource_id);
  await currentUser();
  const { data, error } = await requireSupabase().rpc('booking_occupied_seats', { p_start: times.start_at, p_end: times.end_at, p_floor: floor });
  if (error) throw error; return (data ?? []).map((r: { resource_id: string }) => r.resource_id);
}
export async function reserveSeat(seatId: string, date: string, slot: string): Promise<Booking> {
  const times = validateSlot(date, slot); const user = await currentUser(); const seat = SEATS.find(s => s.id === seatId);
  if (!seat) throw new Error('Select an available seat.');
  if (!DEMO_MODE) {
    const { data, error } = await requireSupabase().rpc('booking_reserve_seat', { p_resource: seatId, p_start: times.start_at, p_end: times.end_at });
    if (error) throw error; return data as Booking;
  }
  return serialize(async () => {
    const rows = await demoRows();
    if (rows.some(b => overlaps(b, times.start_at, times.end_at) && (b.resource_id === seatId || b.user_id === user))) throw new Error('The seat is booked, or you already have a booking during this time.');
    const booking: Booking = { id: `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`, user_id: user, kind: 'seat', resource_id: seat.id, resource_label: `Seat ${seat.label}`, floor: seat.floor, ...times, status: 'reserved', purpose: '', student_ids: [], preference: '', notes: '', created_at: new Date().toISOString() };
    await AsyncStorage.setItem(STORE, JSON.stringify([booking, ...rows])); return booking;
  });
}
export async function requestRoom(draft: RoomDraft): Promise<Booking> {
  validateRoom(draft); const times = validateSlot(draft.date, draft.slot); const user = await currentUser();
  const student_ids = draft.studentIds.map(s => s.trim().toUpperCase());
  if (!DEMO_MODE) {
    const { data, error } = await requireSupabase().rpc('booking_request_room', { p_start: times.start_at, p_end: times.end_at, p_purpose: draft.purpose.trim(), p_students: student_ids, p_preference: draft.preference, p_notes: draft.notes.trim() });
    if (error) throw error; return data as Booking;
  }
  return serialize(async () => {
    const rows = await demoRows();
    if (rows.some(b => b.user_id === user && overlaps(b, times.start_at, times.end_at))) throw new Error('You already have a booking during this time.');
    const booking: Booking = { id: `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`, user_id: user, kind: 'room', resource_id: '', resource_label: 'Room awaiting allocation', floor: 0, ...times, status: 'pending', purpose: draft.purpose.trim(), student_ids, preference: draft.preference, notes: draft.notes.trim(), created_at: new Date().toISOString() };
    await AsyncStorage.setItem(STORE, JSON.stringify([booking, ...rows])); return booking;
  });
}
export async function changeBooking(id: string, action: 'cancel' | 'checkin'): Promise<Booking> {
  const user = await currentUser();
  if (!DEMO_MODE) {
    const { data, error } = await requireSupabase().rpc('booking_change_status', { p_id: id, p_action: action });
    if (error) throw error; return data as Booking;
  }
  return serialize(async () => {
    const rows = await demoRows(); const booking = rows.find(b => b.id === id && b.user_id === user);
    if (!booking) throw new Error('Booking not found.');
    if (!active(booking) || Date.now() >= new Date(booking.end_at).getTime()) throw new Error('This booking is no longer active.');
    if (action === 'checkin') {
      if (booking.kind !== 'seat' || booking.status !== 'reserved') throw new Error('Only reserved seats can be checked in.');
      const start = new Date(booking.start_at).getTime();
      if (Date.now() < start - 15 * 60000 || Date.now() > start + 30 * 60000) throw new Error('Check in from 15 minutes before to 30 minutes after your booking starts.');
    }
    booking.status = action === 'cancel' ? 'cancelled' : 'checked_in';
    await AsyncStorage.setItem(STORE, JSON.stringify(rows)); return booking;
  });
}
