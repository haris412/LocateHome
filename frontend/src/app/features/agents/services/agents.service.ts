import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AgentItem } from '@/core/models/agent.model';
import { environment } from '../../../../environments/environment';

// ── API shapes ────────────────────────────────────────────────────────────────

export interface AgentsApiAgent {
  _id: string;
  name: string;
  role: string;
  avatarUrl: string;
  rating: number;
  totalListings?: number;
  phone?: string;
  location?: string;
  priceRange?: string;
  specialties?: string[];
  bio?: string;
}

export interface AgentsApiResponse {
  data: {
    agents: AgentsApiAgent[];
  };
  page: number;
  totalPages: number;
  total: number;
}

// ── Public types ──────────────────────────────────────────────────────────────

export interface AgentsQueryParams {
  page?: number;
  limit?: number;
  name?: string;
  location?: string;
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

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AgentsService {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/agents`;

  getAgents(params: AgentsQueryParams = {}): Observable<AgentsResult> {
    return this.http.get<AgentsApiResponse>(this.baseUrl, {
      params: this.buildHttpParams(params)
    }).pipe(
      map(res => ({
        items:      res.data.agents.map(a => this.mapToAgentItem(a)),
        page:       res.page,
        totalPages: res.totalPages,
        total:      res.total
      })),
      catchError(() => of({ items: [], page: 1, totalPages: 0, total: 0 }))
    );
  }

  getAgentById(id: string): Observable<AgentItem | null> {
    if (!id?.trim()) return of(null);
    const url = `${this.baseUrl}/${encodeURIComponent(id.trim())}`;
    return this.http.get<{ data: AgentsApiAgent }>(url).pipe(
      map(res => this.mapToAgentItem(res.data)),
      catchError(() => of(null))
    );
  }

  private buildHttpParams(params: AgentsQueryParams): HttpParams {
    let p = new HttpParams();
    const entries: [string, string | number | undefined][] = [
      ['page',      params.page],
      ['limit',     params.limit],
      ['name',      params.name],
      ['location',  params.location],
      ['specialty', params.specialty],
      ['minRating', params.minRating],
      ['sortBy',    params.sortBy],
      ['sortOrder', params.sortOrder]
    ];
    for (const [key, value] of entries) {
      if (value !== undefined && value !== null && value !== '') {
        p = p.set(key, String(value));
      }
    }
    return p;
  }

  private mapToAgentItem(a: AgentsApiAgent): AgentItem {
    return {
      id:       a._id,
      name:     a.name,
      role:     a.role,
      avatarUrl: a.avatarUrl,
      stats: {
        rating:     a.rating,
        properties: a.totalListings,
        salesLabel: a.totalListings != null ? `${a.totalListings} listings` : undefined
      },
      contact: {
        phone:    a.phone,
        location: a.location
      },
      meta: {
        priceRange:  a.priceRange,
        tags:        a.specialties,
        description: a.bio
      }
    };
  }
}
