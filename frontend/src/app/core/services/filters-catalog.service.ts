import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

import { FilterChipItem, FilterOption, FilterTabItem, SortOption } from '../models/filter.models';
import { environment } from '../../../environments/environment';

// ─── API shapes ──────────────────────────────────────────────────────────────

export interface PropertyCatalogSubtype {
  _id: string;
  name: string;
  slug: string;
}

export interface PropertyCatalogCategory {
  _id: string;
  name: string;
  slug: string;
  subtypes: PropertyCatalogSubtype[];
}

// ─── Price range API shapes ───────────────────────────────────────────────────

export type SupportedCurrency = 'PKR' | 'USD' | 'AED' | 'GBP' | 'SAR';

export interface PriceRangeOptions {
  options: number[];
  step: number;
}

export interface PriceRangeMode {
  min: PriceRangeOptions;
  max: PriceRangeOptions;
}

export interface PriceRangeCatalog {
  currency: SupportedCurrency;
  symbol: string;
  buy: PriceRangeMode;
  rent: PriceRangeMode;
}

interface PriceRangeApiResponse {
  success: boolean;
  data: PriceRangeCatalog;
}

// ─────────────────────────────────────────────────────────────────────────────

interface PropertyCatalogApiResponse {
  success: boolean;
  count: number;
  data: {
    categories: PropertyCatalogCategory[];
  };
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root'
})
export class FiltersCatalogService {
  private readonly http = inject(HttpClient);

  // ── Catalog state ────────────────────────────────────────────────────────

  readonly isLoading = signal(false);
  readonly hasError = signal(false);

  /** Raw API categories — populated by loadCatalog(). */
  readonly categories = signal<PropertyCatalogCategory[]>([]);

  // ── Derived options for <mat-select> ─────────────────────────────────────

  /** [Any, Homes, Plots, Commercial, …] */
  readonly propertyTypeOptions = computed<FilterOption[]>(() => [
    { id: 'any', label: 'Any' },
    ...this.categories().map((c) => ({ id: c.slug, label: c.name }))
  ]);

  // ── Static filter catalog ────────────────────────────────────────────────

  readonly listingTypeTabs: FilterTabItem[] = [
    { id: 'buy', label: 'Buy' },
    { id: 'rent', label: 'Rent' }
  ];

  readonly sortOptions: SortOption[] = [
    { id: 'newest',    label: 'Newest First' },
    { id: 'oldest',    label: 'Oldest First' },
    { id: 'price-asc', label: 'Price: Low to High' },
    { id: 'price-desc',label: 'Price: High to Low' },
    { id: 'area-asc',  label: 'Area: Small to Large' },
    { id: 'area-desc', label: 'Area: Large to Small' }
  ];

  readonly bedroomOptions: FilterOption[] = [
    { id: 'any', label: 'Any' },
    { id: '1',   label: '1' },
    { id: '2',   label: '2' },
    { id: '3',   label: '3' },
    { id: '4',   label: '4' },
    { id: '5',   label: '5' },
    { id: '6+',  label: '6+' }
  ];

  readonly bathroomOptions: FilterOption[] = [
    { id: 'any', label: 'Any' },
    { id: '1',   label: '1' },
    { id: '2',   label: '2' },
    { id: '3',   label: '3' },
    { id: '4',   label: '4' },
    { id: '5+',  label: '5+' }
  ];

  readonly amenityChips: FilterChipItem[] = [
    { id: 'parking',           label: 'Parking',           icon: 'local_parking' },
    { id: 'gym',               label: 'Gym',               icon: 'fitness_center' },
    { id: 'pool',              label: 'Swimming Pool',      icon: 'pool' },
    { id: 'garden',            label: 'Garden',            icon: 'yard' },
    { id: 'security',          label: 'Security',          icon: 'security' },
    { id: 'generator',         label: 'Generator',         icon: 'bolt' },
    { id: 'elevator',          label: 'Elevator',          icon: 'elevator' },
    { id: 'store-room',        label: 'Store Room',        icon: 'inventory_2' },
    { id: 'servant-quarters',  label: 'Servant Quarters',  icon: 'cottage' },
    { id: 'corner-plot',       label: 'Corner Plot',       icon: 'crop_square' }
  ];

  // ── Dynamic helpers ──────────────────────────────────────────────────────

  /**
   * Returns subtype options for a given category slug.
   * Pass 'any' (or nothing) to get every subtype across all categories.
   */
  getSubtypeOptions(categorySlug: string | null | undefined): FilterOption[] {
    const anyOpt: FilterOption = { id: 'any', label: 'Any' };

    if (!categorySlug || categorySlug === 'any') {
      const all = this.categories().flatMap((c) =>
        c.subtypes.map((s) => ({ id: s.slug, label: s.name }))
      );
      return [anyOpt, ...all];
    }

    const category = this.categories().find((c) => c.slug === categorySlug);
    const subtypes = category?.subtypes.map((s) => ({ id: s.slug, label: s.name })) ?? [];
    return [anyOpt, ...subtypes];
  }

  /**
   * Reverse-lookup: given a subtype slug, returns the parent category slug (or null).
   * Useful for auto-selecting the parent type when a subtype is picked directly.
   */
  categoryForSubtypeSlug(subtypeSlug: string): string | null {
    if (!subtypeSlug || subtypeSlug === 'any') return null;

    for (const category of this.categories()) {
      if (category.subtypes.some((s) => s.slug === subtypeSlug)) {
        return category.slug;
      }
    }
    return null;
  }

  /** Returns true if the slug matches a known top-level category. */
  isKnownCategorySlug(slug: string | null | undefined): boolean {
    if (!slug || slug === 'any') return false;
    return this.categories().some((c) => c.slug === slug);
  }

  /**
   * Resolves a raw URL/query value to a known subtype slug.
   * Tries exact slug match first, then falls back to a case-insensitive name match.
   * Returns null if no match is found.
   */
  resolveSubtypeSlug(value: string | null | undefined): string | null {
    if (!value || value === 'any') return null;

    for (const cat of this.categories()) {
      const bySlug = cat.subtypes.find((s) => s.slug === value);
      if (bySlug) return bySlug.slug;
    }

    const lower = value.toLowerCase();
    for (const cat of this.categories()) {
      const byName = cat.subtypes.find((s) => s.name.toLowerCase() === lower);
      if (byName) return byName.slug;
    }

    return null;
  }

  // ── Price range state ────────────────────────────────────────────────────

  readonly priceRanges    = signal<PriceRangeCatalog | null>(null);
  readonly priceRangesLoading = signal(false);
  readonly priceRangesError   = signal(false);

  /**
   * Returns the price range config for the active mode (buy/rent).
   * Returns null while loading or if the fetch failed.
   */
  getPriceRangeForMode(mode: 'buy' | 'rent'): PriceRangeMode | null {
    return this.priceRanges()?.[mode] ?? null;
  }

  // ── API fetch ────────────────────────────────────────────────────────────

  /**
   * Fetches buy/rent price ranges for the given currency.
   * Defaults to PKR. Safe to call multiple times — skips if already loaded
   * for the same currency, re-fetches when currency changes.
   */
  loadPriceRanges(currency: SupportedCurrency = 'PKR'): void {
    const current = this.priceRanges();
    if (current?.currency === currency || this.priceRangesLoading()) return;

    this.priceRangesLoading.set(true);
    this.priceRangesError.set(false);

    this.http
      .get<PriceRangeApiResponse>(`${environment.apiUrl}/api/price-ranges`, {
        params: { currency }
      })
      .pipe(
        map((res) => res.data),
        catchError(() => {
          this.priceRangesError.set(true);
          return of(null);
        })
      )
      .subscribe((data) => {
        if (data) this.priceRanges.set(data);
        this.priceRangesLoading.set(false);
      });
  }

  /** Call once on app init (or from the first component that needs it). */
  loadCatalog(): void {
    if (this.categories().length || this.isLoading()) return; // already loaded / in-flight

    this.isLoading.set(true);
    this.hasError.set(false);

    this.http
      .get<PropertyCatalogApiResponse>(`${environment.apiUrl}/api/property-catalog`)
      .pipe(
        map((res) => res.data.categories),
        catchError(() => {
          this.hasError.set(true);
          return of([] as PropertyCatalogCategory[]);
        })
      )
      .subscribe((categories) => {
        this.categories.set(categories);
        this.isLoading.set(false);
      });
  }
}
