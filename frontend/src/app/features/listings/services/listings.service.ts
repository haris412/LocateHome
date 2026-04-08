import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  ListingItem,
  ListingPurpose,
  ListingStatus,
  ListingsApiProperty,
  ListingsApiResponse
} from '../../../core/models/listing.models';

export interface PropertyListMatch {
  propertyId: string;
  /** From property `userId` when present (string or populated `{ _id }`). */
  ownerUserId?: string;
}
import { environment } from '../../../../environments/environment';

export interface ListingsQueryParams {
  page?: number;
  limit?: number;
  purpose?: ListingPurpose;
  status?: ListingStatus;
  /** Top-level: homes | plots | commercial */
  propertyType?: string;
  /** Subtype filter (API value, e.g. apartment, upper portion). */
  subType?: string;
  city?: string;
  area?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ListingsResult {
  items: ListingItem[];
  page: number;
  totalPages: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class ListingsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/properties`;
  // TODO: Replace hardcoded token with real auth flow
  // ⚠️ Token expires in 3 days — regenerate via POST /api/auth/login when it does
  private readonly authToken = '';

  /**
   * Resolves Mongo `propertyId` (`_id`) from GET /api/properties with the default
   * listings query: page=1&limit=20&sortBy=createdAt&sortOrder=desc.
   * Falls back to `candidateId` if not in that page or the request fails.
   */
  /**
   * Same GET /api/properties page as `resolvePropertyMongoId`, plus owner `userId` for the
   * matching property (for appointments / availability APIs).
   */
  resolvePropertyListMatch(candidateId: string): Observable<PropertyListMatch> {
    if (!candidateId?.trim()) {
      return of({ propertyId: '' });
    }
    return this.getDefaultPropertiesPage().pipe(
      map((response) => {
        const match = response.data.properties.find((p) => p._id === candidateId);
        const propertyId = match?._id ?? candidateId;
        const ownerUserId = match ? this.ownerUserIdFromApiProperty(match) : undefined;
        return { propertyId, ownerUserId };
      }),
      catchError(() => of({ propertyId: candidateId }))
    );
  }

  resolvePropertyMongoId(candidateId: string): Observable<string> {
    return this.resolvePropertyListMatch(candidateId).pipe(map((m) => m.propertyId));
  }

  private getDefaultPropertiesPage(): Observable<ListingsApiResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authToken}`
    });
    const httpParams = new HttpParams()
      .set('page', '1')
      .set('limit', '20')
      .set('sortBy', 'createdAt')
      .set('sortOrder', 'desc');

    return this.http.get<ListingsApiResponse>(this.baseUrl, { params: httpParams, headers });
  }

  private ownerUserIdFromApiProperty(property: ListingsApiProperty): string | undefined {
    const u = property.userId;
    if (typeof u === 'string' && u.trim()) {
      return u.trim();
    }
    if (u && typeof u === 'object' && '_id' in u && typeof u._id === 'string') {
      return u._id.trim();
    }
    return undefined;
  }

  getListings(params: ListingsQueryParams = {}): Observable<ListingsResult> {
    const httpParams = this.buildHttpParams(params);
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authToken}`
    });

    return this.http.get<ListingsApiResponse>(this.baseUrl, { params: httpParams, headers }).pipe(
      // Map API response shape into UI-friendly model
      map((response) => ({
        items: response.data.properties.map((property) => this.mapToListingItem(property)),
        page: response.page,
        totalPages: response.totalPages,
        total: response.total
      }))
    );
  }

  private buildHttpParams(params: ListingsQueryParams): HttpParams {
    let httpParams = new HttpParams();

    const entries: [string, string | number | undefined][] = [
      ['page', params.page],
      ['limit', params.limit],
      ['purpose', params.purpose],
      ['status', params.status],
      ['propertyType', params.propertyType],
      ['subType', params.subType],
      ['city', params.city],
      ['area', params.area],
      ['minPrice', params.minPrice],
      ['maxPrice', params.maxPrice],
      ['sortBy', params.sortBy],
      ['sortOrder', params.sortOrder]
    ];

    for (const [key, value] of entries) {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }

    return httpParams;
  }

  private mapToListingItem(property: ListingsApiProperty): ListingItem {
    const thumbnail =
      property.images.find((img) => img.isThumbnail) ??
      property.images.sort((a, b) => a.orderIndex - b.orderIndex)[0];

    return {
      id: property._id,
      title: property.listingTitle,
      address: property.fullAddress,
      price: this.formatPrice(property.price, property.purpose),
      badge: property.purpose,
      badgeVariant: property.purpose === 'For Rent' ? 'rent' : 'sale',
      imageUrl: thumbnail?.url ?? '',
      beds: property.numBedrooms,
      baths: property.numBathrooms,
      area: `${property.areaSize} ${property.areaUnit}`,
      rent: property.purpose === 'For Rent'
    };
  }

  private formatPrice(price: number, purpose: ListingPurpose): string {
    const formatted = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0
    }).format(price);

    return purpose === 'For Rent' ? `${formatted} / mo` : formatted;
  }
}
