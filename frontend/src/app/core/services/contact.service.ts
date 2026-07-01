import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface ContactPayload {
  name:    string;
  phone:   string;
  email:   string;
  message: string;
}

export interface ContactSuccessResponse {
  success: true;
  message: string;
  data:    { id: string };
}

export interface ContactErrorResponse {
  success: false;
  errors:  string[];
}

export type ContactResponse = ContactSuccessResponse | ContactErrorResponse;

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/contact`;

  send(payload: ContactPayload): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(this.baseUrl, payload);
  }
}
