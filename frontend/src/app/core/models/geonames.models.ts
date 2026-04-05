/** GeoNames searchJSON response (subset used by the app). */

export interface GeoNamePlace {
  geonameId: number;
  name: string;
  lat: string;
  lng: string;
  countryCode?: string;
  countryName?: string;
  adminName1?: string;
  adminName2?: string;
  population?: number;
  fcl?: string;
  fcode?: string;
  toponymName?: string;
}

export interface GeoNamesSearchResponse {
  totalResultsCount?: number;
  geonames?: GeoNamePlace[];
  status?: { message: string; value: number };
}
