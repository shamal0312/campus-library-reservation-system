export type BookingKind = 'seat' | 'room';
export type BookingStatus = 'reserved' | 'checked_in' | 'pending' | 'approved' | 'rejected' | 'cancelled';
export type { Seat } from './seat-layout';
export { SEATS, FLOORS } from './seat-layout';
export interface Booking {
  id: string; user_id: string; kind: BookingKind; resource_id: string;
  resource_label: string; floor: number; start_at: string; end_at: string;
  status: BookingStatus; purpose: string; student_ids: string[];
  preference: string; notes: string; created_at: string;
}
export interface RoomDraft { purpose: string; date: string; slot: string; studentIds: string[]; preference: string; notes: string; }
export const SLOTS = [
  { id: '09', label: '9:00 AM – 11:00 AM', start: '09:00', end: '11:00' },
  { id: '11', label: '11:00 AM – 1:00 PM', start: '11:00', end: '13:00' },
  { id: '13', label: '1:00 PM – 3:00 PM', start: '13:00', end: '15:00' },
  { id: '15', label: '3:00 PM – 5:00 PM', start: '15:00', end: '17:00' },
];
export function today(daysAhead = 0) { const d = new Date(Date.now() + (330 * 60000) + daysAhead * 86400000); return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`; }
export function slotTimes(date: string, slotId: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Select a valid date.');
  const slot = SLOTS.find(s => s.id === slotId);
  if (!slot) throw new Error('Select a time slot.');
  const start = new Date(`${date}T${slot.start}:00+05:30`); const end = new Date(`${date}T${slot.end}:00+05:30`);
  if (Number.isNaN(start.getTime()) || new Date(start.getTime() + 330 * 60000).toISOString().slice(0, 10) !== date) throw new Error('Select a valid date.');
  return { start_at: start.toISOString(), end_at: end.toISOString() };
}
export function validateSlot(date: string, slot: string) {
  const times = slotTimes(date, slot); const start = new Date(times.start_at).getTime();
  if (start <= Date.now()) throw new Error('This slot has already started. Choose a future slot.');
  if (start > Date.now() + 30 * 86400000) throw new Error('Bookings are available up to 30 days ahead.');
  return times;
}
export function validateRoom(draft: RoomDraft) {
  validateSlot(draft.date, draft.slot);
  if (draft.purpose.trim().length < 3 || draft.purpose.trim().length > 200) throw new Error('Enter a purpose between 3 and 200 characters.');
  if (draft.studentIds.length < 2 || draft.studentIds.length > 8) throw new Error('Study rooms support 2–8 students, including you.');
  const ids = draft.studentIds.map(s => s.trim().toUpperCase());
  if (ids.some(s => !/^[A-Z0-9-]{4,30}$/.test(s))) throw new Error('Enter a valid student ID for every student (4–30 letters/numbers).');
  if (new Set(ids).size !== ids.length) throw new Error('Each student ID must be different.');
  if (draft.notes.length > 1000) throw new Error('Notes must be 1,000 characters or fewer.');
}
export const active = (b: Booking) => ['reserved', 'checked_in', 'pending', 'approved'].includes(b.status);
export const overlaps = (b: Booking, start: string, end: string) => active(b) && b.start_at < end && b.end_at > start;
export const past = (b: Booking) => !active(b) || new Date(b.end_at).getTime() <= Date.now();
export function bookingDate(b: Booking) { return new Date(b.start_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Colombo' }); }
export function bookingTime(b: Booking) { const options = { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Colombo' } as const; return `${new Date(b.start_at).toLocaleTimeString('en-US', options)} – ${new Date(b.end_at).toLocaleTimeString('en-US', options)}`; }
export const statusText = (status: BookingStatus) => ({ reserved: 'Reserved', checked_in: 'Checked in', pending: 'Pending', approved: 'Approved', rejected: 'Rejected', cancelled: 'Cancelled' })[status];
export function errorText(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error && error.code === '23P01') return 'This seat has just been booked. Select another seat.';
  if (error && typeof error === 'object' && 'message' in error) return String(error.message);
  return 'Something went wrong. Please try again.';
}
