import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, switchMap } from 'rxjs/operators';

import { FilterChipItem, FilterSelectConfig, FilterTabItem, SortOption } from '../../../../core/models/filter.models';
import { ListingItem } from '../../../../core/models/listing.models';
import { FiltersCatalogService } from '../../../../core/services/filters-catalog.service';
import { ListingsResultsHeaderComponent } from '../../components/listings-results-header/listings-results-header.component';
import { ListingsGridComponent } from '../../components/listings-grid/listings-grid.component';
import {
  PropertyFilterPayload,
  PropertyFiltersComponent
} from '../../../../shared/ui/property-filters/property-filters.component';
import { ListingsQueryParams, ListingsService } from '../../services/listings.service';

@Component({
  selector: 'app-listings-page',
  standalone: true,
  imports: [
    ListingsResultsHeaderComponent,
    ListingsGridComponent,
    PropertyFiltersComponent
  ],
  templateUrl: './listings-page.component.html',
  styleUrl: './listings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingsPageComponent {
  private readonly route          = inject(ActivatedRoute);
  private readonly router         = inject(Router);
  private readonly listingsService = inject(ListingsService);
  private readonly destroyRef     = inject(DestroyRef);
  private readonly filtersCatalog = inject(FiltersCatalogService);

  private readonly filtersChanged$ = new Subject<PropertyFilterPayload>();

  readonly searchQuery = signal('');

  readonly tabs: readonly FilterTabItem[] = [
    { id: 'buy', label: 'Buy' },
    { id: 'rent', label: 'Rent' }
  ];

  readonly buyFields = signal<FilterSelectConfig[]>(this.buildModeFields('buy', 'any', 'any'));
  readonly rentFields = signal<FilterSelectConfig[]>(this.buildModeFields('rent', 'any', 'any'));

  readonly buyChips = signal<FilterChipItem[]>([
    { id: 'open-house', label: 'Open house' },
    { id: 'new-projects', label: 'New projects' },
    { id: 'ready-to-move', label: 'Ready to move' },
    { id: 'video-tours', label: 'Video tours' },
    { id: 'verified', label: 'Verified listings' },
    { id: 'parking', label: 'Parking' }
  ]);

  readonly rentChips = signal<FilterChipItem[]>([
    { id: 'furnished', label: 'Furnished' },
    { id: 'pet-friendly', label: 'Pet friendly' },
    { id: 'utilities', label: 'Utilities included' },
    { id: 'available-now', label: 'Available now' },
    { id: 'video-tours', label: 'Video tours' },
    { id: 'parking', label: 'Parking' }
  ]);

  readonly listings = signal<ListingItem[]>([]);
  readonly totalResults = signal(0);
  readonly selectedCityLabel = signal('All locations');

  readonly sortOptions = signal<SortOption[]>([
    { id: 'newest', label: 'Newest' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'most-viewed', label: 'Most Viewed' }
  ]);

  readonly selectedSort = signal('newest');
  readonly selectedView = signal<'grid' | 'list'>('grid');
  readonly selectedMode = signal<'buy' | 'rent'>('buy');

  readonly selectedSortLabel = computed(() => {
    return (
      this.sortOptions().find((option) => option.id === this.selectedSort())?.label ??
      'Newest'
    );
  });

  onSearchQueryChange(value: string): void {
    this.searchQuery.set(value);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: 1,
        limit: 20,
        city: value.trim() || null,
        neighborhood: null,
        purpose: null,
        propertyType: null,
        subType: null,
        category: null,
        subtype: null,
        minPrice: null,
        maxPrice: null,
        sortBy: null,
        sortOrder: null,
        status: null
      },
      queryParamsHandling: 'merge'
    });
  }

  updateSort(value: string): void {
    this.selectedSort.set(value);
    const sort = this.toSortParams(value);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: sort,
      queryParamsHandling: 'merge'
    });
  }

  openListingDetail(id: string): void {
    this.router.navigate(['/listings', id]);
  }

  onFavoriteToggled(id: string): void {
    this.listings.update((items) =>
      items.map((item) =>
        item.id === id
          ? {
            ...item,
            favorite: !item.favorite
          }
          : item
      )
    );
  }

  constructor() {
    this.filtersCatalog.loadCatalog();

    effect(() => {
      const typeOpts = this.filtersCatalog.propertyTypeOptions();
      if (typeOpts.length <= 1) return;

      this.buyFields.update((fields) =>
        fields.map((f) => (f.id === 'primaryType' ? { ...f, options: typeOpts } : f))
      );
      this.rentFields.update((fields) =>
        fields.map((f) => (f.id === 'primaryType' ? { ...f, options: typeOpts } : f))
      );
    });

    // Any filter change → debounce 350ms → navigate.
    // Rapid filter changes collapse into one navigation, keeping the URL clean.
    this.filtersChanged$
      .pipe(debounceTime(350), takeUntilDestroyed(this.destroyRef))
      .subscribe((payload) => this.applyFiltersToQuery(payload));

    // URL params → switchMap cancels the previous in-flight API call automatically.
    this.route.queryParamMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => {
          this.syncFilterFieldsFromParams(params);
          const query = this.mapQueryParamsToRequest(params);
          this.selectedSort.set(this.fromSortParams(query.sortBy, query.sortOrder));
          this.selectedMode.set(query.purpose === 'For Rent' ? 'rent' : 'buy');

          const city = params.get('city');
          this.searchQuery.set(city ?? '');
          this.selectedCityLabel.set(city || 'All locations');

          return this.listingsService.getListings(query).pipe(
            catchError((err) => {
              console.error('Failed to load listings', err);
              return of({ items: [] as ListingItem[], page: 1, totalPages: 0, total: 0 });
            })
          );
        })
      )
      .subscribe((result) => {
        this.listings.set(result.items);
        this.totalResults.set(result.total);
      });
  }

  private mapQueryParamsToRequest(params: import('@angular/router').ParamMap): ListingsQueryParams {
    const subKey = params.get('subType') ?? params.get('subtype');
    const rawTop = params.get('propertyType') ?? params.get('category');

    let propertyTypeTop: string | undefined;
    let subTypeApi: string | undefined;

    const isCategory = (v: string | null | undefined) =>
      this.filtersCatalog.isKnownCategorySlug(v);

    if (isCategory(rawTop)) {
      propertyTypeTop = rawTop!;
    }

    if (subKey && subKey !== 'any') {
      subTypeApi = subKey; // slug IS the api value in the new catalog
      if (!propertyTypeTop) {
        const grp = this.filtersCatalog.categoryForSubtypeSlug(subKey);
        if (grp) propertyTypeTop = grp;
      }
    }

    if (rawTop && rawTop !== 'any' && !isCategory(rawTop) && (!subKey || subKey === 'any')) {
      const resolvedSlug = this.filtersCatalog.resolveSubtypeSlug(rawTop);
      if (resolvedSlug) {
        propertyTypeTop = this.filtersCatalog.categoryForSubtypeSlug(resolvedSlug) ?? undefined;
        subTypeApi = resolvedSlug;
      } else {
        subTypeApi = rawTop;
      }
    }

    if (propertyTypeTop === 'any') propertyTypeTop = undefined;

    return {
      page: this.toNumber(params.get('page')) ?? 1,
      limit: this.toNumber(params.get('limit')) ?? 20,
      purpose: (params.get('purpose') as 'For Sale' | 'For Rent' | null) ?? undefined,
      status: (params.get('status') as 'Draft' | 'Published' | null) ?? undefined,
      propertyType: propertyTypeTop,
      subType: subTypeApi,
      city: params.get('city') ?? undefined,
      neighborhood: (() => {
        const a = params.get('neighborhood');
        return a && a.trim() !== '' ? a.trim() : undefined;
      })(),
      minPrice: this.toNumber(params.get('minPrice')),
      maxPrice: this.toNumber(params.get('maxPrice')),
      sortBy: params.get('sortBy') ?? 'createdAt',
      sortOrder: (params.get('sortOrder') as 'asc' | 'desc' | null) ?? 'desc'
    };
  }

  private syncFilterFieldsFromParams(params: import('@angular/router').ParamMap): void {
    let primary = params.get('propertyType') ?? params.get('category') ?? 'any';
    let subtype = params.get('subType') ?? params.get('subtype') ?? 'any';

    if (primary !== 'any' && !this.filtersCatalog.isKnownCategorySlug(primary)) {
      const resolvedSlug = this.filtersCatalog.resolveSubtypeSlug(primary);
      if (resolvedSlug) {
        if (subtype === 'any') subtype = resolvedSlug;
        primary = this.filtersCatalog.categoryForSubtypeSlug(resolvedSlug) ?? 'any';
      }
    }

    if (!this.filtersCatalog.isKnownCategorySlug(primary) && subtype !== 'any') {
      const cat = this.filtersCatalog.categoryForSubtypeSlug(subtype);
      if (cat) primary = cat;
    }

    const areaParam = params.get('neighborhood') ?? '';
    const cityParam = params.get('city') ?? '';
    this.buyFields.update((fields) =>
      this.patchCategoryTypeFields(fields, primary, subtype, areaParam, cityParam)
    );
    this.rentFields.update((fields) =>
      this.patchCategoryTypeFields(fields, primary, subtype, areaParam, cityParam)
    );
  }

  private patchCategoryTypeFields(
    fields: FilterSelectConfig[],
    category: string,
    subtype: string,
    areaParam: string,
    cityParam: string = ''
  ): FilterSelectConfig[] {
    const typeOpts = this.filtersCatalog.propertyTypeOptions();
    const catValue = typeOpts.some((o) => o.id === category) ? category : 'any';
    const subtypeOpts = this.filtersCatalog.getSubtypeOptions(catValue);
    const subtypeValue = subtypeOpts.some((o) => o.id === subtype) ? subtype : 'any';

    return fields.map((field) => {
      if (field.id === 'primaryType') {
        return { ...field, value: catValue, options: typeOpts };
      }
      if (field.id === 'subtype') {
        return { ...field, value: subtypeValue, options: subtypeOpts };
      }
      if (field.id === 'area' && field.locationRole === 'area') {
        return { ...field, value: areaParam || '' };
      }
      if (field.id === 'city' && field.locationRole === 'city') {
        return { ...field, value: cityParam };
      }
      return field;
    });
  }

  private buildModeFields(
    mode: 'buy' | 'rent',
    category: string,
    subtype: string
  ): FilterSelectConfig[] {
    const typeOpts = this.filtersCatalog.propertyTypeOptions();
    const subtypeOpts = this.filtersCatalog.getSubtypeOptions(category);
    const subtypeValue = subtypeOpts.some((o) => o.id === subtype) ? subtype : 'any';

    const bedsDefault = mode === 'buy' ? '3plus' : '2plus';
    const bedsOptionsBuy: FilterSelectConfig['options'] = [
      { id: 'any', label: 'Any' },
      { id: '1plus', label: '1+ Beds' },
      { id: '2plus', label: '2+ Beds' },
      { id: '3plus', label: '3+ Beds' },
      { id: '4plus', label: '4+ Beds' }
    ];
    const bedsOptionsRent: FilterSelectConfig['options'] = [
      { id: 'any', label: 'Any' },
      { id: 'studio', label: 'Studio' },
      { id: '1plus', label: '1+ Beds' },
      { id: '2plus', label: '2+ Beds' },
      { id: '3plus', label: '3+ Beds' }
    ];

    const priceBuy: FilterSelectConfig = {
      id: 'price',
      label: 'Price Range',
      icon: 'monetization_on',
      placeholder: 'Price range',
      value: 'any',
      options: [
        { id: 'any', label: 'Any' },
        { id: 'low', label: 'Under $500k' },
        { id: 'mid', label: '$500k - $2.5M' },
        { id: 'high', label: '$2.5M+' }
      ]
    };

    const priceRent: FilterSelectConfig = {
      id: 'price',
      label: 'Monthly Rent',
      icon: 'payments',
      placeholder: 'Monthly rent',
      value: 'any',
      options: [
        { id: 'any', label: 'Any' },
        { id: 'low', label: 'Under $1,500' },
        { id: 'mid', label: '$1,500 - $3,500' },
        { id: 'high', label: '$3,500+' }
      ]
    };

    const shared: FilterSelectConfig[] = [
      {
        id: 'province',
        label: 'Province',
        icon: 'location_on',
        placeholder: 'Province',
        value: 'any',
        options: [
          { id: 'any',                  label: 'Any' },
          { id: 'punjab',               label: 'Punjab' },
          { id: 'sindh',                label: 'Sindh' },
          { id: 'khyber pakhtunkhwa',   label: 'Khyber Pakhtunkhwa' },
          { id: 'balochistan',          label: 'Balochistan' },
          { id: 'gilgit-baltistan',     label: 'Gilgit-Baltistan' }
        ]
      },
      {
        id: 'city',
        label: 'City',
        icon: 'location_city',
        placeholder: 'Search city',
        value: '',
        options: [],
        locationRole: 'city'
      },
      {
        id: 'area',
        label: 'Area',
        icon: 'pin_drop',
        placeholder: 'Neighbourhood, road, restaurant',
        value: '',
        options: [],
        locationRole: 'area'
      },
      {
        id: 'primaryType',
        label: 'Property type',
        icon: 'domain',
        placeholder: 'Property type',
        value: typeOpts.some((o) => o.id === category) ? category : 'any',
        options: typeOpts
      },
      {
        id: 'subtype',
        label: 'Subtype',
        icon: 'format_list_bulleted',
        placeholder: 'Subtype',
        value: subtypeValue,
        options: subtypeOpts
      },
      {
        id: 'beds',
        label: 'Bedrooms',
        icon: 'bed',
        placeholder: 'Bedrooms',
        value: bedsDefault,
        options: mode === 'buy' ? bedsOptionsBuy : bedsOptionsRent
      },
      mode === 'buy' ? priceBuy : priceRent
    ];

    return shared;
  }

  private toNumber(value: string | null): number | undefined {
    if (value === null || value === '') return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  private fromSortParams(sortBy?: string, sortOrder?: 'asc' | 'desc'): string {
    if (sortBy === 'price' && sortOrder === 'asc') return 'price-low';
    if (sortBy === 'price' && sortOrder === 'desc') return 'price-high';
    return 'newest';
  }

  private toSortParams(sortId: string): { sortBy: string; sortOrder: 'asc' | 'desc' } {
    if (sortId === 'price-low') return { sortBy: 'price', sortOrder: 'asc' };
    if (sortId === 'price-high') return { sortBy: 'price', sortOrder: 'desc' };
    return { sortBy: 'createdAt', sortOrder: 'desc' };
  }

  onFiltersChanged(payload: PropertyFilterPayload): void {
    this.filtersChanged$.next(payload);
  }

  onSearchSubmitted(payload: PropertyFilterPayload): void {
    this.filtersChanged$.next(payload);
  }

  private applyFiltersToQuery(payload: PropertyFilterPayload): void {
    const fieldValue = (id: string): string | null => {
      const field = payload.fields.find((item) => item.id === id);
      return field?.value ?? null;
    };

    const primaryType = fieldValue('primaryType');
    const subtype = fieldValue('subtype');
    const price = fieldValue('price');
    const areaRaw = fieldValue('area');
    const area =
      areaRaw && typeof areaRaw === 'string' && areaRaw.trim() !== '' ? areaRaw.trim() : null;
    const city = fieldValue('city')?.trim() || null;

    const { minPrice, maxPrice } = this.mapPriceRange(price, payload.mode);

    const queryParams: Record<string, string | number | null> = {
      page: 1,
      limit: 20,
      purpose: payload.mode === 'buy' ? 'For Sale' : 'For Rent',
      city,
      neighborhood: area,
      propertyType: !primaryType || primaryType === 'any' ? null : primaryType,
      subType: !subtype || subtype === 'any' ? null : subtype,
      category: null,
      subtype: null,
      minPrice: minPrice ?? null,
      maxPrice: maxPrice ?? null
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  private mapPriceRange(
    priceId: string | null,
    mode: 'buy' | 'rent'
  ): { minPrice?: number; maxPrice?: number } {
    if (!priceId || priceId === 'any') return {};

    if (mode === 'buy') {
      if (priceId === 'low') return { minPrice: 0, maxPrice: 500000 };
      if (priceId === 'mid') return { minPrice: 500000, maxPrice: 2500000 };
      if (priceId === 'high') return { minPrice: 2500000 };
      return {};
    }

    if (priceId === 'low') return { minPrice: 0, maxPrice: 1500 };
    if (priceId === 'mid') return { minPrice: 1500, maxPrice: 3500 };
    if (priceId === 'high') return { minPrice: 3500 };
    return {};
  }
}