import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import { useAuth } from '@/contexts/auth-context';
import { errorText, SLOTS, today, validateSlot } from './model';
import { occupiedSeats, reserveSeat } from './repository';
import { floorsForRole, SEATS, seatsForRole, tablesForRole, type SeatRole } from './seat-layout';
import { Button, C, DateField, ErrorBox, LibraryArt, Page, Select, styles, TimeField } from './ui';

function roleLabel(role: SeatRole) {
  return role === 'lecturer' ? 'Lecturer' : 'Student';
}

export function SeatAvailabilityScreen() {
  const { account, isLoading } = useAuth();
  const role = account?.role;
  const [date, setDate] = useState(() => today());
  const [slot, setSlot] = useState('09');
  const [selectedFloor, setSelectedFloor] = useState('2');
  const [error, setError] = useState('');

  if (isLoading) return <Page title="Seat Availability"><ActivityIndicator color={C.blue} /></Page>;
  if (!role) return <Page title="Seat Availability"><ErrorBox message="Sign in and select Student or Lecturer before booking a seat." /></Page>;

  const floors = floorsForRole(role);
  const floor = floors.includes(Number(selectedFloor)) ? selectedFloor : String(floors[0]);
  const tables = tablesForRole(Number(floor), role);
  const seatCount = tables.reduce((sum, table) => sum + table.chairs, 0);

  return (
    <Page title="Seat Availability">
      <Text style={styles.muted}>{roleLabel(role)} reading room</Text>
      <DateField value={date} onChange={setDate} />
      <TimeField value={slot} onChange={setSlot} />
      <Select label="Reading Room" value={floor} onSelect={setSelectedFloor}
        choices={floors.map(f => ({ value: String(f), label: `Floor ${f} – ${roleLabel(role)} Reading Room` }))} />
      <Text style={styles.text}>{tables.length} tables · {seatCount} seats</Text>
      <ErrorBox message={error} />
      <Button title="View Seat Map" onPress={() => {
        try {
          validateSlot(date, slot);
          setError('');
          router.push({ pathname: '/booking/seat-map', params: { date, slot, floor } });
        } catch (cause) { setError(errorText(cause)); }
      }} />
    </Page>
  );
}

export function SeatMapScreen() {
  const params = useLocalSearchParams<{ date?: string; slot?: string; floor?: string }>();
  const { account, isLoading: authLoading } = useAuth();
  const role = account?.role ?? null;
  const date = params.date ?? today();
  const slot = params.slot ?? '09';
  const floor = Number(params.floor ?? '2');
  const allowed = !!role && floorsForRole(role).includes(floor);
  const [selected, setSelected] = useState('');
  const [occupied, setOccupied] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useFocusEffect(useCallback(() => {
    let mounted = true;
    setSelected('');
    setOccupied([]);
    setError('');
    if (authLoading) { setLoading(true); return () => { mounted = false; }; }
    if (!role || !allowed) {
      setLoading(false);
      setError('This reading room is not available for your account role. Return to Seat Availability.');
      return () => { mounted = false; };
    }
    setLoading(true);
    void occupiedSeats(date, slot, floor, role)
      .then(ids => { if (mounted) setOccupied(ids); })
      .catch(cause => { if (mounted) setError(errorText(cause)); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  // revision intentionally reruns the loader when Refresh is pressed.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, slot, floor, role, allowed, authLoading, revision]));

  const tables = role && allowed ? tablesForRole(floor, role) : [];
  const seats = role && allowed ? seatsForRole(floor, role) : [];
  const selectedSeat = seats.find(s => s.id === selected);

  return (
    <Page title={`Seat Map – Floor ${floor}`}>
      {role && <Text style={styles.text}>{roleLabel(role)} area · {tables.length} tables · {seats.length} seats</Text>}
      <Text style={styles.muted}>{date} · {SLOTS.find(s => s.id === slot)?.label}</Text>
      <ErrorBox message={error} />
      {loading ? <ActivityIndicator color={C.blue} /> : !error && tables.map(table => {
        const tableSeats = seats.filter(s => s.table === table.table);
        const half = Math.ceil(table.chairs / 2);
        function renderChair(seat: typeof tableSeats[number]) {
          const taken = occupied.includes(seat.id);
          const chosen = selected === seat.id;
          return (
            <Pressable key={seat.id} accessibilityRole="button"
              accessibilityLabel={`Table ${seat.table}, chair ${seat.chair}, ${taken ? 'occupied' : chosen ? 'selected' : 'available'}`}
              accessibilityState={{ selected: chosen, disabled: taken }} disabled={taken}
              onPress={() => setSelected(seat.id)}
              style={[mapStyles.chair, { backgroundColor: taken ? C.yellow : chosen ? '#23CD65' : C.white }]}>
              <Text style={mapStyles.chairText}>C{seat.chair}</Text>
            </Pressable>
          );
        }
        return (
          <View key={table.table} style={mapStyles.tableCard}>
            <Text style={mapStyles.tableTitle}>Table {String(table.table).padStart(2, '0')} · {table.chairs} chairs</Text>
            <View style={mapStyles.chairRow}>{tableSeats.slice(0, half).map(renderChair)}</View>
            <View style={mapStyles.table}><Text style={mapStyles.tableText}>T{String(table.table).padStart(2, '0')}</Text></View>
            <View style={mapStyles.chairRow}>{tableSeats.slice(half).map(renderChair)}</View>
          </View>
        );
      })}
      <View style={mapStyles.legend}>
        {[{ color: C.white, label: 'Available' }, { color: C.yellow, label: 'Reserved' }, { color: '#23CD65', label: 'Selected' }].map(item => (
          <View key={item.label} style={styles.row}><View style={[mapStyles.swatch, { backgroundColor: item.color }]} /><Text style={styles.text}>{item.label}</Text></View>
        ))}
      </View>
      {selectedSeat && <Text style={styles.text}>Selected: Table {selectedSeat.table}, chair {selectedSeat.chair}</Text>}
      <Button title="Refresh availability" outline disabled={loading || !allowed} onPress={() => setRevision(value => value + 1)} />
      <Button title="Next" disabled={!selectedSeat || loading || !!error || occupied.includes(selected)} onPress={() => {
        router.push({ pathname: '/booking/seat-details', params: { date, slot, floor: String(floor), seat: selected } });
      }} />
      <Button title="Change date / reading room" outline onPress={() => router.replace('/booking/seat-availability')} />
    </Page>
  );
}

export function SeatDetailsScreen() {
  const params = useLocalSearchParams<{ date?: string; slot?: string; seat?: string }>();
  const { account, isLoading } = useAuth();
  const role = account?.role;
  const seat = SEATS.find(s => s.id === params.seat && s.role === role);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const locked = useRef(false);

  async function reserve() {
    if (!seat || !role || locked.current) return;
    locked.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await reserveSeat(seat.id, params.date ?? '', params.slot ?? '', role);
      router.replace({ pathname: '/booking/seat-confirmation', params: { id: result.id } });
    } catch (cause) { setError(errorText(cause)); }
    finally { locked.current = false; setBusy(false); }
  }

  return (
    <Page title="Selected Seat Details">
      {isLoading ? <ActivityIndicator color={C.blue} /> : seat && role ? (
        <>
          <LibraryArt />
          <View style={styles.card}>
            <Text style={styles.heading}>{roleLabel(role)} Seat {seat.label}</Text>
            <Text style={styles.text}>Floor: {seat.floor}</Text>
            <Text style={styles.text}>Table: {seat.table} · Chair: {seat.chair}</Text>
            <Text style={styles.text}>Date: {params.date}</Text>
            <Text style={styles.text}>Time: {SLOTS.find(s => s.id === params.slot)?.label}</Text>
          </View>
          <ErrorBox message={error} />
          <Button title="Reserve Seat" busy={busy} onPress={() => { void reserve(); }} />
        </>
      ) : <ErrorBox message="Select a seat from the map for your account role." />}
    </Page>
  );
}

const mapStyles = StyleSheet.create({
  tableCard: { backgroundColor: '#D4DFEF', borderRadius: 14, padding: 12, gap: 10, maxWidth: 620, width: '100%', alignSelf: 'center' },
  tableTitle: { color: C.navy, fontSize: 14, fontWeight: '700' },
  chairRow: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  chair: { flex: 1, maxWidth: 70, minHeight: 48, borderRadius: 7, borderWidth: 1, borderColor: '#8294AF', justifyContent: 'center', alignItems: 'center' },
  chairText: { color: C.navy, fontWeight: '700', fontSize: 12 },
  table: { backgroundColor: '#667B96', borderRadius: 8, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  tableText: { color: C.white, fontWeight: '700', fontSize: 15 },
  legend: { gap: 10 },
  swatch: { width: 20, height: 20, borderWidth: 1, borderColor: C.muted, borderRadius: 4 },
});
