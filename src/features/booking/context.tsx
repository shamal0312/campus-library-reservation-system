import { createContext, useContext, useState, ReactNode } from 'react';
import { RoomDraft, today } from './model';
interface DraftState { room: RoomDraft; setRoom: (draft: RoomDraft) => void; }
const Context = createContext<DraftState | null>(null);
export const emptyRoom = (): RoomDraft => ({ purpose: '', date: today(), slot: '09', studentIds: ['', ''], preference: 'Any available room', notes: '' });
export function BookingProvider({ children }: { children: ReactNode }) {
  const [room, setRoom] = useState<RoomDraft>(emptyRoom);
  return <Context.Provider value={{ room, setRoom }}>{children}</Context.Provider>;
}
export function useBookingDraft() { const value = useContext(Context); if (!value) throw new Error('BookingProvider is missing.'); return value; }
