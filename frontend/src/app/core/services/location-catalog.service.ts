import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

import { GeoNamePlace, GeoNamesSearchResponse } from '../models/geonames.models';
import {
  OsmLocationKind,
  OsmLocationPickItem,
  OverpassElement,
  OverpassResponse
} from '../models/overpass.models';
import { environment } from '../../../environments/environment';

const GEO_FEATURE_CODES = ['PPLC', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4', 'PPL'] as const;

const PK_PROVINCE_ADMIN_CODES: Record<string, string> = {
  'punjab':             '04',
  'sindh':              '05',
  'khyber pakhtunkhwa': '03',
  'balochistan':        '02',
  'gilgit-baltistan':   '01'
};

const KIND_ORDER: Record<OsmLocationKind, number> = {
  suburb:        0,
  neighbourhood: 1,
  road:          2,
  restaurant:    3
};

@Injectable({ providedIn: 'root' })
export class LocationCatalogService {
  private readonly http = inject(HttpClient);

  readonly selectedCityPlace  = signal<GeoNamePlace | null>(null);
  readonly selectedAreaPick   = signal<OsmLocationPickItem | null>(null);
  readonly selectedProvince   = signal<string>('any');

  private readonly cityCache = new Map<string, GeoNamePlace[]>();
  private readonly areaCache = new Map<string, Observable<OsmLocationPickItem[]>>();

  private readonly geonamesSearchUrl = environment.geonames?.searchUrl ?? 'http://api.geonames.org/searchJSON';
  private readonly geonamesUsername  = environment.geonames?.username ?? 'demo';
  private readonly geonamesUserAgent = environment.geonames?.userAgent ?? 'LocateHome/1.0';
  private readonly overpassUrl       = environment.overpass?.interpreterUrl ?? 'https://overpass-api.de/api/interpreter';
  readonly         listingCountryCode = environment.listingCountryCode ?? 'PK';

  setSelectedProvince(province: string): void {
    this.selectedProvince.set(province?.toLowerCase().trim() || 'any');
  }

  setSelectedCityPlace(place: GeoNamePlace | null): void {
    const prevId = this.selectedCityPlace()?.geonameId;
    if (place === null || prevId !== place?.geonameId) {
      this.selectedAreaPick.set(null);
    }
    this.selectedCityPlace.set(place);
  }

  setSelectedAreaPick(item: OsmLocationPickItem | null): void {
    this.selectedAreaPick.set(item);
  }

  clearSelectedAreaPick(): void {
    this.selectedAreaPick.set(null);
  }

  clearSelectedCityPlace(): void {
    this.selectedCityPlace.set(null);
    this.selectedAreaPick.set(null);
  }

  loadCitiesForProvince(province: string): Observable<GeoNamePlace[]> {
    const key = province.toLowerCase().trim();
    const cached = this.cityCache.get(key);
    if (cached) return of(cached);

    const adminCode1 = PK_PROVINCE_ADMIN_CODES[key];
    const maxRows    = adminCode1 ? 300 : 100;

    return this.fetchGeoNamesCities({ adminCode1, maxRows }).pipe(
      map((places) => {
        this.cityCache.set(key, places);
        return places;
      })
    );
  }

  filterPlacesByTerm(places: readonly GeoNamePlace[], term: string, limit = 50): GeoNamePlace[] {
    const t = term.trim().toLowerCase();
    if (!t) return [...places].slice(0, limit);
    return places
      .filter((p) => {
        const name    = (p.name ?? '').toLowerCase();
        const toponym = (p.toponymName ?? '').toLowerCase();
        return name.includes(t) || toponym.includes(t);
      })
      .slice(0, limit);
  }

  matchSinglePlaceByName(places: readonly GeoNamePlace[], term: string): GeoNamePlace | null {
    const t = term.trim().toLowerCase();
    if (!t) return null;
    const exact = places.filter((p) => (p.name ?? '').toLowerCase() === t);
    return exact.length === 1 ? exact[0] : null;
  }

  getAreaSuggestionsAround(lat: number, lng: number, halfSpan = 0.16): Observable<OsmLocationPickItem[]> {
    const key = `${lat.toFixed(3)}_${lng.toFixed(3)}_${halfSpan}`;
    const cached = this.areaCache.get(key);
    if (cached) return cached;

    const bbox = this.buildBbox(lat, lng, halfSpan);

    const result$ = forkJoin({
      areas:       this.fetchOverpass(this.buildAreasQuery(bbox)),
      roads:       this.fetchOverpass(this.buildRoadsQuery(bbox)),
      restaurants: this.fetchOverpass(this.buildRestaurantsQuery(bbox))
    }).pipe(
      map(({ areas, roads, restaurants }) => this.mergeOsmPickLists(areas, roads, restaurants)),
      catchError(() => of([] as OsmLocationPickItem[])),
      // refCount:false keeps the cache alive after all subscribers unsubscribe.
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.areaCache.set(key, result$);
    return result$;
  }

  filterAreaSuggestionsByTerm(items: readonly OsmLocationPickItem[], term: string, limit = 80): OsmLocationPickItem[] {
    const t = term.trim().toLowerCase();
    if (!t) return [...items].slice(0, limit);
    return items.filter((i) => i.name.toLowerCase().includes(t)).slice(0, limit);
  }

  private fetchGeoNamesCities(options: {
    adminCode1?: string;
    maxRows?: number;
    startRow?: number;
  }): Observable<GeoNamePlace[]> {
    let params = new HttpParams()
      .set('country',      this.listingCountryCode)
      .set('featureClass', 'P')
      .set('maxRows',      String(options.maxRows ?? 100))
      .set('startRow',     String(options.startRow ?? 0))
      .set('orderby',      'population')
      .set('username',     this.geonamesUsername);

    for (const code of GEO_FEATURE_CODES) {
      params = params.append('featureCode', code);
    }

    if (options.adminCode1) {
      params = params.set('adminCode1', options.adminCode1);
    }

    const headers = new HttpHeaders({ 'User-Agent': this.geonamesUserAgent });

    return this.http
      .get<GeoNamesSearchResponse>(this.geonamesSearchUrl, { params, headers })
      .pipe(
        map((res) => {
          // GeoNames signals API errors via { status } instead of an HTTP error code.
          if (!res || res.status != null) return [];
          const g = res.geonames as GeoNamePlace[] | GeoNamePlace | undefined;
          if (g == null) return [];
          // Returns a plain object (not array) when there is exactly one result.
          return Array.isArray(g) ? g : [g];
        }),
        catchError(() => of([]))
      );
  }

  private fetchOverpass(query: string): Observable<OverpassResponse> {
    const url = `${this.overpassUrl}?data=${encodeURIComponent(query)}`;
    return this.http.get<OverpassResponse>(url).pipe(
      catchError(() => of({ elements: [] }))
    );
  }

  private buildBbox(lat: number, lng: number, halfSpan: number): string {
    return `${lat - halfSpan},${lng - halfSpan},${lat + halfSpan},${lng + halfSpan}`;
  }

  private buildAreasQuery(bbox: string): string {
    return `[out:json][timeout:25];(node["place"="suburb"](${bbox});node["place"="neighbourhood"](${bbox}););out body;`;
  }

  private buildRoadsQuery(bbox: string): string {
    return `[out:json][timeout:25];way["highway"]["name"](${bbox});out center;`;
  }

  private buildRestaurantsQuery(bbox: string): string {
    return `[out:json][timeout:25];node["amenity"="restaurant"]["name"](${bbox});out body;`;
  }

  private resolveOsmName(tags: Record<string, string>): string | null {
    // Prefers name:en over name to avoid Urdu/Arabic script in autocomplete.
    return tags['name:en']?.trim() || tags['name']?.trim() || null;
  }

  private parseAreaNode(el: OverpassElement): OsmLocationPickItem | null {
    const tags  = el.tags ?? {};
    const place = tags['place'];
    if (place !== 'suburb' && place !== 'neighbourhood') return null;
    const name = this.resolveOsmName(tags);
    if (!name || el.lat === undefined || el.lon === undefined) return null;
    return { kind: place as OsmLocationKind, name, lat: el.lat, lon: el.lon };
  }

  private parseRoadWay(el: OverpassElement): OsmLocationPickItem | null {
    const tags = el.tags ?? {};
    if (!tags['highway']) return null;
    const name = this.resolveOsmName(tags);
    const lat  = el.center?.lat;
    const lon  = el.center?.lon;
    if (!name || lat === undefined || lon === undefined) return null;
    return { kind: 'road', name, lat, lon };
  }

  private parseRestaurantNode(el: OverpassElement): OsmLocationPickItem | null {
    const tags = el.tags ?? {};
    if (tags['amenity'] !== 'restaurant') return null;
    const name = this.resolveOsmName(tags);
    if (!name || el.lat === undefined || el.lon === undefined) return null;
    return { kind: 'restaurant', name, lat: el.lat, lon: el.lon };
  }

  private mergeOsmPickLists(
    areas:       OverpassResponse,
    roads:       OverpassResponse,
    restaurants: OverpassResponse
  ): OsmLocationPickItem[] {
    const raw: OsmLocationPickItem[] = [];

    for (const el of areas.elements ?? []) {
      const item = this.parseAreaNode(el);
      if (item) raw.push(item);
    }
    for (const el of roads.elements ?? []) {
      const item = this.parseRoadWay(el);
      if (item) raw.push(item);
    }
    for (const el of restaurants.elements ?? []) {
      const item = this.parseRestaurantNode(el);
      if (item) raw.push(item);
    }

    return this.dedupeAndSort(raw);
  }

  private dedupeAndSort(items: OsmLocationPickItem[]): OsmLocationPickItem[] {
    const sorted = items.sort((a, b) => {
      const kindDiff = KIND_ORDER[a.kind] - KIND_ORDER[b.kind];
      return kindDiff !== 0 ? kindDiff : a.name.localeCompare(b.name);
    });

    const seen = new Set<string>();
    return sorted.filter((item) => {
      const key = `${item.kind}|${item.name.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
