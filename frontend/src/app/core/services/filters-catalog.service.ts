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
  coarseType?: string;
  subtypes: PropertyCatalogSubtype[];
}

interface ListingConfigApiResponse {
  success: boolean;
  data: {
    catalog: {
      categories: PropertyCatalogCategory[];
    };
  };
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

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class FiltersCatalogService {
  private readonly http = inject(HttpClient);

  // ── Catalog state ────────────────────────────────────────────────────────

  readonly isLoading = signal(false);
  readonly hasError  = signal(false);

  readonly categories = signal<PropertyCatalogCategory[]>([]);

  /** id = category._id (from /api/listing-config), label = display name */
  readonly propertyTypeOptions = computed<FilterOption[]>(() => [
    { id: 'any', label: 'Any' },
    ...this.categories().map(c => ({ id: c._id, label: c.name }))
  ]);

  // ── Static filter options ────────────────────────────────────────────────

  readonly listingTypeTabs: FilterTabItem[] = [
    { id: 'buy',  label: 'Buy'  },
    { id: 'rent', label: 'Rent' }
  ];

  readonly sortOptions: SortOption[] = [
    { id: 'newest',     label: 'Newest First'         },
    { id: 'oldest',     label: 'Oldest First'          },
    { id: 'price-asc',  label: 'Price: Low to High'   },
    { id: 'price-desc', label: 'Price: High to Low'   },
    { id: 'area-asc',   label: 'Area: Small to Large' },
    { id: 'area-desc',  label: 'Area: Large to Small' }
  ];

  readonly bedroomOptions: FilterOption[] = [
    { id: 'any', label: 'Any' },
    { id: '1',   label: '1'   },
    { id: '2',   label: '2'   },
    { id: '3',   label: '3'   },
    { id: '4',   label: '4'   },
    { id: '5',   label: '5'   },
    { id: '6+',  label: '6+'  }
  ];

  readonly bathroomOptions: FilterOption[] = [
    { id: 'any', label: 'Any' },
    { id: '1',   label: '1'   },
    { id: '2',   label: '2'   },
    { id: '3',   label: '3'   },
    { id: '4',   label: '4'   },
    { id: '5+',  label: '5+'  }
  ];

  readonly amenityChips: FilterChipItem[] = [
    { id: 'parking',          label: 'Parking',         icon: 'local_parking'  },
    { id: 'gym',              label: 'Gym',              icon: 'fitness_center' },
    { id: 'pool',             label: 'Swimming Pool',    icon: 'pool'           },
    { id: 'garden',           label: 'Garden',           icon: 'yard'           },
    { id: 'security',         label: 'Security',         icon: 'security'       },
    { id: 'generator',        label: 'Generator',        icon: 'bolt'           },
    { id: 'elevator',         label: 'Elevator',         icon: 'elevator'       },
    { id: 'store-room',       label: 'Store Room',       icon: 'inventory_2'    },
    { id: 'servant-quarters', label: 'Servant Quarters', icon: 'cottage'        },
    { id: 'corner-plot',      label: 'Corner Plot',      icon: 'crop_square'    }
  ];

  // ── Dynamic helpers ──────────────────────────────────────────────────────

  /** id = subtype._id, label = display name. Pass 'any'/null for every subtype across all categories. */
  getSubtypeOptions(categoryId: string | null | undefined): FilterOption[] {
    const anyOpt: FilterOption = { id: 'any', label: 'Any' };

    if (!categoryId || categoryId === 'any') {
      const all = this.categories().flatMap(c =>
        c.subtypes.map(s => ({ id: s._id, label: s.name }))
      );
      return [anyOpt, ...all];
    }

    const category = this.categories().find(c => c._id === categoryId);
    return [anyOpt, ...(category?.subtypes.map(s => ({ id: s._id, label: s.name })) ?? [])];
  }

  /** Reverse lookup: subtype._id → parent category._id. */
  categoryIdForSubtypeId(subtypeId: string): string | null {
    if (!subtypeId || subtypeId === 'any') return null;
    for (const category of this.categories()) {
      if (category.subtypes.some(s => s._id === subtypeId)) return category._id;
    }
    return null;
  }

  // ── Price range state ────────────────────────────────────────────────────

  readonly priceRanges        = signal<PriceRangeCatalog | null>(null);
  readonly priceRangesLoading = signal(false);
  readonly priceRangesError   = signal(false);

  getPriceRangeForMode(mode: 'buy' | 'rent'): PriceRangeMode | null {
    return this.priceRanges()?.[mode] ?? null;
  }

  loadPriceRanges(currency: SupportedCurrency = 'PKR'): void {
    const current = this.priceRanges();
    if (current?.currency === currency || this.priceRangesLoading()) return;

    this.priceRangesLoading.set(true);
    this.priceRangesError.set(false);

    this.http
      .get<PriceRangeApiResponse>(`${environment.apiUrl}/api/price-ranges`, { params: { currency } })
      .pipe(
        map(res => res.data),
        catchError(() => {
          this.priceRangesError.set(true);
          return of(null);
        })
      )
      .subscribe(data => {
        if (data) this.priceRanges.set(data);
        this.priceRangesLoading.set(false);
      });
  }

  // ── Catalog fetch ────────────────────────────────────────────────────────

  loadCatalog(): void {
    if (this.categories().length || this.isLoading()) return;

    this.isLoading.set(true);
    this.hasError.set(false);

    this.http
      .get<ListingConfigApiResponse>(`${environment.apiUrl}/api/listing-config`)
      .pipe(
        map(res => res.data.catalog.categories),
        catchError(() => {
          this.hasError.set(true);
          return of([] as PropertyCatalogCategory[]);
        })
      )
      .subscribe(categories => {
        this.categories.set(categories);
        this.isLoading.set(false);
      });
  }
}
