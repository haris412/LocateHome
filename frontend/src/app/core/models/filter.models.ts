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