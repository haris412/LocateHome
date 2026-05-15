import { Injectable, signal } from '@angular/core';

import {
  AppointmentBookingPayload,
  AppointmentOverlayData
} from '../../core/models/appointment.models';

export interface AppointmentOverlayState {
  isOpen: boolean;
  data: AppointmentOverlayData | null;
}

export interface AppointmentOverlayOpenOptions {
  onConfirmed?: (payload: AppointmentBookingPayload) => void;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentOverlayService {
  private readonly initialState: AppointmentOverlayState = {
    isOpen: false,
    data: null
  };

  private readonly _state = signal<AppointmentOverlayState>(this.initialState);
  private onConfirmed: ((payload: AppointmentBookingPayload) => void) | null = null;
  private previousBodyOverflow: string | null = null;

  readonly state = this._state.asReadonly();

  open(data: AppointmentOverlayData, options: AppointmentOverlayOpenOptions = {}): void {
    if (!this._state().isOpen) {
      this.previousBodyOverflow = document.body.style.overflow;
    }

    this.onConfirmed = options.onConfirmed ?? null;
    this._state.set({
      isOpen: true,
      data
    });
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    this._state.set(this.initialState);
    this.onConfirmed = null;
    document.body.style.overflow = this.previousBodyOverflow ?? '';
    this.previousBodyOverflow = null;
  }

  confirm(payload: AppointmentBookingPayload): void {
    this.onConfirmed?.(payload);
    this.close();
  }
}
