/** Overpass API interpreter JSON (subset). */

export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export interface OverpassResponse {
  elements?: OverpassElement[];
  remark?: string;
}

export type OsmLocationKind = 'suburb' | 'neighbourhood' | 'road' | 'restaurant';

export interface OsmLocationPickItem {
  kind: OsmLocationKind;
  name: string;
  lat: number;
  lon: number;
  mapLink?: string;
}
