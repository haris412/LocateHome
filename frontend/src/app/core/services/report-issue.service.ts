import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export type IssueType = 'listing' | 'agent' | 'technical' | 'fraud' | 'other';

export interface ReportIssuePayload {
  issueType:     IssueType;
  description:   string;
  reporterName?: string;
  reporterEmail?: string;
}

export interface ReportSuccessResponse {
  success: true;
  message: string;
  data:    { id: string };
}

export interface ReportErrorResponse {
  success: false;
  message: string;
  errors?: { msg: string }[];
}

export type ReportIssueResponse = ReportSuccessResponse | ReportErrorResponse;

@Injectable({ providedIn: 'root' })
export class ReportIssueService {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/reports`;

  submit(payload: ReportIssuePayload): Observable<ReportIssueResponse> {
    return this.http.post<ReportIssueResponse>(this.baseUrl, payload);
  }
}
