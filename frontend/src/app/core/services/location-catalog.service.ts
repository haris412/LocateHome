import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  GoogleGeocodeResponse,
  GooglePlacePrediction,
  GooglePlacesAutocompleteResponse
} from '../models/google-places.models';
import { environment } from '../../../environments/environment';

const PLACES_AUTOCOMPLETE_URL  = 'https://places.googleapis.com/v1/places:autocomplete';
const GEOCODE_URL              = 'https://maps.googleapis.com/maps/api/geocode/json';
const CITY_GEOCODE_TYPES       = new Set(['locality', 'administrative_area_level_2']);

const CITY_LEVEL_TYPES = new Set([
  'locality',
  'administrative_area_level_1',
  'administrative_area_level_2'
]);

@Injectable({ providedIn: 'root' })
export class LocationCatalogService {
  private readonly http        = inject(HttpClient);
  private readonly apiKey      = environment.googleMapsKey ?? '';
  private readonly countryCode = (environment.listingCountryCode ?? 'PK').toLowerCase();

  readonly selectedCityName = signal<string | null>(null);
  readonly selectedProvince = signal<string>('any');

  setSelectedCityName(name: string | null): void {
    this.selectedCityName.set(name);
  }

  setSelectedProvince(province: string): void {
    this.selectedProvince.set(province?.toLowerCase().trim() || 'any');
  }

  searchPlaces(query: string): Observable<GooglePlacePrediction[]> {
    if (!query.trim()) return of([]);

    return this.http.post<GooglePlacesAutocompleteResponse>(
      PLACES_AUTOCOMPLETE_URL,
      { input: query },
      { headers: { 'X-Goog-Api-Key': this.apiKey } }
    ).pipe(
      map(res => res.suggestions?.map(s => s.placePrediction) ?? []),
      catchError(() => of([]))
    );
  }

  /** Reverse-geocodes a lat/lng coordinate and returns the city name, or null on failure. */
  reverseGeocode(lat: number, lng: number): Observable<string | null> {
    return this.http.get<GoogleGeocodeResponse>(GEOCODE_URL, {
      params: { latlng: `${lat},${lng}`, key: this.apiKey }
    }).pipe(
      map(res => {
        if (res.status !== 'OK') return null;
        for (const result of res.results) {
          const cityComponent = result.address_components.find(c =>
            c.types.some(t => CITY_GEOCODE_TYPES.has(t))
          );
          if (cityComponent) return cityComponent.long_name;
        }
        return null;
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Splits a prediction into city and neighborhood.
   * locality / admin-area → city = mainText, neighborhood = ''
   * sublocality / neighbourhood → city = first token of secondaryText, neighborhood = mainText
   */
  parsePlaceCityNeighborhood(pred: GooglePlacePrediction): { city: string; neighborhood: string } {
    const main      = pred.structuredFormat.mainText.text;
    const secondary = pred.structuredFormat.secondaryText?.text ?? '';
    const isCityLevel = pred.types.some(t => CITY_LEVEL_TYPES.has(t));

    if (isCityLevel) return { city: main, neighborhood: '' };

    const cityFromSecondary = secondary.split(',')[0].trim();
    return cityFromSecondary
      ? { city: cityFromSecondary, neighborhood: main }
      : { city: main, neighborhood: '' };
  }
}
