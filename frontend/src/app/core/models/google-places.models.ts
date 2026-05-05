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
