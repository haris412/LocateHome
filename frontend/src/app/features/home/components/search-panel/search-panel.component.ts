import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  computed,
  inject,
  signal,
  EventEmitter,
  Output
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map, share, skip, switchMap, tap } from 'rxjs/operators';
import { of, startWith } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';

import { PriceRangeFieldComponent, PriceRange } from '../../../../shared/ui/price-range-field/price-range-field.component';
import { FilterOption } from '../../../../core/models/filter.models';
import { GeoNamePlace } from '../../../../core/models/geonames.models';
import { OsmLocationPickItem } from '../../../../core/models/overpass.models';
import { LocationCatalogService } from '../../../../core/services/location-catalog.service';
import { FiltersCatalogService } from '../../../../core/services/filters-catalog.service';
import {
  SpeechRecognitionConstructor,
  SpeechRecognitionErrorLike,
  SpeechRecognitionEventLike,
  SpeechRecognitionLike
} from './speech-recognition.types';

// ─── Public types ─────────────────────────────────────────────────────────────

export type SearchMode = 'buy' | 'rent';

export interface SearchPanelSearchPayload {
  mode: SearchMode;
  keyword: string;
  /** Top-level property type slug: homes | plots | commercial | any */
  primaryType: string;
  /** Subtype slug (kebab-case) or 'any' */
  subtype: string;
  city: string;
  area: string;
  minPrice: number | null;
  maxPrice: number | null;
  bedrooms: string;
  bathrooms: string;
  size: string;
}

// ─── Private types ────────────────────────────────────────────────────────────

interface SearchTab {
  id: SearchMode;
  label: string;
}

interface QuickChip {
  id: string;
  label: string;
  icon?: string;
  active?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-search-panel',
  imports: [
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatSelectModule,
    ReactiveFormsModule,
    PriceRangeFieldComponent
  ],
  templateUrl: './search-panel.component.html',
  styleUrl: './search-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchPanelComponent {
  private readonly platformId    = inject(PLATFORM_ID);
  private readonly locationCatalog = inject(LocationCatalogService);
  private readonly filtersCatalog  = inject(FiltersCatalogService);

  @Output() readonly search = new EventEmitter<SearchPanelSearchPayload>();

  // ── Tab / mode ──────────────────────────────────────────────────────────

  readonly tabs: readonly SearchTab[] = [
    { id: 'buy', label: 'Buy' },
    { id: 'rent', label: 'Rent' }
  ];

  readonly activeTab = signal<SearchMode>('buy');

  // ── Location state ──────────────────────────────────────────────────────

  readonly province = signal('any');
  readonly city     = signal('Any');
  readonly area     = signal('Any');

  readonly cityControl = new FormControl<string | GeoNamePlace>('', { nonNullable: true });
  readonly areaControl = new FormControl<string | OsmLocationPickItem>('', { nonNullable: true });

  /** All cities for the selected province — loaded from GeoNames. */
  readonly allGeoPlaces = signal<GeoNamePlace[]>([]);

  /** Area suggestions for the selected city — loaded from Overpass. */
  readonly areaSuggestions = signal<OsmLocationPickItem[]>([]);

  private readonly cityQueryText = signal('');
  private readonly areaQueryText = signal('');

  readonly filteredCities = computed(() =>
    this.locationCatalog.filterPlacesByTerm(this.allGeoPlaces(), this.cityQueryText())
  );

  readonly filteredAreas = computed(() =>
    this.locationCatalog.filterAreaSuggestionsByTerm(this.areaSuggestions(), this.areaQueryText())
  );

  // ── Filter state ────────────────────────────────────────────────────────

  readonly primaryType = signal('any');
  readonly subtype     = signal('any');
  readonly keyword     = signal('');
  readonly priceRange  = signal<PriceRange>({ min: null, max: null });
  readonly bedrooms    = signal('Any');
  readonly bathrooms   = signal('Any');
  readonly size        = signal('1,000+ sqft');

  // ── Static options ──────────────────────────────────────────────────────

  readonly provinceOptions = [
    'Any',
    'Punjab',
    'Sindh',
    'Khyber Pakhtunkhwa',
    'Balochistan',
    'Gilgit-Baltistan'
  ];

  readonly propertyTypeOptions = this.filtersCatalog.propertyTypeOptions;

  readonly subtypeOptions = computed<readonly FilterOption[]>(() =>
    this.filtersCatalog.getSubtypeOptions(this.primaryType())
  );

  readonly bedroomOptions  = ['Any', '1+', '2+', '3+', '4+'];
  readonly bathroomOptions = ['Any', '1+', '2+', '3+'];
  readonly sizeOptions     = ['Any', '500+ sqft', '1,000+ sqft', '2,000+ sqft'];

  // ── Quick-filter chips ──────────────────────────────────────────────────

  readonly quickChips = signal<QuickChip[]>([
    { id: 'voice-enabled',    label: 'Voice enabled search', icon: 'graphic_eq', active: false },
    { id: 'new-projects',     label: 'New projects',         icon: 'auto_awesome' },
    { id: 'ready-to-move',    label: 'Ready to move' },
    { id: 'pet-friendly',     label: 'Pet friendly' },
    { id: 'parking',          label: 'Parking' },
    { id: 'video-tours',      label: 'Video tours' },
    { id: 'verified-listings',label: 'Verified listings' }
  ]);

  readonly showMoreFilters = signal(false);

  // ── Voice search ────────────────────────────────────────────────────────

  readonly isListening  = signal(false);
  readonly micSupported = signal(false);
  readonly micError     = signal('');
  readonly voiceHint    = computed(() =>
    this.isListening() ? 'Listening… speak now' : 'Tap to speak'
  );

  private recognition: SpeechRecognitionLike | null = null;

  // ── Display helpers (passed to [displayWith]) ───────────────────────────

  readonly displayCity = (v: GeoNamePlace | string | null): string =>
    v == null || typeof v === 'string' ? (v ?? '') : v.name;

  readonly displayArea = (v: OsmLocationPickItem | string | null): string =>
    v == null || typeof v === 'string' ? (v ?? '') : v.name;

  // ── Track-by helpers ────────────────────────────────────────────────────

  readonly trackGeoPlace = (_: number, p: GeoNamePlace): number => p.geonameId;
  readonly trackAreaItem  = (_: number, a: OsmLocationPickItem): string =>
    `${a.kind}-${a.name}-${a.lat}-${a.lon}`;

  // ─────────────────────────────────────────────────────────────────────────

  constructor() {
    this.filtersCatalog.loadCatalog();
    this.filtersCatalog.loadPriceRanges();
    this.setupSpeechRecognition();
    this.wireCityControl();
    this.wireAreaControl();
    this.wireProvinceCityLoader();
    this.wireAreaSuggestions();
  }

  // ── Wiring ───────────────────────────────────────────────────────────────

  /**
   * Reloads the city list whenever the province changes.
   * A shared observable is used so that skip(1) and switchMap
   * both operate on the same underlying signal emission.
   */
  private wireProvinceCityLoader(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const province$ = toObservable(this.province).pipe(
      share(),
      takeUntilDestroyed()
    );

    // Clear city/area on subsequent province changes (not the initial emission).
    province$.pipe(skip(1)).subscribe(() => this.clearCityAndArea());

    // switchMap cancels any in-flight request when the province changes again.
    province$
      .pipe(switchMap((province) => this.locationCatalog.loadCitiesForProvince(province)))
      .subscribe((places) => this.allGeoPlaces.set(places));
  }

  /** Loads area suggestions whenever the selected city changes. */
  private wireAreaSuggestions(): void {
    toObservable(this.locationCatalog.selectedCityPlace)
      .pipe(
        tap((place) => { if (!place) this.areaSuggestions.set([]); }),
        switchMap((place) => {
          if (!place) return of([] as OsmLocationPickItem[]);
          const lat = parseFloat(place.lat);
          const lng = parseFloat(place.lng);
          if (Number.isNaN(lat) || Number.isNaN(lng)) return of([] as OsmLocationPickItem[]);
          return this.locationCatalog.getAreaSuggestionsAround(lat, lng);
        }),
        takeUntilDestroyed()
      )
      .subscribe((items) => this.areaSuggestions.set(items));
  }

  /** Syncs city signal and query text from the city FormControl. */
  private wireCityControl(): void {
    const toText = (v: string | GeoNamePlace): string =>
      typeof v === 'string' ? v : (v?.name ?? '');

    // Sync query text for autocomplete filtering (immediate).
    this.cityControl.valueChanges
      .pipe(startWith(this.cityControl.value), map(toText), takeUntilDestroyed())
      .subscribe((text) => {
        this.cityQueryText.set(text);
        this.city.set(text.trim() || 'Any');
        if (!text.trim()) {
          this.locationCatalog.clearSelectedCityPlace();
          this.areaControl.setValue('', { emitEvent: false });
          this.areaQueryText.set('');
          this.area.set('Any');
        }
      });

    // Auto-select city when typing produces an exact single match (debounced).
    this.cityControl.valueChanges
      .pipe(debounceTime(450), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((v) => {
        const text = toText(v).trim();
        if (!text) return;
        const match = this.locationCatalog.matchSinglePlaceByName(this.allGeoPlaces(), text);
        if (match) this.locationCatalog.setSelectedCityPlace(match);
      });
  }

  /** Syncs area signal and query text from the area FormControl. */
  private wireAreaControl(): void {
    this.areaControl.valueChanges
      .pipe(
        startWith(this.areaControl.value),
        map((v) => (typeof v === 'string' ? v : (v?.name ?? ''))),
        takeUntilDestroyed()
      )
      .subscribe((text) => {
        this.areaQueryText.set(text);
        this.area.set(text.trim() || 'Any');
      });
  }

  // ── Event handlers ───────────────────────────────────────────────────────

  setActiveTab(tab: SearchMode): void {
    this.activeTab.set(tab);
    this.primaryType.set('any');
    this.subtype.set('any');
    this.priceRange.set({ min: null, max: null });
  }

  onPrimaryTypeSelected(value: string): void {
    this.primaryType.set(value);
    const validSubtypes = this.filtersCatalog.getSubtypeOptions(value);
    if (!validSubtypes.some((o) => o.id === this.subtype())) {
      this.subtype.set('any');
    }
  }

  onSubtypeSelected(value: string): void {
    this.subtype.set(value);
    if (value && value !== 'any') {
      const categorySlug = this.filtersCatalog.categoryForSubtypeSlug(value);
      if (categorySlug) this.primaryType.set(categorySlug);
    }
  }

  onCityOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const place = event.option.value as GeoNamePlace;
    if (!place?.name) return;
    this.locationCatalog.setSelectedCityPlace(place);
    this.cityControl.setValue(place);
    this.areaControl.setValue('');
    this.areaQueryText.set('');
    this.area.set('Any');
    this.locationCatalog.setSelectedAreaPick(null);
  }

  onAreaOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const item = event.option.value as OsmLocationPickItem;
    if (!item?.name) return;
    this.locationCatalog.setSelectedAreaPick(item);
    this.areaControl.setValue(item);
    this.area.set(item.name);
  }

  onPriceRangeChange(range: PriceRange): void {
    this.priceRange.set(range);
  }

  toggleChip(id: string): void {
    this.quickChips.update((chips) =>
      chips.map((chip) => chip.id === id ? { ...chip, active: !chip.active } : chip)
    );
  }

  toggleMoreFilters(): void {
    this.showMoreFilters.update((v) => !v);
  }

  runSearch(): void {
    this.search.emit({
      mode:        this.activeTab(),
      keyword:     this.keyword(),
      primaryType: this.primaryType(),
      subtype:     this.subtype(),
      city:        this.city(),
      area:        this.area(),
      minPrice:    this.priceRange().min,
      maxPrice:    this.priceRange().max,
      bedrooms:    this.bedrooms(),
      bathrooms:   this.bathrooms(),
      size:        this.size()
    });
  }

  // ── Voice search ─────────────────────────────────────────────────────────

  startVoiceSearch(): void {
    if (!this.micSupported() || !this.recognition) {
      this.micError.set('Voice search is not supported in this browser.');
      return;
    }
    if (this.isListening()) {
      this.recognition.stop();
      return;
    }
    this.micError.set('');
    this.recognition.start();
  }

  private setupSpeechRecognition(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const win = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };

    const Ctor = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!Ctor) { this.micSupported.set(false); return; }

    this.micSupported.set(true);

    const r = new Ctor();
    r.continuous     = false;
    r.interimResults = true;
    r.lang           = 'en-US';

    r.onstart  = () => { this.isListening.set(true);  this.micError.set(''); };
    r.onend    = () =>   this.isListening.set(false);
    r.onerror  = (e: SpeechRecognitionErrorLike) => {
      this.isListening.set(false);
      this.micError.set(
        e.error === 'not-allowed'
          ? 'Microphone permission was denied.'
          : 'Voice search could not be completed.'
      );
    };
    r.onresult = (e: SpeechRecognitionEventLike) => {
      let transcript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      const clean = transcript.trim();
      if (clean) {
        this.keyword.set(`"${clean}"`);
        this.quickChips.update((chips) =>
          chips.map((c) => c.id === 'voice-enabled' ? { ...c, active: true } : c)
        );
      }
    };

    this.recognition = r;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private clearCityAndArea(): void {
    this.cityControl.setValue('', { emitEvent: false });
    this.cityQueryText.set('');
    this.city.set('Any');
    this.areaControl.setValue('', { emitEvent: false });
    this.areaQueryText.set('');
    this.area.set('Any');
    this.locationCatalog.clearSelectedCityPlace();
  }
}
