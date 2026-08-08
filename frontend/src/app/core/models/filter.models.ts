export type FilterMode = 'buy' | 'rent';

export interface FilterTabItem {
  id: FilterMode;
  label: string;
}

export interface FilterOption {
  id: string;
  label: string;
}

export interface FilterSelectConfig {
  id: string;
  label: string;
  icon?: string;
  placeholder: string;
  value: string | null;
  options: FilterOption[];
  /** When set, filter-select renders GeoNames / Overpass widgets instead of mat-select. */
  locationRole?: 'city' | 'area';
}

export interface FilterChipItem {
  id: string;
  label: string;
  icon?: string;
  selected?: boolean;
}

export interface SortOption {
  id: string;
  label: string;
}

export interface MoreFiltersFormValue {
  currency: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  bathrooms: string;
  purpose: string;
  furnishing: string;
  amenity: string;
  feature: string;
  verifiedOnly: boolean;
  withPhotos: boolean;
}

export interface MoreFiltersOverlayData {
  filters: MoreFiltersFormValue;
  chips: FilterChipItem[];
  selectedChipIds: string[];
}

export interface MoreFiltersOverlayResult {
  filters: MoreFiltersFormValue;
  selectedChipIds: string[];
}

export const EMPTY_MORE_FILTERS: MoreFiltersFormValue = {
  currency: 'PKR',
  minPrice: '',
  maxPrice: '',
  minArea: '',
  maxArea: '',
  bathrooms: 'any',
  purpose: 'any',
  furnishing: 'any',
  amenity: '',
  feature: '',
  verifiedOnly: false,
  withPhotos: false
};
