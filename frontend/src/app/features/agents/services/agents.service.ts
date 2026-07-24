import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AgentItem } from '@/core/models/agent.model';
import { environment } from '../../../../environments/environment';

interface AgencyDto {
  _id: string;
  name: string;
  logoUrl?: string;
}

interface AgenciesResponse {
  data: { agencies: AgencyDto[] };
}

export interface AgentDto {
  _id: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  profileImageUrl?: string;
  phoneNumber?: string;
  email?: string;
  location?: string;
  agency?: AgencyDto;
  publishedListings: number;
  rating?: number;
  ratingCount?: number;
  description?: string;
  bio?: string;
  specialties?: string[];
  priceRange?: string;
  experienceYears?: number;
  languages?: string[];
  licenseNumber?: string;
  isVerified?: boolean;
}

export interface AgentsResponse {
  data: { agents: AgentDto[] };
  page: number;
  totalPages: number;
  total: number;
}

export interface AgentsQueryParams {
  page?: number;
  limit?: number;
  name?: string;
  location?: string;
  agencyName?: string;
  specialty?: string;
  minRating?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AgentsResult {
  items: AgentItem[];
  page: number;
  totalPages: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class AgentsService {
  private readonly http         = inject(HttpClient);
  private readonly baseUrl      = `${environment.apiUrl}/api/agents/all`;
  private readonly featuredUrl  = `${environment.apiUrl}/api/agents/featured`;
  private readonly agenciesUrl  = `${environment.apiUrl}/api/agencies`;

  getAgencies(): Observable<string[]> {
    return this.http.get<AgenciesResponse>(this.agenciesUrl).pipe(
      map(res => res.data.agencies.map(a => a.name).filter(Boolean)),
      catchError(() => of([]))
    );
  }

  getFeaturedAgents(): Observable<AgentItem[]> {
    const params = new HttpParams().set('limit', '3');
    return this.http.get<AgentsResponse>(this.featuredUrl, { params }).pipe(
      map(res => res.data.agents.map(a => this.toAgentItem(a))),
      catchError(() => of([]))
    );
  }

  getAgents(params: AgentsQueryParams = {}): Observable<AgentsResult> {
    return this.http.get<AgentsResponse>(this.baseUrl, {
      params: this.buildParams(params)
    }).pipe(
      map(res => ({
        items:      res.data.agents.map(a => this.toAgentItem(a)),
        page:       res.page,
        totalPages: res.totalPages,
        total:      res.total
      })),
      catchError(() => of({ items: [], page: 1, totalPages: 0, total: 0 }))
    );
  }

  getAgentById(id: string): Observable<AgentItem | null> {
    const trimmed = id.trim();
    if (!trimmed) return of(null);

    // The public API exposes agents as a paginated collection but does not
    // currently expose a public /:id detail route. Resolve the routed card id
    // from a sufficiently large collection page instead.
    return this.getAgents({ page: 1, limit: 100 }).pipe(
      map((result) => result.items.find((agent) => agent.id === trimmed) ?? null)
    );
  }

  private buildParams(params: AgentsQueryParams): HttpParams {
    let p = new HttpParams();
    const entries: [string, string | number | undefined][] = [
      ['page',       params.page],
      ['limit',      params.limit],
      ['name',       params.name],
      ['location',   params.location],
      ['agencyName', params.agencyName],
      ['specialty',  params.specialty],
      ['minRating',  params.minRating],
      ['sortBy',     params.sortBy],
      ['sortOrder',  params.sortOrder]
    ];
    for (const [key, value] of entries) {
      if (value !== undefined && value !== null && value !== '') {
        p = p.set(key, String(value));
      }
    }
    return p;
  }

  private toAgentItem(a: AgentDto): AgentItem {
    return {
      id:         a._id,
      name:       a.displayName ?? `${a.firstName} ${a.lastName}`.trim(),
      agencyName: a.agency?.name ?? '',
      avatarUrl:  a.profileImageUrl ?? '',
      stats: {
        rating:            a.rating,
        ratingCount:       a.ratingCount,
        publishedListings: a.publishedListings
      },
      contact: {
        phone:    a.phoneNumber,
        email:    a.email,
        location: a.location
      },
      meta: {
        description:     a.description ?? a.bio,
        tags:            a.specialties,
        priceRange:      a.priceRange,
        experienceYears: a.experienceYears,
        languages:       a.languages,
        licenseNumber:   a.licenseNumber,
        verified:        a.isVerified
      }
    };
  }
}
