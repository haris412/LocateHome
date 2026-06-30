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
import { debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { of, startWith } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';

import { PriceRange } from '../../../../shared/ui/price-range-field/price-range-field.component';
import { FilterOption } from '../../../../core/models/filter.models';
import { GooglePlacePrediction } from '../../../../core/models/google-places.models';
import { LocationCatalogService } from '../../../../core/services/location-catalog.service';
import { FiltersCatalogService } from '../../../../core/services/filters-catalog.service';
import { SegmentedTabsComponent, SegmentedTabItem } from '../../../../shared/ui/segmented-tabs/segmented-tabs.component';
import {
  SpeechRecognitionConstructor,
  SpeechRecognitionErrorLike,
  SpeechRecognitionEventLike,
  SpeechRecognitionLike
} from './speech-recognition.types';
import { SearchPayload, SearchMode } from '../../../../core/interfaces/search-payload.interface';

@Component({
  selector: 'app-search-panel',
  imports: [
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatSelectModule,
    ReactiveFormsModule,
    SegmentedTabsComponent
  ],
  templateUrl: './search-panel.component.html',
  styleUrl: './search-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchPanelComponent {
  private readonly platformId      = inject(PLATFORM_ID);
  private readonly locationCatalog = inject(LocationCatalogService);
  private readonly filtersCatalog  = inject(FiltersCatalogService);

  readonly search = output<SearchPayload>();

  // ── Tab / mode ──────────────────────────────────────────────────────────

  readonly tabs: readonly SegmentedTabItem[] = [
    { id: 'buy', label: 'Buy' },
    { id: 'rent', label: 'Rent' }
  ];

  readonly activeTab = signal<SearchMode>('buy');

  // ── Location state ──────────────────────────────────────────────────────

  readonly locationName = signal('');

  readonly locationControl = new FormControl<string | GooglePlacePrediction>('', { nonNullable: true });
  readonly locationSuggestions = signal<GooglePlacePrediction[]>([]);

  // ── Filter state ────────────────────────────────────────────────────────

  readonly primaryType = signal('any');
  readonly subtype     = signal('any');
  readonly keyword     = signal('');
  readonly priceRange  = signal<PriceRange>({ min: null, max: null });
  readonly bedrooms    = signal('Any');
  readonly bathrooms   = signal('Any');
  readonly size        = signal('1,000+ sqft');

  // ── Static options ──────────────────────────────────────────────────────

  readonly propertyTypeOptions = this.filtersCatalog.propertyTypeOptions;

  readonly subtypeOptions = computed<readonly FilterOption[]>(() =>
    this.filtersCatalog.getSubtypeOptions(this.primaryType())
  );

  readonly bedroomOptions  = ['Any', '1+', '2+', '3+', '4+'];
  readonly bathroomOptions = ['Any', '1+', '2+', '3+'];
  readonly sizeOptions     = ['Any', '500+ sqft', '1,000+ sqft', '2,000+ sqft'];
  readonly showMoreFilters = signal(false);
  readonly showVoicePanel = signal(false);

  // ── Voice search ────────────────────────────────────────────────────────

  readonly isListening  = signal(false);
  readonly micSupported = signal(false);
  readonly micError     = signal('');
  readonly voiceHint    = computed(() =>
    this.isListening() ? 'Listening… speak now' : 'Tap to speak'
  );
  readonly priceRangeMode = computed<'buy' | 'rent'>(() =>
    this.activeTab() === 'rent' ? 'rent' : 'buy'
  );
  readonly priceRangeOptions = computed(() =>
    this.filtersCatalog.getPriceRangeForMode(this.priceRangeMode())
  );

  private recognition: SpeechRecognitionLike | null = null;

  // ── Display helpers (passed to [displayWith]) ───────────────────────────

  readonly displayLocation = (v: GooglePlacePrediction | string | null): string => {
    if (v == null || typeof v === 'string') return v ?? '';
    return v.structuredFormat.mainText.text;
  };

  readonly trackPrediction = (_: number, p: GooglePlacePrediction): string => p.placeId;

  // ─────────────────────────────────────────────────────────────────────────

  constructor() {
    this.filtersCatalog.loadCatalog();
    this.filtersCatalog.loadPriceRanges();
    this.setupSpeechRecognition();
    this.wireLocationControl();
    this.detectUserCity();
  }

  // ── Wiring ───────────────────────────────────────────────────────────────

  private wireLocationControl(): void {
    this.locationControl.valueChanges.pipe(
      startWith(this.locationControl.value),
      map(v => (typeof v === 'string' ? v : v.structuredFormat.mainText.text)),
      debounceTime(300),
      distinctUntilChanged(),
      tap(query => this.locationName.set(query.trim())),
      switchMap(query => {
        if (!query.trim()) {
          this.locationSuggestions.set([]);
          return of([]);
        }
        return this.locationCatalog.searchPlaces(query);
      }),
      takeUntilDestroyed()
    ).subscribe(predictions => this.locationSuggestions.set(predictions));
  }

  // ── Event handlers ───────────────────────────────────────────────────────

  setActiveTab(tab: string): void {
    if (tab !== 'buy' && tab !== 'rent' && tab !== 'sell') return;
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
      const categoryId = this.filtersCatalog.categoryIdForSubtypeId(value);
      if (categoryId) this.primaryType.set(categoryId);
    }
  }

  onLocationSelected(event: MatAutocompleteSelectedEvent): void {
    const pred = event.option.value as GooglePlacePrediction;
    if (!pred?.placeId) return;
    this.locationName.set(pred.structuredFormat.mainText.text);
  }

  onPriceRangeChange(range: PriceRange): void {
    this.priceRange.set(range);
  }

  onMinPriceSelected(value: number | null): void {
    this.priceRange.update(range => ({ ...range, min: value }));
  }

  onMaxPriceSelected(value: number | null): void {
    this.priceRange.update(range => ({ ...range, max: value }));
  }

  formatPrice(value: number): string {
    const symbol = this.filtersCatalog.priceRanges()?.symbol ?? 'PKR';
    return `${symbol} ${value.toLocaleString()}`;
  }
  toggleMoreFilters(): void {
    this.showMoreFilters.update(v => !v);
  }

  runSearch(): void {
    this.search.emit({
      mode:         this.activeTab(),
      keyword:      this.keyword(),
      primaryType:  this.primaryType(),
      subtype:      this.subtype(),
      locationName: this.locationName(),
      minPrice:     this.priceRange().min,
      maxPrice:     this.priceRange().max,
      bedrooms:     this.bedrooms(),
      bathrooms:    this.bathrooms(),
      size:         this.size()
    });
  }

  // ── Voice search ─────────────────────────────────────────────────────────

  startVoiceSearch(): void {
    this.showVoicePanel.set(true);
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

  closeVoicePanel(): void {
    if (this.isListening()) {
      this.recognition?.stop();
    }
    this.showVoicePanel.set(false);
  }

  private detectUserCity(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        this.locationCatalog.reverseGeocode(coords.latitude, coords.longitude)
          .subscribe(cityName => {
            if (!cityName) return;
            this.locationName.set(cityName);
            this.locationControl.setValue(cityName, { emitEvent: false });
          });
      },
      () => { /* permission denied or unavailable — stay silent */ }
    );
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

    const recognition = new Ctor();
    recognition.continuous     = false;
    recognition.interimResults = true;
    recognition.lang           = 'en-US';

    recognition.onstart = () => { this.isListening.set(true); this.micError.set(''); };
    recognition.onend   = () => this.isListening.set(false);
    recognition.onerror = (e: SpeechRecognitionErrorLike) => {
      this.isListening.set(false);
      this.micError.set(
        e.error === 'not-allowed'
          ? 'Microphone permission was denied.'
          : 'Voice search could not be completed.'
      );
    };
    recognition.onresult = (e: SpeechRecognitionEventLike) => {
      let transcript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      const clean = transcript.trim();
      if (clean) {
        this.keyword.set(`"${clean}"`);
        // this.quickChips.update(chips =>
        //   chips.map(c => c.id === 'voice-enabled' ? { ...c, active: true } : c)
        // );
      }
    };

    this.recognition = recognition;
  }
}
