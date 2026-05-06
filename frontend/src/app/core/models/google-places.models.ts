export interface GooglePlaceTextMatch {
  startOffset: number;
  endOffset: number;
}

export interface GooglePlaceText {
  text: string;
  matches?: GooglePlaceTextMatch[];
}

export interface GooglePlaceStructuredFormat {
  mainText: GooglePlaceText;
  secondaryText?: GooglePlaceText;
}

export interface GooglePlacePrediction {
  place: string;
  placeId: string;
  text: GooglePlaceText;
  structuredFormat: GooglePlaceStructuredFormat;
  types: string[];
}

export interface GooglePlaceSuggestion {
  placePrediction: GooglePlacePrediction;
}

export interface GooglePlacesAutocompleteResponse {
  suggestions?: GooglePlaceSuggestion[];
}

// ── Reverse Geocoding ─────────────────────────────────────────────────────────

export interface GoogleGeocodeAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface GoogleGeocodeResult {
  address_components: GoogleGeocodeAddressComponent[];
  formatted_address: string;
  types: string[];
}

export interface GoogleGeocodeResponse {
  results: GoogleGeocodeResult[];
  status: string;
}
