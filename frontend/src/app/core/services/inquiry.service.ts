import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { InquiryRequest, InquiryResponse } from '../models/inquiry.models';

@Injectable({ providedIn: 'root' })
export class InquiryService {
  private readonly http = inject(HttpClient);

  readonly isSubmitting = signal(false);
  readonly submitError  = signal<string | null>(null);
  readonly inquiryId    = signal<string | null>(null);

  submit(payload: InquiryRequest): Observable<InquiryResponse> {
    this.isSubmitting.set(true);
    this.submitError.set(null);
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
          this.submitError.set(this.resolveError(err));
          return EMPTY;
        })
      );
  }

  reset(): void {
    this.submitError.set(null);
    this.inquiryId.set(null);
  }

  private resolveError(err: HttpErrorResponse): string {
    switch (err.status) {
      case 400: return err.error?.errors?.[0]?.msg ?? 'Invalid submission.';
      case 404: return 'Property not found.';
      case 429: return 'Too many requests. Please try again later.';
      default:  return 'Something went wrong. Please try again.';
    }
  }
}
