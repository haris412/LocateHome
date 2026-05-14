import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LocationCatalogService } from '../../../core/services/location-catalog.service';

import {
  FilterChipItem,
  FilterMode,
  FilterSelectConfig,
  FilterTabItem
} from '../../../core/models/filter.models';
import { FiltersCatalogService } from '../../../core/services/filters-catalog.service';

import { FilterShellComponent } from '../filter-shell/filter-shell.component';
import { FilterSelectComponent } from '../filter-select-card/filter-select-card.component';
import { FilterChipGroupComponent } from '../filter-chip-group/filter-chip-group.component';
import { SegmentedTabsComponent } from '../segmented-tabs/segmented-tabs.component';
import { LocationSearchFieldComponent } from '../location-search-field/location-search-field.component';
export interface PropertyFilterPayload {
  mode: FilterMode;
  query: string;
  fields: FilterSelectConfig[];
  chips: FilterChipItem[];
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
  selector: 'app-property-filters',
  standalone: true,
  imports: [
    MatIconModule,
    FilterShellComponent,
    SegmentedTabsComponent,
    FilterSelectComponent,
    FilterChipGroupComponent,
    LocationSearchFieldComponent
  ],
  templateUrl: './property-filters.component.html',
  styleUrl: './property-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertyFiltersComponent {
  get heroSummaryField(): FilterSelectConfig | null {
    return this.activeFields().length > 0 ? this.activeFields()[0] : null;
  }

  get heroSummaryValue(): string {
    const field = this.heroSummaryField;

    if (!field) {
      return 'Select';
    }

    const selectedOption = field.options.find((option) => option.id === field.value);

    return selectedOption?.label || field.placeholder || 'Select';
  }
  private readonly platformId      = inject(PLATFORM_ID);
  private readonly filtersCatalog  = inject(FiltersCatalogService);
  private readonly locationCatalog = inject(LocationCatalogService);

  readonly variant = input<'hero' | 'toolbar'>('hero');
  readonly initialMode = input<FilterMode>('buy');
  readonly searchQueryInput = input<string>('');
  readonly buyFields = input<FilterSelectConfig[]>([]);
  readonly rentFields = input<FilterSelectConfig[]>([]);
  readonly buyChips = input<FilterChipItem[]>([]);
  readonly rentChips = input<FilterChipItem[]>([]);
  readonly voiceEnabled = input(true);
  readonly showMoreFiltersToggle = input(true);

  @Output() readonly searchSubmitted = new EventEmitter<PropertyFilterPayload>();
  @Output() readonly filtersChanged = new EventEmitter<PropertyFilterPayload>();
  @Output() readonly searchQueryChange = new EventEmitter<string>();

  readonly mode = signal<FilterMode>('buy');
  readonly showMoreFilters = signal(false);
  readonly searchQuery = signal('');

  readonly localBuyFields = signal<FilterSelectConfig[]>([]);
  readonly localRentFields = signal<FilterSelectConfig[]>([]);
  readonly localBuyChips = signal<FilterChipItem[]>([]);
  readonly localRentChips = signal<FilterChipItem[]>([]);

  readonly tabs: readonly FilterTabItem[] = [
    { id: 'buy', label: 'Buy' },
    { id: 'rent', label: 'Rent' }
  ];

  readonly activeFields = computed(() =>
    this.mode() === 'buy' ? this.localBuyFields() : this.localRentFields()
  );

  readonly activeChips = computed(() =>
    this.mode() === 'buy' ? this.localBuyChips() : this.localRentChips()
  );

  readonly locationField = computed(() =>
    this.activeFields().find((field) => field.id === 'city' || field.id === 'location') ?? null
  );

  readonly areaField = computed(() =>
    this.activeFields().find((field) => field.id === 'area') ?? null
  );

  readonly priceField = computed(() =>
    this.activeFields().find((field) => field.id === 'price') ?? null
  );

  readonly minPriceField = computed(() => this.priceSlotField('Min Price'));
  readonly maxPriceField = computed(() => this.priceSlotField('Max Price'));

  readonly advancedFields = computed(() =>
    this.activeFields().filter(
      (field) =>
        field.id !== 'city' &&
        field.id !== 'location' &&
        field.id !== 'area' &&
        field.id !== 'price'
    )
  );

  readonly isListening = signal(false);
  readonly micSupported = signal(false);
  readonly micError = signal('');
  readonly showVoicePanel = signal(false);

  private recognition: SpeechRecognitionLike | null = null;

  constructor() {
    effect(() => {
      this.mode.set(this.initialMode());
    });

    effect(() => {
      const value = this.searchQueryInput();
      this.searchQuery.set(value);
      this.syncSearchFieldValue(value);
    });

    effect(() => {
      this.localBuyFields.set(
        this.buyFields().map((field) => ({
          ...field,
          value:
            field.id === 'city' || field.id === 'location'
              ? this.searchQuery()
              : field.value,
          options: [...field.options]
        }))
      );
    });

    effect(() => {
      this.localRentFields.set(
        this.rentFields().map((field) => ({
          ...field,
          value:
            field.id === 'city' || field.id === 'location'
              ? this.searchQuery()
              : field.value,
          options: [...field.options]
        }))
      );
    });

    effect(() => {
      this.localBuyChips.set(
        this.buyChips().map((chip) => ({
          ...chip
        }))
      );
    });

    effect(() => {
      this.localRentChips.set(
        this.rentChips().map((chip) => ({
          ...chip
        }))
      );
    });

    this.setupSpeechRecognition();
  }

  setMode(mode: string): void {
    if (mode !== 'buy' && mode !== 'rent') {
      return;
    }

    this.mode.set(mode);
    this.emitFiltersChanged();
  }

  toggleMoreFilters(): void {
    if (!this.showMoreFiltersToggle()) {
      return;
    }

    this.showMoreFilters.update((value) => !value);
  }

  updateField(payload: { id: string; value: string | null }): void {
    const store = this.mode() === 'buy' ? this.localBuyFields : this.localRentFields;

    store.update((fields) => {
      let next = fields.map((field) =>
        field.id === payload.id
          ? { ...field, value: payload.value }
          : field
      );

      if (payload.id === 'primaryType') {
        const cat = payload.value || 'any';
        const opts = this.filtersCatalog.getSubtypeOptions(cat);
        next = next.map((field) => {
          if (field.id !== 'subtype') return field;
          const stillValid = opts.some((o) => o.id === field.value);
          return {
            ...field,
            options: opts,
            value: stillValid ? field.value : 'any'
          };
        });
      }

      if (payload.id === 'subtype') {
        const sid = payload.value || 'any';
        if (sid !== 'any') {
          const catSlug = this.filtersCatalog.categoryForSubtypeSlug(sid);
          if (catSlug) {
            next = next.map((field) =>
              field.id === 'primaryType' ? { ...field, value: catSlug } : field
            );
            const opts = this.filtersCatalog.getSubtypeOptions(catSlug);
            next = next.map((field) =>
              field.id === 'subtype'
                ? { ...field, options: opts, value: sid }
                : field
            );
          }
        }
      }

      return next;
    });

    if (payload.id === 'province') {
      this.locationCatalog.setSelectedProvince(payload.value ?? 'any');
      store.update((fields) =>
        fields.map((f) => (f.id === 'city' ? { ...f, value: '' } : f))
      );
    }

    this.emitFiltersChanged();
  }

  toggleChip(id: string): void {
    const store = this.mode() === 'buy' ? this.localBuyChips : this.localRentChips;

    store.update((chips) =>
      chips.map((chip) =>
        chip.id === id
          ? { ...chip, selected: !chip.selected }
          : chip
      )
    );

    this.emitFiltersChanged();
  }

  updateSearch(value: string): void {
    this.searchQuery.set(value);
    this.syncSearchFieldValue(value);
    this.searchQueryChange.emit(value);
    this.emitFiltersChanged();
  }

  runSearch(): void {
    this.searchSubmitted.emit(this.buildPayload());
  }

  startVoiceSearch(): void {
    if (!this.voiceEnabled()) {
      return;
    }

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
    if (this.isListening() && this.recognition) {
      this.recognition.stop();
    }

    this.showVoicePanel.set(false);
  }

  private priceSlotField(label: string): FilterSelectConfig | null {
    const field = this.priceField();

    if (!field) {
      return null;
    }

    return {
      ...field,
      label,
      placeholder: 'Any'
    };
  }

  private syncSearchFieldValue(value: string): void {
    const syncFields = (fields: FilterSelectConfig[]) =>
      fields.map((field) =>
        field.id === 'city' || field.id === 'location'
          ? { ...field, value }
          : field
      );

    this.localBuyFields.update(syncFields);
    this.localRentFields.update(syncFields);
  }

  private emitFiltersChanged(): void {
    this.filtersChanged.emit(this.buildPayload());
  }

  private buildPayload(): PropertyFilterPayload {
    return {
      mode: this.mode(),
      query: this.searchQuery(),
      fields: this.activeFields(),
      chips: this.activeChips().filter((chip) => chip.selected)
    };
  }

  private setupSpeechRecognition(): void {
    if (!isPlatformBrowser(this.platformId) || !this.voiceEnabled()) {
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
      this.showVoicePanel.set(true);
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
        this.updateSearch(cleanTranscript);
        this.runSearch();
      }
    };

    this.recognition = recognition;
  }
}
