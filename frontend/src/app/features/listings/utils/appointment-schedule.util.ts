import {
  AppointmentDateSlots,
  AppointmentSlotStatus,
  AppointmentTimeSlot
} from '../../../core/models/appointment.models';

// Kept for backward-compat with any older callers (not used by overlay anymore).
type AvHourState = { kind: 'open' | 'blocked'; note?: string };
export type AvailabilityGrid = Map<string, Map<number, AvHourState>>;

/** dateKey -> hour -> appointment overlay */
export type AppointmentHourMap = Map<
  string,
  Map<number, { status: 'confirmed' | 'booked'; note?: string }>
>;

type Weekday =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export type WeeklyAvailability = Map<
  Weekday,
  { isAvailable: boolean; startMinutes: number; endMinutes: number }
>;

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function unwrapPayload(raw: unknown): unknown {
  if (!isRecord(raw)) return raw;
  if ('data' in raw) return raw['data'];
  return raw;
}

/** Parses weekly availability returned by GET /users/:id/availability. */
export function parseWeeklyAvailabilityResponse(raw: unknown): WeeklyAvailability {
  const root = unwrapPayload(raw);

  const days: unknown[] =
    isRecord(root) && Array.isArray(root['days']) ? (root['days'] as unknown[]) : [];

  const out: WeeklyAvailability = new Map();

  for (const d of days) {
    if (!isRecord(d)) continue;
    const day = (firstString(d, ['dayOfWeek', 'weekday', 'day']) ?? '').toLowerCase() as Weekday;
    if (!isWeekday(day)) continue;
    const isAvailable = d['isAvailable'] === true;
    const startTime = firstString(d, ['startTime', 'start', 'from']) ?? '00:00';
    const endTime = firstString(d, ['endTime', 'end', 'to']) ?? '00:00';
    out.set(day, {
      isAvailable,
      startMinutes: parseTimeToMinutes(startTime),
      endMinutes: parseTimeToMinutes(endTime)
    });
  }

  return out;
}

/** Accepts several likely API shapes for /appointments/user/:id */
export function parseAppointmentsResponse(raw: unknown): AppointmentHourMap {
  const root = unwrapPayload(raw);
  const map: AppointmentHourMap = new Map();

  const list: unknown[] = Array.isArray(root)
    ? root
    : isRecord(root) && Array.isArray(root['appointments'])
      ? (root['appointments'] as unknown[])
      : isRecord(root) && Array.isArray(root['items'])
        ? (root['items'] as unknown[])
        : [];

  for (const item of list) {
    if (!isRecord(item)) continue;

    // Preferred shape (matches your API): { date: ISO string, time: "HH:mm" }
    const apiDate = firstString(item, ['date']);
    const apiTime = firstString(item, ['time']);
    let dateKey: string | null = null;
    let hour: number | null = null;

    if (apiDate && /^\d{4}-\d{2}-\d{2}/.test(apiDate)) {
      dateKey = apiDate.slice(0, 10);
      if (apiTime && /^(\d{1,2}):(\d{2})$/.test(apiTime)) {
        hour = parseInt(apiTime.split(':')[0], 10);
      }
    }

    // Fallback shapes
    if (!dateKey || hour === null) {
      const iso =
        firstString(item, [
          'startTime',
          'scheduledAt',
          'startAt',
          'dateTime',
          'datetime',
          'start'
        ]) ?? combinedDateHour(item);
      if (!iso) continue;
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) continue;
      dateKey = formatDateKeyFromDate(d);
      hour = d.getHours();
    }

    if (!dateKey || hour === null || hour < 0 || hour > 23) continue;

    const rawStatus = firstString(item, ['status', 'state', 'bookingStatus']) ?? 'booked';
    const st = normalizeApptStatus(rawStatus);
    const note = firstString(item, ['note', 'reason', 'message', 'title']);
    if (!map.has(dateKey)) map.set(dateKey, new Map());
    map.get(dateKey)!.set(hour, { status: st, note });
  }

  return map;
}

function combinedDateHour(row: Record<string, unknown>): string | undefined {
  const day = firstString(row, ['date', 'day']);
  const hour = firstNumber(row, ['hour', 'hour24', 'startHour']);
  if (!day || hour === undefined) return undefined;
  return `${day}T${`${hour}`.padStart(2, '0')}:00:00`;
}

function normalizeApptStatus(s: string): 'confirmed' | 'booked' {
  const x = s.toLowerCase();
  if (x.includes('confirm')) return 'confirmed';
  return 'booked';
}

/**
 * Builds per-day hourly slots between min..max hour seen in availability ∪ appointments.
 * - Appointment API wins: status from that booking.
 * - Else if availability lists hour as open → {@link AppointmentSlotStatus} `available`.
 * - Else if availability lists hour as blocked → `blocked`.
 * - Else hour was not returned by availability → `not_available`.
 */
export function mergeWeeklyAvailabilityAndAppointments(options: {
  weeklyAvailability: WeeklyAvailability;
  appointments: AppointmentHourMap;
  /** Dates to render as YYYY-MM-DD (typically coming from listing page) */
  dates: string[];
}): AppointmentDateSlots[] {
  const { weeklyAvailability, appointments, dates } = options;

  const uniqueDates = [...new Set(dates)].filter(isDateKey).sort();
  const out: AppointmentDateSlots[] = [];

  for (const dateKey of uniqueDates) {
    const day = weekdayFromDateKey(dateKey);
    const rule = weeklyAvailability.get(day);
    const apMap = appointments.get(dateKey);

    if (!rule && !apMap?.size) continue;

    const slots: AppointmentTimeSlot[] = [];
    // Office hours: 7:00 AM – 9:00 PM (21:00), inclusive start hours
    for (let hour = 7; hour <= 21; hour++) {
      const ap = apMap?.get(hour);
      let status: AppointmentSlotStatus;
      let note: string | undefined;

      if (ap) {
        status = ap.status === 'confirmed' ? 'confirmed' : 'booked';
        note = ap.note;
      } else if (!rule || rule.isAvailable !== true) {
        status = 'not_available';
      } else {
        status = hourWithinRange(hour, rule.startMinutes, rule.endMinutes)
          ? 'available'
          : 'not_available';
      }

      slots.push(buildSlot(dateKey, hour, status, note));
    }

    out.push({ date: dateKey, slots });
  }

  return out;
}

function buildSlot(
  dateKey: string,
  hour24: number,
  status: AppointmentSlotStatus,
  note?: string
): AppointmentTimeSlot {
  const meridiem: 'AM' | 'PM' = hour24 >= 12 ? 'PM' : 'AM';
  const h12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const label = `${h12}:00 ${meridiem}`;
  const id = `${dateKey}-${`${hour24}`.padStart(2, '0')}00`;
  return {
    id,
    label,
    hour24,
    minute: 0,
    meridiem,
    status,
    note
  };
}

function formatDateKeyFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isWeekday(v: string): v is Weekday {
  return (
    v === 'sunday' ||
    v === 'monday' ||
    v === 'tuesday' ||
    v === 'wednesday' ||
    v === 'thursday' ||
    v === 'friday' ||
    v === 'saturday'
  );
}

function isDateKey(v: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}

function weekdayFromDateKey(dateKey: string): Weekday {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const idx = dt.getDay();
  return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][
    idx
  ] as Weekday;
}

function parseTimeToMinutes(v: string): number {
  const m = v.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return 0;
  const hh = Math.min(23, Math.max(0, parseInt(m[1], 10)));
  const mm = Math.min(59, Math.max(0, parseInt(m[2], 10)));
  return hh * 60 + mm;
}

function hourWithinRange(hour24: number, startMinutes: number, endMinutes: number): boolean {
  const t = hour24 * 60;
  if (endMinutes === startMinutes) return false;
  if (endMinutes > startMinutes) return t >= startMinutes && t < endMinutes;
  return t >= startMinutes || t < endMinutes;
}

function firstString(row: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}

function firstNumber(row: Record<string, unknown>, keys: string[]): number | undefined {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === 'number' && Number.isFinite(v)) return Math.floor(v);
    if (typeof v === 'string' && /^\d+$/.test(v)) return parseInt(v, 10);
  }
  return undefined;
}
