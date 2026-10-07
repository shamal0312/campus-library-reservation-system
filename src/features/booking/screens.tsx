import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { DEMO_MODE, requireSupabase, supabase } from '../../services/supabase';
import { emptyRoom, useBookingDraft } from './context';
import { active, Booking, bookingDate, bookingTime, errorText, FLOORS, past, SEATS, SLOTS, statusText, today, validateRoom, validateSlot } from './model';
import { changeBooking, listBookings, occupiedSeats, requestRoom, reserveSeat } from './repository';
import { Button, C, DateField, ErrorBox, Field, LibraryArt, Page, Select, Steps, styles, SuccessMark, TimeField } from './ui';

function useParams() { const params = useLocalSearchParams<{ date?: string; slot?: string; floor?: string; seat?: string; id?: string; action?: string }>(); return params; }
function useAction() {
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const locked = useRef(false);
  async function run(operation: () => Promise<void>) {
    if (locked.current) return; locked.current = true; setBusy(true); setError('');
    try { await operation(); } catch (e) { setError(errorText(e)); } finally { locked.current = false; setBusy(false); }
  }
  return { busy, error, run, setError };
}
function useBookings() {
  const [rows, setRows] = useState<Booking[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [revision, setRevision] = useState(0);
  useFocusEffect(useCallback(() => {
    let mounted = true; setLoading(true); setError('');
    void listBookings().then(result => { if (mounted) setRows(result); }).catch(e => { if (mounted) setError(errorText(e)); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  // revision deliberately reruns the focus loader for the Refresh button.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revision]));
  return { rows, loading, error, refresh: () => setRevision(r => r + 1) };
}
function Summary({ booking }: { booking: Booking }) {
  return <View style={styles.card}><Text style={[styles.heading, { fontSize: 18 }]}>{booking.resource_label}</Text>
    {booking.floor > 0 && <Text style={styles.text}>Floor: {booking.floor}</Text>}<Text style={styles.text}>Date: {bookingDate(booking)}</Text><Text style={styles.text}>Time: {bookingTime(booking)}</Text><Text style={styles.text}>Status: {statusText(booking.status)}</Text>
    {booking.kind === 'room' && <><Text style={styles.text}>Purpose: {booking.purpose}</Text><Text style={styles.text}>{booking.student_ids.length} students · {booking.preference}</Text>{!!booking.notes && <Text style={styles.text}>Notes: {booking.notes}</Text>}</>}
  </View>;
}

export function SeatBookingScreen() {
  return <Page title="Library Booking"><Text style={[styles.heading, { marginTop: 12 }]}>What would you like to book?</Text>
    <Pressable accessibilityRole="button" onPress={() => router.push('/booking/seat-availability')} style={[styles.card, styles.row]}><View style={{ width: 86 }}><LibraryArt small /></View><View style={{ flex: 1, gap: 6 }}><Text style={[styles.text, { fontWeight: '700', fontSize: 17 }]}>Book a seat</Text><Text style={styles.muted}>Find a quiet space in a reading room</Text></View><Text style={{ color: C.navy }}>›</Text></Pressable>
    <Pressable accessibilityRole="button" onPress={() => router.push('/booking/room-request')} style={[styles.card, styles.row]}><View style={{ width: 86 }}><LibraryArt small room /></View><View style={{ flex: 1, gap: 6 }}><Text style={[styles.text, { fontWeight: '700', fontSize: 17 }]}>Book a study room</Text><Text style={styles.muted}>Request a room for group study</Text></View><Text style={{ color: C.navy }}>›</Text></Pressable>
    {DEMO_MODE && <Text style={styles.muted}>Demo mode · Bookings are saved on this device. Supabase is not connected.</Text>}
    <View style={{ flex: 1, minHeight: 110 }} />
    <View style={{ height: 95, backgroundColor: C.blue, borderTopLeftRadius: 140, borderTopRightRadius: 22, marginHorizontal: -22, marginBottom: -32, overflow: 'hidden' }}><View style={{ height: 75, backgroundColor: C.navy, transform: [{ rotate: '17deg' }], marginTop: 48, marginHorizontal: -20 }} /></View>
  </Page>;
}
export function SeatAvailabilityScreen() {
  const [date, setDate] = useState(() => today()); const [slot, setSlot] = useState('09'); const [floor, setFloor] = useState('2'); const [error, setError] = useState('');
  return <Page title="Seat Availability"><DateField value={date} onChange={setDate} /><TimeField value={slot} onChange={setSlot} /><Select label="Reading Room" value={floor} onSelect={setFloor} choices={FLOORS.map(f => ({ value: String(f), label: `Floor ${f} – Reading Room` }))} /><ErrorBox message={error} /><View style={{ marginTop: 20 }}><Button title="View Seat Map" onPress={() => { try { validateSlot(date, slot); router.push({ pathname: '/booking/seat-map', params: { date, slot, floor } }); } catch (e) { setError(errorText(e)); } }} /></View></Page>;
}
export function SeatMapScreen() {
  const params = useParams(); const date = params.date ?? today(); const slot = params.slot ?? '09'; const floor = Number(params.floor ?? 2);
  const [selected, setSelected] = useState(''); const [occupied, setOccupied] = useState<string[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [revision, setRevision] = useState(0);
  useFocusEffect(useCallback(() => {
    let mounted = true; setLoading(true); setError('');
    void occupiedSeats(date, slot, floor).then(ids => { if (mounted) { setOccupied(ids); setSelected(s => ids.includes(s) ? '' : s); } }).catch(e => { if (mounted) setError(errorText(e)); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  // revision deliberately reruns the focus loader for refreshed availability.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, slot, floor, revision]));
  return <Page title={`Seat map – Floor ${floor}`}><Text style={styles.muted}>{date} · {SLOTS.find(s => s.id === slot)?.label}</Text>
    {loading ? <ActivityIndicator color={C.blue} /> : <>{[1,2].map(table => <View key={table} style={{ gap: 9 }}><Text style={[styles.text, { fontWeight: '700' }]}>Table {String(table).padStart(2,'0')}</Text><View style={local.seatTable}>{SEATS.filter(s => s.floor === floor && s.table === table).map(seat => {
      const taken = occupied.includes(seat.id); const chosen = seat.id === selected;
      return <Pressable key={seat.id} disabled={taken || !!error} accessibilityRole="button" accessibilityLabel={`Seat ${seat.label}, ${taken ? 'occupied' : chosen ? 'selected' : 'available'}`} accessibilityState={{ selected: chosen, disabled: taken }} onPress={() => setSelected(seat.id)} style={[local.seat, { backgroundColor: taken ? C.yellow : chosen ? '#23CD65' : 'white' }]}><Text style={{ color: C.navy, fontWeight: '700', fontSize: 12 }}>{seat.label}</Text></Pressable>;
    })}</View></View>)}<View style={{ gap: 12, marginVertical: 12 }}>{[{ color: 'white', text: 'Available' },{ color: C.yellow, text: 'Occupied / Reserved' },{ color: '#23CD65', text: 'Selected' }].map(item => <View key={item.text} style={styles.row}><View style={{ width: 20, height: 20, backgroundColor: item.color, borderWidth: 1, borderColor: C.muted }} /><Text style={styles.text}>{item.text}</Text></View>)}</View></>}
    <ErrorBox message={error} /><Button title="Refresh availability" outline onPress={() => setRevision(r => r + 1)} disabled={loading} /><Button title="Next" disabled={!selected || loading || !!error} onPress={() => router.push({ pathname: '/booking/seat-details', params: { date, slot, floor: String(floor), seat: selected } })} />
  </Page>;
}
export function SeatDetailsScreen() {
  const params = useParams(); const seat = SEATS.find(s => s.id === params.seat); const action = useAction();
  return <Page title="Selected seat details"><LibraryArt />{seat ? <><View style={styles.card}><Text style={styles.heading}>Seat {seat.label}</Text><Text style={styles.text}>Floor: {seat.floor}</Text><Text style={styles.text}>Charging points: {seat.charging ? 'Available' : 'Not available'}</Text><Text style={styles.text}>Date: {params.date}</Text><Text style={styles.text}>Time: {SLOTS.find(s => s.id === params.slot)?.label}</Text></View><ErrorBox message={action.error} /><View style={{ marginTop: 24 }}><Button title="Reserve Seat" busy={action.busy} onPress={() => { void action.run(async () => { const result = await reserveSeat(seat.id, params.date ?? '', params.slot ?? ''); router.replace({ pathname: '/booking/seat-confirmation', params: { id: result.id } }); }); }} /></View></> : <ErrorBox message="Seat details are missing. Return to the seat map and select a seat." />}</Page>;
}
export function SeatConfirmationScreen() {
  const { id } = useParams(); const data = useBookings(); const booking = data.rows.find(b => b.id === id);
  return <Page title="Confirmation" tabs={false}><SuccessMark /><Text style={[styles.heading, local.center]}>Seat Reserved!</Text>{data.loading ? <ActivityIndicator color={C.blue} /> : booking ? <Summary booking={booking} /> : <ErrorBox message={data.error || 'Booking not found. Open My Reservations to check your bookings.'} />}<Text style={[styles.muted, { color: C.danger, textAlign: 'center', backgroundColor: C.card, padding: 14, borderRadius: 8 }]}>Please check in within 30 minutes after your booking starts.</Text><Button title="View My Reservations" onPress={() => router.replace('/booking/reservations')} /></Page>;
}
export function ReservationsScreen() {
  const data = useBookings(); const [tab, setTab] = useState('Current'); const [cancel, setCancel] = useState<Booking | null>(null); const action = useAction();
  const filtered = data.rows.filter(b => b.kind === 'seat' && (tab === 'Past' ? past(b) : !past(b)));
  return <Page title="My Reservations"><Segments values={['Current','Past']} selected={tab} onSelect={setTab} /><Button title="Refresh" outline onPress={data.refresh} disabled={data.loading} /><ErrorBox message={data.error || action.error} />{data.loading ? <ActivityIndicator color={C.blue} /> : filtered.length === 0 ? <Text style={styles.text}>No {tab.toLowerCase()} seat reservations.</Text> : filtered.map(b => <View key={b.id} style={styles.card}><LibraryArt small /><SummaryLines booking={b} />{!past(b) && <><Button title={b.status === 'checked_in' ? 'Already checked in' : 'Check in'} disabled={b.status === 'checked_in' || action.busy} onPress={() => { void action.run(async () => { await changeBooking(b.id, 'checkin'); router.push({ pathname: '/booking/check-in', params: { id: b.id } }); }); }} /><Button title="Cancel Reservation" outline disabled={action.busy} onPress={() => { action.setError(''); setCancel(b); }} /></>}</View>)}
    <Button title="Book another seat" onPress={() => router.push('/booking/seat-availability')} />
    <Modal transparent visible={!!cancel} animationType="fade" onRequestClose={() => { if (!action.busy) setCancel(null); }}><View style={styles.overlay}><View style={styles.modal}><Text style={[styles.title, { flex: 0 }]}>Cancel Reservation</Text><Text style={local.center}>🔴</Text><Text style={styles.text}>Are you sure you want to cancel {cancel?.resource_label}? This seat will become available for other students.</Text><ErrorBox message={action.error} /><Button title="Keep booking" outline disabled={action.busy} onPress={() => { setCancel(null); action.setError(''); }} /><Button title="Cancel reservation" busy={action.busy} onPress={() => { if (cancel) { const id = cancel.id; void action.run(async () => { await changeBooking(id, 'cancel'); setCancel(null); router.push({ pathname: '/booking/cancelled', params: { id } }); }); } }} /></View></View></Modal>
  </Page>;
}
export function BookingResultScreen({ cancelled = false }: { cancelled?: boolean }) {
  const { id } = useParams(); const data = useBookings(); const booking = data.rows.find(b => b.id === id); const expected = cancelled ? 'cancelled' : 'checked_in';
  return <Page title={cancelled ? 'Cancel confirmation' : 'Check-in confirmation'} tabs={false}>{data.loading ? <ActivityIndicator color={C.blue} /> : booking?.status === expected ? <><SuccessMark /><Text style={[styles.heading, local.center]}>{cancelled ? 'Reservation cancelled!' : 'Check-in completed!'}</Text><Summary booking={booking} /><Text style={[styles.text, local.center]}>{cancelled ? `${booking.resource_label} is now available for other students.` : 'Your seat is ready.'}</Text></> : <ErrorBox message={data.error || 'This booking has not reached the expected status. Open My Reservations.'} />}<Button title={cancelled ? 'Book another seat' : 'View My Reservations'} onPress={() => router.replace(cancelled ? '/booking/seat-availability' : '/booking/reservations')} /></Page>;
}
export function RoomRequestScreen() {
  const { room, setRoom } = useBookingDraft(); const [error, setError] = useState(''); const [count, setCount] = useState(String(room.studentIds.length));
  return <Page title="Study Room Booking"><Steps step={1} /><Field label="Purpose of booking" value={room.purpose} onChange={purpose => setRoom({ ...room, purpose })} maxLength={200} placeholder="e.g. Group study" /><DateField value={room.date} onChange={date => setRoom({ ...room, date })} /><TimeField value={room.slot} onChange={slot => setRoom({ ...room, slot })} />
    <Select label="Number of students" value={count} choices={[2,3,4,5,6,7,8].map(n => ({ value: String(n), label: String(n) }))} onSelect={value => { setCount(value); setRoom({ ...room, studentIds: Array.from({ length: Number(value) }, (_, i) => room.studentIds[i] ?? '') }); }} />
    <Text style={styles.muted}>Include your own student ID and every group member.</Text>{room.studentIds.map((id, i) => <Field key={i} label={`Student ${i + 1} ID${i === 0 ? ' (you)' : ''}`} value={id} maxLength={30} placeholder="IT236XXXXX" onChange={value => setRoom({ ...room, studentIds: room.studentIds.map((s, index) => index === i ? value : s) })} />)}
    <Select label="Room preference" value={room.preference} onSelect={preference => setRoom({ ...room, preference })} choices={['Any available room', 'Quiet study room', 'Discussion room'].map(value => ({ value, label: value }))} /><Field label="Any additional notes" value={room.notes} onChange={notes => setRoom({ ...room, notes })} multiline maxLength={1000} /><ErrorBox message={error} /><Button title="Next" onPress={() => { try { validateRoom(room); router.push('/booking/room-review'); } catch (e) { setError(errorText(e)); } }} />
  </Page>;
}
export function RoomReviewScreen() {
  const { room, setRoom } = useBookingDraft(); const action = useAction();
  return <Page title="Review your request"><Steps step={2} /><View style={styles.card}><Text style={styles.text}>▣  {room.purpose || 'Purpose not entered'}</Text><Text style={styles.text}>▦  {room.date}</Text><Text style={styles.text}>◷  {SLOTS.find(s => s.id === room.slot)?.label}</Text><Text style={styles.text}>♙  {room.studentIds.length} students</Text><Text style={styles.text}>▤  {room.preference}</Text><Text style={styles.text}>IDs: {room.studentIds.join(', ')}</Text>{!!room.notes && <Text style={styles.text}>{room.notes}</Text>}</View><ErrorBox message={action.error} /><Button title="Edit" outline disabled={action.busy} onPress={() => router.canGoBack() ? router.back() : router.replace('/booking/room-request')} /><Button title="Submit request" busy={action.busy} onPress={() => { void action.run(async () => { const result = await requestRoom(room); setRoom(emptyRoom()); router.replace({ pathname: '/booking/room-submitted', params: { id: result.id } }); }); }} /></Page>;
}
export function RoomSubmittedScreen() {
  const { id } = useParams(); const data = useBookings(); const booking = data.rows.find(b => b.id === id);
  return <Page title="Request submitted" tabs={false}><Steps step={3} /><SuccessMark room /><Text style={[styles.heading, local.center]}>Request submitted!</Text>{data.loading ? <ActivityIndicator color={C.blue} /> : booking ? <><View style={styles.card}><Text style={styles.text}>Your study room booking request has been submitted for review. The room will be allocated after approval.</Text></View><Summary booking={booking} /></> : <ErrorBox message={data.error || 'Request not found. Check My Room Bookings.'} />}<Button title="View My Bookings" onPress={() => router.replace('/booking/room-bookings')} /></Page>;
}
function Segments({ values, selected, onSelect }: { values: string[]; selected: string; onSelect: (s: string) => void }) { return <View style={{ flexDirection: 'row', borderRadius: 7, overflow: 'hidden', borderWidth: 1, borderColor: '#A6B2C3' }}>{values.map(value => <Pressable accessibilityRole="button" accessibilityState={{ selected: value === selected }} key={value} style={{ flex: 1, minHeight: 40, backgroundColor: value === selected ? '#86A8E8' : 'white', justifyContent: 'center', alignItems: 'center' }} onPress={() => onSelect(value)}><Text style={{ fontSize: 12, color: C.navy, fontWeight: value === selected ? '700' : '400' }}>{value}</Text></Pressable>)}</View>; }
function SummaryLines({ booking: b }: { booking: Booking }) { const good = ['approved', 'checked_in'].includes(b.status); return <><View style={[styles.row, { justifyContent: 'space-between', flexWrap: 'wrap' }]}><Text style={[styles.text, { fontWeight: '700' }]}>{b.resource_label}</Text><Text style={{ color: good ? '#22643C' : b.status === 'rejected' ? '#92233D' : C.navy, backgroundColor: good ? C.green : b.status === 'rejected' ? '#F1AFB9' : C.yellow, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5, fontSize: 12 }}>{statusText(b.status)}</Text></View><Text style={styles.text}>{bookingDate(b)} · {bookingTime(b)}</Text>{b.kind === 'seat' ? <Text style={styles.text}>Floor {b.floor}</Text> : <Text style={styles.text}>{b.purpose} · {b.student_ids.length} students</Text>}</>; }
export function RoomBookingsScreen() {
  const data = useBookings(); const [filter, setFilter] = useState('All'); const [cancel, setCancel] = useState<Booking | null>(null); const action = useAction();
  const rows = data.rows.filter(b => b.kind === 'room' && (filter === 'All' || statusText(b.status) === filter));
  return <Page title="My Room Bookings"><Segments values={['All','Pending','Approved','Rejected']} selected={filter} onSelect={setFilter} /><Button title="Refresh" outline onPress={data.refresh} disabled={data.loading} /><ErrorBox message={data.error || action.error} />{data.loading ? <ActivityIndicator color={C.blue} /> : rows.length ? rows.map(b => <View style={styles.card} key={b.id}><SummaryLines booking={b} /><Text style={styles.muted}>{b.preference}{past(b) ? ' · Past booking' : ''}</Text>{!past(b) && active(b) && <Button title="Cancel request" outline disabled={action.busy} onPress={() => { action.setError(''); setCancel(b); }} />}</View>) : <Text style={styles.text}>No {filter === 'All' ? '' : filter.toLowerCase() + ' '}room bookings.</Text>}<Button title="Book a study room" onPress={() => router.push('/booking/room-request')} />
    <Modal visible={!!cancel} transparent animationType="fade" onRequestClose={() => { if (!action.busy) setCancel(null); }}><View style={styles.overlay}><View style={styles.modal}><Text style={styles.heading}>Cancel room request?</Text><Text style={styles.text}>Cancel your request for {cancel ? bookingDate(cancel) : ''}?</Text><ErrorBox message={action.error} /><Button title="Keep request" outline disabled={action.busy} onPress={() => setCancel(null)} /><Button title="Cancel request" busy={action.busy} onPress={() => { if (cancel) { const id = cancel.id; void action.run(async () => { await changeBooking(id, 'cancel'); setCancel(null); data.refresh(); }); } }} /></View></View></Modal>
  </Page>;
}
export function AccountScreen() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [signedIn, setSignedIn] = useState(false); const action = useAction(); const setAccountError = action.setError;
  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    void supabase.auth.getSession().then(({ data }: any) => { if (mounted) { setSignedIn(!!data.session); setEmail(data.session?.user.email ?? ''); } }).catch((e: unknown) => { if (mounted) setAccountError(errorText(e)); });
    const { data } = supabase.auth.onAuthStateChange((_event: unknown, session: any) => { setSignedIn(!!session); if (session?.user.email) setEmail(session.user.email); });
    return () => { mounted = false; data.subscription.unsubscribe(); };
    // This subscription is registered once; action.setError is React's stable setter.
  }, [setAccountError]);
  return <Page title="Profile">{DEMO_MODE ? <View style={styles.card}><Text style={styles.heading}>Demo Student</Text><Text style={styles.text}>Seat and study room bookings are stored locally on this device. Set EXPO_PUBLIC_BOOKING_DEMO=false to use Supabase.</Text></View> : signedIn ? <><Text style={styles.heading}>Signed in</Text><Text style={styles.text}>{email}</Text><Button title="Sign out" busy={action.busy} onPress={() => { void action.run(async () => { const { error } = await requireSupabase().auth.signOut(); if (error) throw error; setPassword(''); router.replace('/'); }); }} /></> : <><Text style={styles.heading}>Student sign in</Text><Text style={styles.muted}>Use your existing Supabase student account.</Text><Field label="Email" value={email} onChange={setEmail} maxLength={254} /><View><Text style={styles.label}>Password</Text><TextInput style={styles.input} accessibilityLabel="Password" secureTextEntry value={password} onChangeText={setPassword} autoCapitalize="none" /></View><Button title="Sign in" busy={action.busy} onPress={() => { void action.run(async () => { if (!email.trim() || !password) throw new Error('Enter your email and password.'); const { error } = await requireSupabase().auth.signInWithPassword({ email: email.trim(), password }); if (error) throw error; setPassword(''); router.replace('/'); }); }} /></>}<ErrorBox message={action.error} /></Page>;
}
export function AuthRefresh() {
  useEffect(() => {
    if (!supabase) return;
    const update = (state: string) => { if (state === 'active') supabase?.auth.startAutoRefresh(); else supabase?.auth.stopAutoRefresh(); };
    update(AppState.currentState); const sub = AppState.addEventListener('change', update);
    return () => { sub.remove(); supabase?.auth.stopAutoRefresh(); };
  }, []);
  return null;
}
const local = StyleSheet.create({
  center: { textAlign: 'center' },
  seatTable: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#667B96', borderRadius: 10, padding: 10, gap: 10 },
  seat: { width: '17%', flexGrow: 1, minHeight: 44, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
});
