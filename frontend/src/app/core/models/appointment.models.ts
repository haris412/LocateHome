export type AppointmentSlotStatus =
  | 'available'
  | 'selected'
  | 'confirmed'
  | 'booked'
  | 'blocked'
  /** Hour not returned by availability API (outside agent schedule for this day) */
  | 'not_available';

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
  /** Backend mongo property `_id` */
  propertyId: string;
  imageUrl: string;
  price: string;
  address: string;
}

export interface AppointmentOverlayData {
  agentName: string;
  /** When set, overlay loads schedule from user availability + appointments APIs */
  agentUserId?: string;
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