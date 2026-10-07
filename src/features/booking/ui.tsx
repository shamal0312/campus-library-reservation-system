import { ReactNode, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, usePathname } from 'expo-router';
import { APP_DESTINATIONS } from '../../constants/booking-navigation';
import { SLOTS, today } from './model';

export const C = { background: '#E4E9F1', card: '#BCD0F2', blue: '#245DE6', navy: '#173D91', text: '#182333', muted: '#647184', green: '#A2DDB3', yellow: '#FFE15B', danger: '#DA4054', white: '#FFFFFF' };
export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, height: 64, gap: 14 },
  title: { color: C.blue, fontSize: 19, fontWeight: '700', flex: 1 },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 22, paddingBottom: 32, flexGrow: 1, gap: 18 },
  card: { backgroundColor: C.card, borderRadius: 12, padding: 18, gap: 12 },
  text: { color: C.text, fontSize: 14, lineHeight: 21 },
  heading: { color: C.text, fontSize: 21, fontWeight: '700', lineHeight: 29 },
  label: { color: C.blue, fontSize: 13, fontWeight: '600', marginBottom: 7 },
  input: { borderWidth: 1, borderColor: '#97A4B7', backgroundColor: '#F1F3F7', minHeight: 46, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 6, color: C.text, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  muted: { color: C.muted, fontSize: 12, lineHeight: 18 },
  button: { minHeight: 46, borderRadius: 12, backgroundColor: C.blue, paddingHorizontal: 20, paddingVertical: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  outline: { backgroundColor: 'transparent', borderColor: C.navy, borderWidth: 1 },
  error: { padding: 14, borderRadius: 8, backgroundColor: '#FFE5E8', color: '#9F2034', fontSize: 13, lineHeight: 20 },
  footer: { flexDirection: 'row', backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#D3DBE8', minHeight: 66, alignItems: 'center' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 9, gap: 4 },
  tabLabel: { color: C.muted, fontSize: 10 },
  overlay: { flex: 1, backgroundColor: '#14223D88', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modal: { backgroundColor: 'white', borderRadius: 16, padding: 22, width: '100%', maxWidth: 430, maxHeight: '85%', gap: 18 },
});
export function Button({ title, onPress, disabled, busy, outline = false }: { title: string; onPress: () => void; disabled?: boolean; busy?: boolean; outline?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: disabled || busy }} onPress={onPress} disabled={disabled || busy} style={({ pressed }) => [styles.button, outline && styles.outline, { opacity: disabled || busy ? 0.5 : pressed ? 0.75 : 1 }]}>
    {busy ? <ActivityIndicator color={outline ? C.blue : 'white'} /> : <Text style={[styles.buttonText, outline && { color: C.navy }]}>{title}</Text>}
  </Pressable>;
}
export function Page({ title, children, home = false, tabs = true }: { title: string; children: ReactNode; home?: boolean; tabs?: boolean }) {
  return <SafeAreaView style={styles.page} edges={['top', 'left', 'right', 'bottom']}>
    <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel={home ? 'Home' : 'Go back'} style={styles.back} onPress={() => home ? router.replace('/') : router.canGoBack() ? router.back() : router.replace('/')}><Text style={{ fontSize: 27, color: C.text }}>{home ? '⌂' : '‹'}</Text></Pressable><Text style={styles.title}>{title}</Text></View>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView></KeyboardAvoidingView>
    {tabs && <Footer />}
  </SafeAreaView>;
}
function Footer() {
  const pathname = usePathname();
  const seatActive = pathname.startsWith('/booking') &&
    !['/booking/reservations', '/booking/room-bookings', '/booking/account'].includes(pathname);
  const tabs = [
    { label: 'Home', icon: '⌂', route: APP_DESTINATIONS.home, selected: pathname === '/' },
    { label: 'Seat', icon: '▦', route: APP_DESTINATIONS.seat, selected: seatActive },
    { label: 'Book', icon: '▤', route: APP_DESTINATIONS.book, selected: typeof APP_DESTINATIONS.book === 'string' && pathname === APP_DESTINATIONS.book },
    { label: 'Profile', icon: '♙', route: APP_DESTINATIONS.profile, selected: typeof APP_DESTINATIONS.profile === 'string' && pathname === APP_DESTINATIONS.profile },
  ];
  return <View style={styles.footer}>{tabs.map(tab => <Pressable
    key={tab.label}
    accessibilityRole="button"
    accessibilityLabel={tab.route ? tab.label : `${tab.label}: awaiting team integration`}
    accessibilityState={{ selected: tab.selected, disabled: !tab.route }}
    disabled={!tab.route}
    style={[styles.tab, { opacity: tab.route ? 1 : 0.45 }]}
    onPress={() => { if (tab.route) router.replace(tab.route); }}
  >
    <Text style={{ fontSize: 22, color: tab.selected ? C.blue : C.navy }}>{tab.icon}</Text>
    <Text style={[styles.tabLabel, tab.selected && { color: C.blue, fontWeight: '700' }]}>{tab.label}</Text>
  </Pressable>)}</View>;
}
export function Field({ label, value, onChange, multiline = false, placeholder = '', maxLength, numeric = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; placeholder?: string; maxLength?: number; numeric?: boolean }) {
  return <View><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChange} style={[styles.input, multiline && { minHeight: 88, textAlignVertical: 'top' }]} placeholder={placeholder} placeholderTextColor={C.muted} multiline={multiline} maxLength={maxLength} keyboardType={numeric ? 'number-pad' : 'default'} /></View>;
}
export function Select({ label, value, choices, onSelect }: { label: string; value: string; choices: { value: string; label: string }[]; onSelect: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  return <View><Text style={styles.label}>{label}</Text><Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${value}`} style={[styles.input, styles.row, { justifyContent: 'space-between' }]} onPress={() => setOpen(true)}><Text style={styles.text}>{choices.find(c => c.value === value)?.label ?? 'Select'}</Text><Text>⌄</Text></Pressable>
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}><View style={styles.overlay}><View style={styles.modal}><Text style={styles.heading}>{label}</Text><ScrollView>{choices.map(choice => <Pressable accessibilityRole="button" key={choice.value} onPress={() => { onSelect(choice.value); setOpen(false); }} style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.background }}><Text style={[styles.text, choice.value === value && { color: C.blue, fontWeight: '700' }]}>{choice.label}</Text></Pressable>)}</ScrollView><Button title="Close" outline onPress={() => setOpen(false)} /></View></View></Modal>
  </View>;
}
export function DateField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false); const [month, setMonth] = useState(() => new Date(`${value}T12:00:00`));
  const year = month.getFullYear(); const m = month.getMonth(); const count = new Date(year, m + 1, 0).getDate(); const offset = new Date(year, m, 1).getDay();
  const maxDate = today(30);
  return <View><Text style={styles.label}>Date</Text><Pressable accessibilityRole="button" style={[styles.input, styles.row, { justifyContent: 'space-between' }]} onPress={() => { setMonth(new Date(`${value}T12:00:00`)); setOpen(true); }}><Text style={styles.text}>{new Date(`${value}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</Text><Text>▦</Text></Pressable>
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}><View style={styles.overlay}><View style={styles.modal}>
      <View style={[styles.row, { justifyContent: 'space-between' }]}><Pressable accessibilityRole="button" accessibilityLabel="Previous month" style={styles.back} onPress={() => setMonth(new Date(year, m - 1, 1))}><Text>‹</Text></Pressable><Text style={[styles.text, { fontWeight: '700' }]}>{month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</Text><Pressable accessibilityRole="button" accessibilityLabel="Next month" style={styles.back} onPress={() => setMonth(new Date(year, m + 1, 1))}><Text>›</Text></Pressable></View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{['S','M','T','W','T','F','S'].map((day, i) => <Text key={`day-${i}`} style={{ width: '14.28%', textAlign: 'center', paddingVertical: 10, color: C.muted }}>{day}</Text>)}
      {Array.from({ length: offset + count }, (_, i) => {
        const day = i - offset + 1; const date = `${year}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`; const disabled = day <= 0 || date < today() || date > maxDate;
        return <Pressable key={i} accessibilityRole="button" accessibilityLabel={date} disabled={disabled} onPress={() => { onChange(date); setOpen(false); }} style={{ width: '14.28%', minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: value === date ? C.blue : 'transparent', opacity: disabled ? 0.25 : 1 }}><Text style={{ color: value === date ? 'white' : C.text }}>{day > 0 ? day : ''}</Text></Pressable>;
      })}</View><Button title="Close" outline onPress={() => setOpen(false)} />
    </View></View></Modal>
  </View>;
}
export function TimeField({ value, onChange }: { value: string; onChange: (value: string) => void }) { return <Select label="Time" value={value} onSelect={onChange} choices={SLOTS.map(s => ({ value: s.id, label: s.label }))} />; }
export function Steps({ step }: { step: number }) { return <View style={[styles.row, { justifyContent: 'center', marginBottom: 12 }]}>{[1,2,3].map(n => <View key={n} style={styles.row}><View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: n === step ? C.blue : '#D8DDE4', borderWidth: 1, borderColor: n === step ? C.blue : C.muted, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: n === step ? 'white' : C.text }}>{n}</Text></View>{n < 3 && <Text style={{ color: C.muted }}>⟶</Text>}</View>)}</View>; }
export function LibraryArt({ room = false, small = false }: { room?: boolean; small?: boolean }) {
  return <View accessibilityLabel={room ? 'Study room illustration' : 'Reading area illustration'} style={{ backgroundColor: '#6B829A', height: small ? 75 : 145, borderRadius: 8, overflow: 'hidden', padding: 12, justifyContent: 'space-between' }}>
    <View style={{ flexDirection: 'row', gap: 8 }}>{[0,1,2].map(shelf => <View key={shelf} style={{ flex: 1, backgroundColor: '#CFE0ED', borderWidth: 3, borderColor: '#42566C', padding: 5, gap: 5 }}>{[0,1].map(row => <View key={row} style={{ flexDirection: 'row', gap: 3 }}>{[0,1,2,3,4].map(book => <View key={book} style={{ height: small ? 9 : 24, flex: 1, backgroundColor: ['#DAA252','#F0E4CA','#7296A6','#B07B70','#ABC0D0'][(book + row + shelf) % 5] }} />)}</View>)}</View>)}</View>
    {!small && <View style={{ backgroundColor: '#D2AB76', height: 19, borderRadius: 5, marginHorizontal: room ? 24 : 5 }} />}
  </View>;
}
export function SuccessMark({ room = false }: { room?: boolean }) { return <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: room ? C.card : C.green, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginVertical: 12 }}><Text style={{ color: C.navy, fontSize: 40 }}>✓</Text></View>; }
export function ErrorBox({ message }: { message: string }) { return message ? <Text accessibilityRole="alert" style={styles.error}>{message}</Text> : null; }
