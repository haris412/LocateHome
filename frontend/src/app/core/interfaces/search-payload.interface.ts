export interface SearchPayload {
  mode: SearchMode;
  keyword: string;
  /** Top-level property type slug: homes | plots | commercial | any */
  primaryType: string;
  /** Subtype slug (kebab-case) or 'any' */
  subtype: string;
  locationName: string;
  minPrice: number | null;
  maxPrice: number | null;
  bedrooms: string;
  bathrooms: string;
  size: string;
}

export type SearchMode = 'buy' | 'rent' | 'sell';
