import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  ListingItem,
  ListingPurpose,
  ListingStatus,
  ListingsApiProperty,
  ListingsApiResponse
} from '../../../core/models/listing.models';
import { environment } from '../../../../environments/environment';
import { resolvePropertyImageUrlForDisplay } from '../utils/property-image-url.util';

export interface PropertyListMatch {
  propertyId: string;
  /** From property `userId` when present (string or populated `{ _id }`). */
  ownerUserId?: string;
}

export interface ListingsQueryParams {
  page?: number;
  limit?: number;
  purpose?: ListingPurpose;
  status?: ListingStatus;
  /** Top-level: homes | plots | commercial */
  propertyType?: string;
  /** Subtype filter — must match the exact DB-stored name (e.g. "House", "Residential Plot"). */
  subtype?: string;
  locationName?: string;
  placeId?:string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  /** Listing owner/agent id, used by agent profiles. */
  userId?: string;
  /** When true, load the view-ranked hot pool instead of the organic list. */
  isHot?: boolean;
}

export interface ListingsResult {
  items: ListingItem[];
  page: number;
  totalPages: number;
  total: number;
}

const LAST_PLACE_STORAGE_KEY = 'locatehome.lastPlace';

@Injectable({
  providedIn: 'root'
})
export class ListingsService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly baseUrl = `${environment.apiUrl}/api/properties`;

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
    const httpParams = new HttpParams()
      .set('page', '1')
      .set('limit', '20')
      .set('sortBy', 'createdAt')
      .set('sortOrder', 'desc');

    return this.http.get<ListingsApiResponse>(this.baseUrl, { params: httpParams });
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

  /**
   * GET /api/properties/:id — tolerates `{ data: property }`, `{ data: { property } }`, or property at root.
   */
  getPropertyById(id: string): Observable<ListingsApiProperty | null> {
    const trimmed = id?.trim();
    if (!trimmed) {
      return of(null);
    }
    const url = `${this.baseUrl}/${encodeURIComponent(trimmed)}`;
    return this.http.get<unknown>(url).pipe(
      map((body) => this.parseSinglePropertyResponse(body)),
      catchError(() => of(null))
    );
  }

  private parseSinglePropertyResponse(body: unknown): ListingsApiProperty | null {
    if (!body || typeof body !== 'object') {
      return null;
    }
    const root = body as Record<string, unknown>;
    const data = root['data'];
    if (data && typeof data === 'object') {
      const d = data as Record<string, unknown>;
      const nested = d['property'];
      if (nested && typeof nested === 'object' && this.looksLikeApiProperty(nested)) {
        return nested as ListingsApiProperty;
      }
      if (this.looksLikeApiProperty(d)) {
        return d as unknown as ListingsApiProperty;
      }
    }
    if (this.looksLikeApiProperty(root)) {
      return root as unknown as ListingsApiProperty;
    }
    return null;
  }

  private looksLikeApiProperty(value: object): boolean {
    return '_id' in value && 'listingTitle' in value;
  }

  getListings(params: ListingsQueryParams = {}): Observable<ListingsResult> {
    if (params.isHot) {
      return this.getHotListings(params);
    }

    const httpParams = this.buildHttpParams(params);

    return this.http.get<ListingsApiResponse>(this.baseUrl, { params: httpParams }).pipe(
      // Map API response shape into UI-friendly model
      map((response) => {
        const properties = params.userId
          ? response.data.properties.filter(
              (property) => this.ownerUserIdFromApiProperty(property) === params.userId
            )
          : response.data.properties;

        return {
          items: properties.map((property) => this.mapToListingItem(property)),
          page: response.data.page,
          totalPages: response.data.totalPages ?? response.data.totalPages,
          total: response.data.total
        };
      })
    );
  }

  getHotCarousel(params: Pick<ListingsQueryParams, 'placeId' | 'purpose'>): Observable<ListingItem[]> {
    if (!params.placeId) {
      return of([]);
    }

    let httpParams = new HttpParams()
      .set('placeId', params.placeId)
      .set('limit', '6');
    if (params.purpose) {
      httpParams = httpParams.set('purpose', params.purpose);
    }

    return this.http.get<ListingsApiResponse>(`${this.baseUrl}/hot`, { params: httpParams }).pipe(
      map((response) => (response.data?.properties ?? []).map((property) => this.mapToListingItem(property))),
      catchError(() => of([]))
    );
  }

  getHotListings(params: ListingsQueryParams = {}): Observable<ListingsResult> {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('limit', String(params.limit ?? 20));

    if (params.placeId) {
      httpParams = httpParams.set('placeId', params.placeId);
    }
    if (params.purpose) {
      httpParams = httpParams.set('purpose', params.purpose);
    }

    return this.http.get<ListingsApiResponse>(`${this.baseUrl}/hot`, { params: httpParams }).pipe(
      map((response) => ({
        items: (response.data?.properties ?? []).map((property) => this.mapToListingItem(property)),
        page: response.data?.page ?? params.page ?? 1,
        totalPages: response.data?.totalPages ?? 0,
        total: response.data?.total ?? 0
      })),
      catchError(() => of({ items: [], page: 1, totalPages: 0, total: 0 }))
    );
  }

  saveLastPlace(placeId: string, locationName?: string): void {
    if (!isPlatformBrowser(this.platformId) || !placeId.trim()) return;
    sessionStorage.setItem(
      LAST_PLACE_STORAGE_KEY,
      JSON.stringify({ placeId: placeId.trim(), locationName: locationName?.trim() ?? '' })
    );
  }

  readLastPlace(): { placeId: string; locationName: string } | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const raw = sessionStorage.getItem(LAST_PLACE_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { placeId?: string; locationName?: string };
      if (!parsed?.placeId) return null;
      return { placeId: parsed.placeId, locationName: parsed.locationName ?? '' };
    } catch {
      return null;
    }
  }

  getSimilarListings(
    property: ListingsApiProperty,
    limit = 8
  ): Observable<ListingItem[]> {
    return this.getListings({
      page: 1,
      limit: limit + 1,
      purpose: property.purpose,
      status: 'Published',
      subtype: property.subtype || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }).pipe(
      map((result) =>
        result.items
          .filter((item) => item.id !== property._id)
          .slice(0, limit)
      ),
      catchError(() => of([]))
    );
  }

  private buildHttpParams(params: ListingsQueryParams): HttpParams {
    let httpParams = new HttpParams();

    const entries: [string, string | number | undefined][] = [
      ['page', params.page],
      ['limit', params.limit],
      ['purpose', params.purpose],
      ['status', params.status],
      ['placeId', params.placeId],
      ['propertyType', params.propertyType],
      ['subtype', params.subtype],
      ['locationName', params.locationName],
      ['minPrice', params.minPrice],
      ['maxPrice', params.maxPrice],
      ['sortBy', params.sortBy],
      ['sortOrder', params.sortOrder],
      ['userId', params.userId]
    ];

    for (const [key, value] of entries) {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }

    return httpParams;
  }

  private mapToListingItem(property: ListingsApiProperty): ListingItem {
    const images = property.images ?? [];
    const thumbnail =
      images.find((img) => img.isThumbnail) ??
      [...images].sort((a, b) => a.orderIndex - b.orderIndex)[0];

    const badge = this.getPromotionalBadge(property);

    return {
      id: property._id,
      title: property.listingTitle,
      address: property.fullAddress,
      price: this.formatPrice(property.price, property.purpose),
      badge: badge?.label,
      badgeVariant: badge?.variant,
      imageUrl: resolvePropertyImageUrlForDisplay(thumbnail?.url ?? ''),
      beds: property.numBedrooms,
      baths: property.numBathrooms,
      area: `${property.areaSize} ${property.areaUnit}`,
      rent: property.purpose === 'For Rent'
    };
  }

  private getPromotionalBadge(
    property: ListingsApiProperty
  ): { label: string; variant: 'featured' | 'hot' } | undefined {
    if (property.isFeatured) {
      return { label: 'Featured', variant: 'featured' };
    }

    if (property.isHot) {
      return { label: 'Hot', variant: 'hot' };
    }

    return undefined;
  }

  private formatPrice(price: number, purpose: ListingPurpose): string {
    const formatted = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0
    }).format(price);

    return purpose === 'For Rent' ? `${formatted} / mo` : formatted;
  }
}
