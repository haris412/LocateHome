import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { InquiryRequest, InquiryResponse } from '../models/inquiry.models';

@Injectable({ providedIn: 'root' })
export class InquiryService {
  private readonly http = inject(HttpClient);

  readonly isSubmitting = signal(false);
  readonly inquiryId    = signal<string | null>(null);

  submit(payload: InquiryRequest): Observable<InquiryResponse> {
    this.isSubmitting.set(true);
    this.inquiryId.set(null);

    return this.http
      .post<InquiryResponse>(`${environment.apiUrl}/api/inquiries`, payload)
      .pipe(
        tap(res => {
          this.isSubmitting.set(false);
          this.inquiryId.set(res.data.inquiryId);
        }),
        catchError((err: HttpErrorResponse) => {
          this.isSubmitting.set(false);
          return throwError(() => err);
        })
      );
  }

  reset(): void {
    this.inquiryId.set(null);
  }
}
