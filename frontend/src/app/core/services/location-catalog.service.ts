import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { GeoNamePlace, GeoNamesSearchResponse } from '../models/geonames.models';
import {
  OsmLocationKind,
  OsmLocationPickItem,
  OverpassElement,
  OverpassResponse
} from '../models/overpass.models';
import { environment } from '../../../environments/environment';

const GEO_FEATURE_CODES = [
  'PPLC',
  'PPLA',
  'PPLA2',
  'PPLA3',
  'PPLA4',
  'PPL'
] as const;

const KIND_ORDER: Record<OsmLocationKind, number> = {
  suburb: 0,
  neighbourhood: 1,
  road: 2,
  restaurant: 3
};

@Injectable({
  providedIn: 'root'
})
export class LocationCatalogService {
  private readonly http = inject(HttpClient);

  /** Last city chosen from autocomplete (or single debounced match) — drives area suggestions. */
  readonly selectedCityPlace = signal<GeoNamePlace | null>(null);

  /** Last suburb / neighbourhood / road / restaurant pick for the current city. */
  readonly selectedAreaPick = signal<OsmLocationPickItem | null>(null);

  private readonly mergedCache = new Map<string, OsmLocationPickItem[]>();

  private get geonamesSearchUrl(): string {
    return environment.geonames?.searchUrl ?? 'http://api.geonames.org/searchJSON';
  }

  private get geonamesUsername(): string {
    return environment.geonames?.username ?? 'demo';
  }

  private get geonamesUserAgent(): string {
    return environment.geonames?.userAgent ?? 'LocateHome/1.0';
  }

  private get overpassInterpreterUrl(): string {
    return environment.overpass?.interpreterUrl ?? 'https://overpass-api.de/api/interpreter';
  }

  get listingCountryCode(): string {
    return environment.listingCountryCode ?? 'PK';
  }

  setSelectedCityPlace(place: GeoNamePlace | null): void {
    const prevId = this.selectedCityPlace()?.geonameId;
    const nextId = place?.geonameId;
    if (place === null) {
      this.selectedAreaPick.set(null);
    } else if (prevId !== nextId) {
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

  getPopulatedPlaces(options: {
    countryCode: string;
    maxRows?: number;
    startRow?: number;
  }): Observable<GeoNamePlace[]> {
    let params = new HttpParams()
      .set('country', options.countryCode)
      .set('featureClass', 'P')
      .set('maxRows', String(options.maxRows ?? 1000))
      .set('startRow', String(options.startRow ?? 0))
      .set('orderby', 'population')
      .set('username', this.geonamesUsername);

    for (const code of GEO_FEATURE_CODES) {
      params = params.append('featureCode', code);
    }

    const parseGeonames = (res: GeoNamesSearchResponse | null | undefined): GeoNamePlace[] => {
      if (!res || res.status != null) {
        return [];
      }
      const g = res.geonames as GeoNamePlace[] | GeoNamePlace | undefined;
      if (g == null) {
        return [];
      }
      // GeoNames returns one object when there is a single hit, not a one-element array.
      return Array.isArray(g) ? g : [g];
    };

    const headers = new HttpHeaders({
      'User-Agent': this.geonamesUserAgent
    });

    return this.http
      .get<GeoNamesSearchResponse>(this.geonamesSearchUrl, { params, headers })
      .pipe(map(parseGeonames), catchError(() => of([])));
  }

  filterPlacesByTerm(places: readonly GeoNamePlace[], term: string, limit = 50): GeoNamePlace[] {
    const t = term.trim().toLowerCase();
    if (!t) return [...places].slice(0, limit);
    return places
      .filter((p) => {
        const name = (p.name ?? '').toLowerCase();
        const top = (p.toponymName ?? '').toLowerCase();
        return name.includes(t) || top.includes(t);
      })
      .slice(0, limit);
  }

  /** If exactly one place matches the term (case-insensitive name), return it. */
  matchSinglePlaceByName(places: readonly GeoNamePlace[], term: string): GeoNamePlace | null {
    const t = term.trim().toLowerCase();
    if (!t) return null;
    const exact = places.filter((p) => (p.name ?? '').toLowerCase() === t);
    if (exact.length === 1) return exact[0];
    return null;
  }

  executeOverpass(ql: string): Observable<OverpassResponse> {
    const url = `${this.overpassInterpreterUrl}?data=${encodeURIComponent(ql)}`;
    return this.http.get<OverpassResponse>(url).pipe(catchError(() => of({ elements: [] })));
  }

  private buildBbox(lat: number, lng: number, halfSpan: number): string {
    const south = lat - halfSpan;
    const north = lat + halfSpan;
    const west = lng - halfSpan;
    const east = lng + halfSpan;
    return `${south},${west},${north},${east}`;
  }

  getSuburbsAndNeighbourhoodsAround(lat: number, lng: number, halfSpan = 0.16): Observable<OverpassResponse> {
    const bbox = this.buildBbox(lat, lng, halfSpan);
    const ql = `[out:json][timeout:25];(node["place"="suburb"](${bbox});node["place"="neighbourhood"](${bbox}););out body;`;
    return this.executeOverpass(ql);
  }

  getRestaurantsAround(lat: number, lng: number, halfSpan = 0.16): Observable<OverpassResponse> {
    const bbox = this.buildBbox(lat, lng, halfSpan);
    const ql = `[out:json][timeout:25];node["amenity"="restaurant"](${bbox});out body;`;
    return this.executeOverpass(ql);
  }

  getNamedRoadsAround(lat: number, lng: number, halfSpan = 0.16): Observable<OverpassResponse> {
    const bbox = this.buildBbox(lat, lng, halfSpan);
    const ql = `[out:json][timeout:25];way["highway"]["name"](${bbox});out center;`;
    return this.executeOverpass(ql);
  }

  getMergedLocationSuggestionsAround(options: {
    lat: number;
    lng: number;
    halfSpan?: number;
  }): Observable<OsmLocationPickItem[]> {
    const { lat, lng, halfSpan = 0.16 } = options;
    const cacheKey = `${Math.round(lat * 1000)}_${Math.round(lng * 1000)}_${halfSpan}`;
    const cached = this.mergedCache.get(cacheKey);
    if (cached) return of(cached);

    return forkJoin({
      sn: this.getSuburbsAndNeighbourhoodsAround(lat, lng, halfSpan),
      restaurants: this.getRestaurantsAround(lat, lng, halfSpan),
      roads: this.getNamedRoadsAround(lat, lng, halfSpan)
    }).pipe(
      map(({ sn, restaurants, roads }) => {
        const items: OsmLocationPickItem[] = [];
        for (const el of sn.elements ?? []) {
          const item = this.nodeSuburbOrNeighbourhood(el);
          if (item) items.push(item);
        }
        for (const el of restaurants.elements ?? []) {
          const item = this.nodeRestaurant(el);
          if (item) items.push(item);
        }
        for (const el of roads.elements ?? []) {
          const item = this.wayToRoadPickItem(el);
          if (item) items.push(item);
        }
        const sorted = items.sort((a, b) => {
          const o = KIND_ORDER[a.kind] - KIND_ORDER[b.kind];
          if (o !== 0) return o;
          return a.name.localeCompare(b.name);
        });
        const deduped = this.dedupePickItems(sorted);
        this.mergedCache.set(cacheKey, deduped);
        return deduped;
      }),
      catchError(() => of([]))
    );
  }

  filterAreaSuggestionsByTerm(
    items: readonly OsmLocationPickItem[],
    term: string,
    limit = 80
  ): OsmLocationPickItem[] {
    const t = term.trim().toLowerCase();
    if (!t) return [...items].slice(0, limit);
    return items.filter((i) => i.name.toLowerCase().includes(t)).slice(0, limit);
  }

  private nodeSuburbOrNeighbourhood(el: OverpassElement): OsmLocationPickItem | null {
    const tags = el.tags ?? {};
    const p = tags['place'];
    if (p !== 'suburb' && p !== 'neighbourhood') return null;
    const name = tags['name']?.trim();
    if (!name) return null;
    const lat = el.lat;
    const lon = el.lon;
    if (lat === undefined || lon === undefined) return null;
    return {
      kind: p,
      name,
      lat,
      lon,
      mapLink: this.osmMapLink(lat, lon)
    };
  }

  private nodeRestaurant(el: OverpassElement): OsmLocationPickItem | null {
    const tags = el.tags ?? {};
    if (tags['amenity'] !== 'restaurant') return null;
    const name = tags['name']?.trim();
    if (!name) return null;
    const lat = el.lat;
    const lon = el.lon;
    if (lat === undefined || lon === undefined) return null;
    return {
      kind: 'restaurant',
      name,
      lat,
      lon,
      mapLink: this.osmMapLink(lat, lon)
    };
  }

  private wayToRoadPickItem(el: OverpassElement): OsmLocationPickItem | null {
    const tags = el.tags ?? {};
    const name = tags['name']?.trim();
    if (!name || !tags['highway']) return null;
    const lat = el.center?.lat;
    const lon = el.center?.lon;
    if (lat === undefined || lon === undefined) return null;
    return {
      kind: 'road',
      name,
      lat,
      lon,
      mapLink: this.osmMapLink(lat, lon)
    };
  }

  private osmMapLink(lat: number, lon: number): string {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`;
  }

  private dedupePickItems(items: OsmLocationPickItem[]): OsmLocationPickItem[] {
    const seen = new Set<string>();
    const out: OsmLocationPickItem[] = [];
    for (const i of items) {
      const key = `${i.kind}|${i.name.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(i);
    }
    return out;
  }
}
