import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  computed,
  inject,
  output,
  signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { of, startWith } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';

import { PriceRangeFieldComponent, PriceRange } from '../../../../shared/ui/price-range-field/price-range-field.component';
import { FilterOption } from '../../../../core/models/filter.models';
import { GooglePlacePrediction } from '../../../../core/models/google-places.models';
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
  neighborhood: string;
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
  private readonly platformId      = inject(PLATFORM_ID);
  private readonly locationCatalog = inject(LocationCatalogService);
  private readonly filtersCatalog  = inject(FiltersCatalogService);

  readonly search = output<SearchPanelSearchPayload>();

  // ── Tab / mode ──────────────────────────────────────────────────────────

  readonly tabs: readonly SearchTab[] = [
    { id: 'buy', label: 'Buy' },
    { id: 'rent', label: 'Rent' }
  ];

  readonly activeTab = signal<SearchMode>('buy');

  // ── Location state ──────────────────────────────────────────────────────

  readonly province     = signal('any');
  readonly city         = signal('Any');
  readonly neighborhood = signal('Any');

  readonly cityControl         = new FormControl<string | GooglePlacePrediction>('', { nonNullable: true });
  readonly neighborhoodControl = new FormControl<string | GooglePlacePrediction>('', { nonNullable: true });

  readonly citySuggestions         = signal<GooglePlacePrediction[]>([]);
  readonly neighborhoodSuggestions = signal<GooglePlacePrediction[]>([]);

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
    { id: 'voice-enabled',     label: 'Voice enabled search', icon: 'graphic_eq', active: false },
    { id: 'new-projects',      label: 'New projects',         icon: 'auto_awesome' },
    { id: 'ready-to-move',     label: 'Ready to move' },
    { id: 'pet-friendly',      label: 'Pet friendly' },
    { id: 'parking',           label: 'Parking' },
    { id: 'video-tours',       label: 'Video tours' },
    { id: 'verified-listings', label: 'Verified listings' }
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

  readonly displayCity = (v: GooglePlacePrediction | string | null): string => {
    if (v == null || typeof v === 'string') return v ?? '';
    return v.structuredFormat.mainText.text;
  };

  readonly displayArea = (v: GooglePlacePrediction | string | null): string => {
    if (v == null || typeof v === 'string') return v ?? '';
    return v.structuredFormat.mainText.text;
  };

  readonly trackPrediction = (_: number, p: GooglePlacePrediction): string => p.placeId;

  // ─────────────────────────────────────────────────────────────────────────

  constructor() {
    this.filtersCatalog.loadCatalog();
    this.filtersCatalog.loadPriceRanges();
    this.setupSpeechRecognition();
    this.wireCityControl();
    this.wireAreaControl();
  }

  // ── Wiring ───────────────────────────────────────────────────────────────

  private wireCityControl(): void {
    this.cityControl.valueChanges.pipe(
      startWith(this.cityControl.value),
      map(v => (typeof v === 'string' ? v : v?.structuredFormat.mainText.text ?? '')),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query.trim()) {
          this.city.set('Any');
          this.citySuggestions.set([]);
          this.neighborhoodControl.setValue('', { emitEvent: false });
          this.neighborhood.set('Any');
          this.neighborhoodSuggestions.set([]);
          return of([]);
        }
        return this.locationCatalog.searchPlaces(query);
      }),
      takeUntilDestroyed()
    ).subscribe(predictions => this.citySuggestions.set(predictions));
  }

  private wireAreaControl(): void {
    this.neighborhoodControl.valueChanges.pipe(
      startWith(this.neighborhoodControl.value),
      map(v => (typeof v === 'string' ? v : v?.structuredFormat.mainText.text ?? '')),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query.trim()) {
          this.neighborhood.set('Any');
          this.neighborhoodSuggestions.set([]);
          return of([]);
        }
        // Prefix with selected city to get more relevant area results.
        const cityName = this.city() !== 'Any' ? `${this.city()} ` : '';
        return this.locationCatalog.searchPlaces(`${cityName}${query}`);
      }),
      takeUntilDestroyed()
    ).subscribe(predictions => this.neighborhoodSuggestions.set(predictions));
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
    if (!validSubtypes.some(o => o.id === this.subtype())) {
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
    const pred = event.option.value as GooglePlacePrediction;
    if (!pred?.placeId) return;
    const { city } = this.locationCatalog.parsePlaceCityNeighborhood(pred);
    this.city.set(city || 'Any');
    this.neighborhoodControl.setValue('', { emitEvent: false });
    this.neighborhood.set('Any');
    this.neighborhoodSuggestions.set([]);
  }

  onAreaOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const pred = event.option.value as GooglePlacePrediction;
    if (!pred?.placeId) return;
    const name = pred.structuredFormat.mainText.text;
    this.neighborhood.set(name || 'Any');
  }

  onPriceRangeChange(range: PriceRange): void {
    this.priceRange.set(range);
  }

  toggleChip(id: string): void {
    this.quickChips.update(chips =>
      chips.map(chip => chip.id === id ? { ...chip, active: !chip.active } : chip)
    );
  }

  toggleMoreFilters(): void {
    this.showMoreFilters.update(v => !v);
  }

  runSearch(): void {
    this.search.emit({
      mode:        this.activeTab(),
      keyword:     this.keyword(),
      primaryType: this.primaryType(),
      subtype:     this.subtype(),
      city:         this.city(),
      neighborhood: this.neighborhood(),
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

    r.onstart  = () => { this.isListening.set(true); this.micError.set(''); };
    r.onend    = () => this.isListening.set(false);
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
        this.quickChips.update(chips =>
          chips.map(c => c.id === 'voice-enabled' ? { ...c, active: true } : c)
        );
      }
    };

    this.recognition = r;
  }
}
