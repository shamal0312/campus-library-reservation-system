export type SeatRole = 'student' | 'lecturer';

export interface Seat {
  id: string;
  label: string;
  floor: number;
  table: number;
  chair: number;
  role: SeatRole;
  charging: boolean;
}

export interface ReadingTable {
  floor: number;
  table: number;
  role: SeatRole;
  chairs: number;
}

export const FLOORS = [1, 2, 3];
const pad = (value: number) => String(value).padStart(2, '0');

// Array entry = chair count at that numbered table.
const COUNTS: Record<SeatRole, Record<number, number[]>> = {
  student: {
    1: Array(20).fill(8),
    2: [...Array(12).fill(3), ...Array(8).fill(8)],
    3: [...Array(3).fill(5), ...Array(10).fill(10)],
  },
  lecturer: {
    1: Array(2).fill(8),
    2: Array(2).fill(8),
  },
};

export const TABLES: ReadingTable[] = (['student', 'lecturer'] as SeatRole[])
  .flatMap(role => FLOORS.flatMap(floor =>
    (COUNTS[role][floor] ?? []).map((chairs, index) => ({
      role, floor, table: index + 1, chairs,
    })),
  ));

export const SEATS: Seat[] = (['student', 'lecturer'] as SeatRole[])
  .flatMap(role => FLOORS.flatMap(floor => {
    let ordinal = 0;
    return TABLES.filter(t => t.role === role && t.floor === floor).flatMap(t =>
      Array.from({ length: t.chairs }, (_, index) => {
        ordinal += 1;
        const chair = index + 1;
        const prefix = role === 'student' ? 'S' : 'L';
        const label = `${prefix}-T${pad(t.table)}-C${pad(chair)}`;
        // Retain the original 20 student IDs per floor so existing bookings
        // still block the corresponding seat instead of being duplicated.
        const legacy = role === 'student' && ordinal <= 20;
        const id = legacy
          ? `F${floor}-${ordinal <= 10 ? 'A' : 'B'}${ordinal <= 10 ? ordinal : ordinal - 10}`
          : `F${floor}-${label}`;
        return { id, label, floor, table: t.table, chair, role,
          charging: legacy && ordinal % 2 === 0 };
      }),
    );
  }));

export function floorsForRole(role: SeatRole): number[] {
  return FLOORS.filter(floor => (COUNTS[role][floor]?.length ?? 0) > 0);
}

export function tablesForRole(floor: number, role: SeatRole): ReadingTable[] {
  return TABLES.filter(t => t.floor === floor && t.role === role);
}

export function seatsForRole(floor: number, role: SeatRole): Seat[] {
  return SEATS.filter(s => s.floor === floor && s.role === role);
}
