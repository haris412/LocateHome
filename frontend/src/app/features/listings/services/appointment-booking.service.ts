import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';

// TODO: Replace hardcoded token with real auth flow (align with ListingsService)
const AUTH_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWQwMWM1MjgxMGJhZGEyM2ViOTdmZTUiLCJlbWFpbCI6ImJpbGFsQG1haWwuY29tIiwiaWF0IjoxNzc1MjQ2NDIyLCJleHAiOjE3NzU1MDU2MjJ9.wlRGFBanb8vkx6MRJGM1hOU__x7oSX3YQd8FXLQQFAY';

function authHeaders(): HttpHeaders {
  return new HttpHeaders({ Authorization: `Bearer ${AUTH_TOKEN}` });
}

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
    return this.http.get<unknown>(url, { headers: authHeaders() });
  }

  getAppointmentsForUser(userId: string): Observable<unknown> {
    const url = `${this.api}/api/appointments/user/${userId}`;
    return this.http.get<unknown>(url, { headers: authHeaders() });
  }

  getUserProfile(userId: string): Observable<{ firstname?: string; lastname?: string }> {
    const url = `${this.api}/api/users/${userId}`;
    return this.http.get<unknown>(url, { headers: authHeaders() }).pipe(
      map((raw) => {
        const row = unwrapRecord(raw);
        const first =
          pickStr(row, 'firstname', 'firstName', 'first_name') ??
          pickStr(unwrapRecord(row?.['user']), 'firstname', 'firstName', 'first_name');
        const last =
          pickStr(row, 'lastname', 'lastName', 'last_name') ??
          pickStr(unwrapRecord(row?.['user']), 'lastname', 'lastName', 'last_name');
        return { firstname: first, lastname: last };
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
    return this.http.post<unknown>(url, payload, { headers: authHeaders() });
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
