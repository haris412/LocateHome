import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  PLATFORM_ID,
  afterNextRender,
  computed,
  inject,
  signal,
  EventEmitter,
  Output
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { of, startWith } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';

import { GeoNamePlace } from '../../../../core/models/geonames.models';
import { OsmLocationPickItem } from '../../../../core/models/overpass.models';
import { LocationCatalogService } from '../../../../core/services/location-catalog.service';
import {
  PROPERTY_TYPE_SELECT_OPTIONS,
  categoryForSubtypeId,
  subtypeFilterOptions
} from '../../../../core/models/property-categories.model';

export type SearchMode = 'buy' | 'rent';

interface SearchTab {
  id: SearchMode;
  label: string;
}

interface SearchSummaryField {
  id: string;
  icon: string;
  label: string;
  value: string;
}

interface QuickChip {
  id: string;
  label: string;
  icon?: string;
  active?: boolean;
}

export interface SearchPanelSearchPayload {
  mode: SearchMode;
  keyword: string;
  /** Top-level property type: homes | plots | commercial | any */
  primaryType: string;
  /** Subtype id (kebab-case) or any */
  subtype: string;
  fields: readonly SearchSummaryField[];
  filters: QuickChip[];
  city: string;
  area: string;
  budget: string;
  bedrooms: string;
  bathrooms: string;
  size: string;
}

interface SelectOption {
  id: string;
  label: string;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognitionLike;
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
}

interface SpeechRecognitionErrorLike {
  error: string;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

@Component({
  selector: 'app-search-panel',
  standalone: true,
  imports: [
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  templateUrl: './search-panel.component.html',
  styleUrl: './search-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchPanelComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly locationCatalog = inject(LocationCatalogService);
  readonly showMoreFilters = signal(false);

  @Output() readonly search = new EventEmitter<SearchPanelSearchPayload>();

  readonly tabs = signal<readonly SearchTab[]>([
    { id: 'buy', label: 'Buy' },
    { id: 'rent', label: 'Rent' }
  ]);

  readonly activeTab = signal<SearchMode>('buy');

  readonly keyword = signal('“2 bed apartment in downtown Seattle”');
  /** Homes, Plots, Commercial (property type), or any. */
  readonly primaryType = signal('any');
  readonly subtype = signal('any');

  // Individual filter state
  readonly province = signal('any');
  readonly state = signal('any');
  /** Display + search payload; "Any" when not set. */
  readonly city = signal('Any');
  readonly area = signal('Any');

  readonly cityControl = new FormControl<string | GeoNamePlace>('', { nonNullable: true });
  readonly areaControl = new FormControl<string | OsmLocationPickItem>('', { nonNullable: true });

  readonly allGeoPlaces = signal<GeoNamePlace[]>([]);
  readonly cityQueryText = signal('');
  readonly mergedAreas = signal<OsmLocationPickItem[]>([]);
  readonly areaQueryText = signal('');

  readonly filteredCities = computed(() =>
    this.locationCatalog.filterPlacesByTerm(this.allGeoPlaces(), this.cityQueryText())
  );

  readonly filteredAreas = computed(() =>
    this.locationCatalog.filterAreaSuggestionsByTerm(this.mergedAreas(), this.areaQueryText())
  );

  readonly displayCity = (v: GeoNamePlace | string | null): string => {
    if (v == null || typeof v === 'string') return v ?? '';
    return v.name;
  };

  readonly displayArea = (v: OsmLocationPickItem | string | null): string => {
    if (v == null || typeof v === 'string') return v ?? '';
    return v.name;
  };

  readonly budget = signal('$500k - $2.5M');
  readonly bedrooms = signal('Any');
  readonly bathrooms = signal('Any');
  readonly size = signal('1,000+ sqft');

  // Options for selects
  readonly provinceOptions = ['Any', 'Ontario', 'Alberta', 'British Columbia'];
  readonly stateOptions = ['Any', 'Toronto', 'Ottawa'];

  readonly propertyTypeOptions = PROPERTY_TYPE_SELECT_OPTIONS;

  readonly subtypeOptions = computed<readonly SelectOption[]>(() =>
    subtypeFilterOptions(this.primaryType()).map((o) => ({ id: o.id, label: o.label }))
  );

  readonly buyBudgetOptions = ['Any', 'Under $500k', '$500k - $2.5M', '$2.5M+'];
  readonly rentBudgetOptions = ['Any', 'Under $1,500', '$1,500 - $3,500', '$3,500+'];
  readonly budgetOptions = computed<readonly string[]>(() =>
    this.activeTab() === 'buy' ? this.buyBudgetOptions : this.rentBudgetOptions
  );

  readonly bedroomOptions = ['Any', '1+', '2+', '3+', '4+'];
  readonly bathroomOptions = ['Any', '1+', '2+', '3+'];
  readonly sizeOptions = ['Any', '500+ sqft', '1,000+ sqft', '2,000+ sqft'];

  readonly summaryFields = computed<readonly SearchSummaryField[]>(() => [
    { id: 'city', icon: 'location_on', label: 'City', value: this.city() },
    { id: 'area', icon: 'pin_drop', label: 'Area', value: this.area() },
    { id: 'budget', icon: 'monetization_on', label: 'Budget', value: this.budget() },
    { id: 'bedrooms', icon: 'bed', label: 'Bedrooms', value: this.bedrooms() },
    { id: 'bathrooms', icon: 'bathtub', label: 'Bathrooms', value: this.bathrooms() },
    { id: 'size', icon: 'straighten', label: 'Size', value: this.size() }
  ]);

  readonly quickChips = signal<QuickChip[]>([
    { id: 'voice-enabled', label: 'Voice enabled search', icon: 'graphic_eq', active: false },
    { id: 'new-projects', label: 'New projects', icon: 'auto_awesome' },
    { id: 'ready-to-move', label: 'Ready to move' },
    { id: 'pet-friendly', label: 'Pet friendly' },
    { id: 'parking', label: 'Parking' },
    { id: 'video-tours', label: 'Video tours' },
    { id: 'verified-listings', label: 'Verified listings' }
  ]);

  readonly isListening = signal(false);
  readonly micSupported = signal(false);
  readonly micError = signal('');
  readonly voiceHint = computed(() =>
    this.isListening() ? 'Listening… speak now' : 'Tap to speak'
  );

  private recognition: SpeechRecognitionLike | null = null;

  constructor() {
    this.setupSpeechRecognition();
    this.wireLocationCatalog();
    afterNextRender(() => this.loadGeoNamesCities());
  }

  private loadGeoNamesCities(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.locationCatalog
      .getPopulatedPlaces({ countryCode: this.locationCatalog.listingCountryCode })
      .subscribe({
        next: (places) => {
          this.allGeoPlaces.set(places);
          this.cdr.markForCheck();
        },
        error: () => {
          this.allGeoPlaces.set([]);
          this.cdr.markForCheck();
        }
      });
  }

  private wireLocationCatalog(): void {
    const cityText = (v: string | GeoNamePlace): string =>
      typeof v === 'string' ? v : (v?.name ?? '');

    this.cityControl.valueChanges
      .pipe(
        startWith(this.cityControl.value),
        map(cityText),
        takeUntilDestroyed()
      )
      .subscribe((text) => {
        this.cityQueryText.set(text);
        const trimmed = text.trim();
        this.city.set(trimmed ? trimmed : 'Any');
        if (!trimmed) {
          this.locationCatalog.clearSelectedCityPlace();
          this.areaControl.setValue('', { emitEvent: false });
          this.areaQueryText.set('');
          this.area.set('Any');
        }
        this.cdr.markForCheck();
      });

    this.cityControl.valueChanges
      .pipe(debounceTime(450), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((v) => {
        const t = cityText(v).trim();
        if (!t) return;
        const single = this.locationCatalog.matchSinglePlaceByName(this.allGeoPlaces(), t);
        if (single) {
          this.locationCatalog.setSelectedCityPlace(single);
        }
      });

    toObservable(this.locationCatalog.selectedCityPlace)
      .pipe(
        switchMap((place) => {
          if (!place) {
            this.mergedAreas.set([]);
            return of([] as OsmLocationPickItem[]);
          }
          const lat = parseFloat(place.lat);
          const lng = parseFloat(place.lng);
          if (Number.isNaN(lat) || Number.isNaN(lng)) {
            return of([] as OsmLocationPickItem[]);
          }
          return this.locationCatalog.getMergedLocationSuggestionsAround({ lat, lng });
        }),
        takeUntilDestroyed()
      )
      .subscribe((list) => {
        this.mergedAreas.set(list);
        this.cdr.markForCheck();
      });

    this.areaControl.valueChanges
      .pipe(
        startWith(this.areaControl.value),
        map((v) => (typeof v === 'string' ? v : v?.name ?? '')),
        takeUntilDestroyed()
      )
      .subscribe((text) => {
        this.areaQueryText.set(text);
        this.area.set(text.trim() ? text.trim() : 'Any');
        this.cdr.markForCheck();
      });
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
    this.cdr.markForCheck();
  }

  onAreaOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const item = event.option.value as OsmLocationPickItem;
    if (!item?.name) return;
    this.locationCatalog.setSelectedAreaPick(item);
    this.areaControl.setValue(item);
    this.area.set(item.name);
    this.cdr.markForCheck();
  }

  trackGeoPlace = (_: number, p: GeoNamePlace): number => p.geonameId;
  trackAreaItem = (_: number, a: OsmLocationPickItem): string =>
    `${a.kind}-${a.name}-${a.lat}-${a.lon}`;

  setActiveTab(tab: SearchMode): void {
    this.activeTab.set(tab);
    this.primaryType.set('any');
    this.subtype.set('any');
    if (tab === 'buy') {
      this.budget.set('$500k - $2.5M');
    } else {
      this.budget.set('$1,500 - $3,500');
    }
  }

  onPrimaryTypeSelected(value: string): void {
    this.primaryType.set(value);
    const opts = subtypeFilterOptions(value);
    const current = this.subtype();
    if (!opts.some((o) => o.id === current)) {
      this.subtype.set('any');
    }
  }

  onSubtypeSelected(value: string): void {
    this.subtype.set(value);
    if (value && value !== 'any') {
      const groupId = categoryForSubtypeId(value);
      if (groupId) {
        this.primaryType.set(groupId);
      }
    }
  }

  toggleChip(id: string): void {
    this.quickChips.update((chips) =>
      chips.map((chip) =>
        chip.id === id ? { ...chip, active: !chip.active } : chip
      )
    );
  }

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

  runSearch(): void {
    const payload: SearchPanelSearchPayload = {
      mode: this.activeTab(),
      keyword: this.keyword(),
      primaryType: this.primaryType(),
      subtype: this.subtype(),
      fields: this.summaryFields(),
      filters: this.quickChips().filter((chip) => chip.active),
      city: this.city(),
      area: this.area(),
      budget: this.budget(),
      bedrooms: this.bedrooms(),
      bathrooms: this.bathrooms(),
      size: this.size()
    };

    this.search.emit(payload);
  }

  private setupSpeechRecognition(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const globalWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };

    const RecognitionCtor =
      globalWindow.SpeechRecognition ?? globalWindow.webkitSpeechRecognition;

    if (!RecognitionCtor) {
      this.micSupported.set(false);
      return;
    }

    this.micSupported.set(true);

    const recognition = new RecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      this.isListening.set(true);
      this.micError.set('');
    };

    recognition.onend = () => {
      this.isListening.set(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorLike) => {
      this.isListening.set(false);
      this.micError.set(
        event.error === 'not-allowed'
          ? 'Microphone permission was denied.'
          : 'Voice search could not be completed.'
      );
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let transcript = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript;
      }

      const cleanTranscript = transcript.trim();

      if (cleanTranscript) {
        this.keyword.set(`“${cleanTranscript}”`);

        this.quickChips.update((chips) =>
          chips.map((chip) =>
            chip.id === 'voice-enabled' ? { ...chip, active: true } : chip
          )
        );
      }
    };

    this.recognition = recognition;
  }
  toggleMoreFilters(): void {
    this.showMoreFilters.update((value) => !value);
  }
}