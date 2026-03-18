export type AppointmentSlotStatus =
  | 'available'
  | 'selected'
  | 'confirmed'
  | 'booked'
  | 'blocked';

export interface AppointmentTimeSlot {
  id: string;
  label: string;
  hour24: number;
  minute: number;
  meridiem: 'AM' | 'PM';
  status: AppointmentSlotStatus;
  note?: string;
}

export interface AppointmentDateSlots {
  date: string; // YYYY-MM-DD
  slots: AppointmentTimeSlot[];
}

export interface AppointmentListingSummary {
  id: string;
  imageUrl: string;
  price: string;
  address: string;
}

export interface AppointmentOverlayData {
  agentName: string;
  listing: AppointmentListingSummary;
  dateSlots: AppointmentDateSlots[];
  initialName?: string;
  initialEmail?: string;
  initialPhone?: string;
}

export interface AppointmentBookingPayload {
  listingId: string;
  agentName: string;
  date: string;
  slotId: string;
  slotLabel: string;
  name: string;
  email: string;
  phone: string;
}