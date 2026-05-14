import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';

/** Body for POST /api/appointments */
export interface CreateAppointmentRequest {
  propertyId: string;
  userId: string;
  /** Calendar date at UTC midnight, e.g. 2026-04-07T00:00:00.000Z */
  date: string;
  /** Local slot time 24h, e.g. 14:00 */
  time: string;
  client: {
    name: string;
    email: string;
    phone: string;
  };
  appointmentType: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentBookingService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  getUserAvailability(userId: string): Observable<unknown> {
    const url = `${this.api}/api/users/${userId}/availability`;
    return this.http.get<unknown>(url);
  }

  getAppointmentsForUser(userId: string): Observable<unknown> {
    const url = `${this.api}/api/appointments/user/${userId}`;
    return this.http.get<unknown>(url);
  }

  /**
   * GET /api/users/:mongoUserId/name
   * Response: { success: true, data: { firstName: string, lastName: string } }
   */
  getUserProfile(userId: string): Observable<{ firstName?: string; lastName?: string }> {
    const url = `${this.api}/api/users/${userId}/name`;
    return this.http.get<unknown>(url).pipe(
      map((raw) => {
        const row = unwrapRecord(raw);
        const first = pickStr(row, 'firstName');
        const last = pickStr(row, 'lastName');
        return { firstName: first, lastName: last };
      })
    );
  }

  createAppointment(body: CreateAppointmentRequest): Observable<unknown> {
    const url = `${this.api}/api/appointments`;
    const payload = {
      propertyId: body.propertyId,
      userId: body.userId,
      date: body.date,
      time: body.time,
      client: body.client,
      appointmentType: body.appointmentType
    };
    return this.http.post<unknown>(url, payload);
  }
}

function unwrapRecord(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if ('data' in r && r['data'] && typeof r['data'] === 'object') {
    return r['data'] as Record<string, unknown>;
  }
  return r;
}

function pickStr(row: Record<string, unknown> | null, ...keys: string[]): string | undefined {
  if (!row) return undefined;
  for (const k of keys) {
    const v = row[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}
