import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LocationCatalogService } from '../../../core/services/location-catalog.service';

import {
  FilterChipItem,
  FilterMode,
  FilterSelectConfig,
  FilterTabItem,
  EMPTY_MORE_FILTERS,
  MoreFiltersFormValue,
  MoreFiltersOverlayResult
} from '../../../core/models/filter.models';
import { FiltersCatalogService } from '../../../core/services/filters-catalog.service';
import { MoreFiltersOverlayService } from '../../services/more-filters-overlay.service';

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
  manualMinPrice?: number;
  manualMaxPrice?: number;
  purposeOverride?: 'For Sale' | 'For Rent' | null;
}

interface AppliedDrawerChip {
  id:
    | 'minArea'
    | 'bathrooms'
    | 'purpose'
    | 'furnishing'
    | 'amenity'
    | 'feature'
    | 'priceRange'
    | 'verifiedOnly'
    | 'withPhotos';
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
  selector: 'app-property-filters',
  standalone: true,
  imports: [
    MatButtonModule,
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
  private readonly destroyRef      = inject(DestroyRef);
  private readonly filtersCatalog  = inject(FiltersCatalogService);
  private readonly locationCatalog = inject(LocationCatalogService);
  private readonly moreFiltersOverlay = inject(MoreFiltersOverlayService);

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
  readonly appliedDrawerFilters = signal<MoreFiltersFormValue>({ ...EMPTY_MORE_FILTERS });

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

  readonly propertyTypeField = computed(() =>
    this.activeFields().find((field) => field.id === 'primaryType') ?? null
  );

  readonly bedsField = computed(() =>
    this.activeFields().find((field) => field.id === 'beds') ?? null
  );

  readonly selectedMoreFilters = computed(() =>
    this.activeChips().filter((chip) => chip.selected)
  );

  readonly appliedDrawerChips = computed<AppliedDrawerChip[]>(() => {
    const filters = this.appliedDrawerFilters();
    const chips: AppliedDrawerChip[] = [];

    if (filters.minPrice || filters.maxPrice) {
      const minimum = filters.minPrice ? `PKR ${this.formatCompactNumber(filters.minPrice)}` : 'Any';
      const maximum = filters.maxPrice ? `PKR ${this.formatCompactNumber(filters.maxPrice)}` : 'Any';
      chips.push({ id: 'priceRange', label: `Price: ${minimum} – ${maximum}` });
    }
    if (filters.minArea || filters.maxArea) {
      chips.push({
        id: 'minArea',
        label: `Area: ${filters.minArea || 'Any'} – ${filters.maxArea || 'Any'}`
      });
    }
    if (filters.bathrooms !== 'any') {
      chips.push({ id: 'bathrooms', label: `${filters.bathrooms}+ Bathrooms` });
    }
    if (filters.purpose !== 'any') {
      const label = filters.purpose === 'buy' ? 'For Sale' : 'For Rent';
      chips.push({ id: 'purpose', label });
    }
    if (filters.furnishing !== 'any') {
      chips.push({ id: 'furnishing', label: filters.furnishing });
    }
    if (filters.amenity) chips.push({ id: 'amenity', label: filters.amenity });
    if (filters.feature) chips.push({ id: 'feature', label: filters.feature });
    if (filters.verifiedOnly) chips.push({ id: 'verifiedOnly', label: 'Verified properties only' });
    if (filters.withPhotos) chips.push({ id: 'withPhotos', label: 'With photos' });

    return chips;
  });

  readonly moreFiltersCount = computed(
    () => this.selectedMoreFilters().length + this.appliedDrawerChips().length
  );

  readonly isMoreFiltersOpen = computed(() =>
    this.variant() === 'toolbar'
      ? this.moreFiltersOverlay.state().isOpen
      : this.showMoreFilters()
  );

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

    this.destroyRef.onDestroy(() => {
      if (this.variant() === 'toolbar' && this.moreFiltersOverlay.state().isOpen) {
        this.moreFiltersOverlay.close();
      }
    });

    this.setupSpeechRecognition();
  }

  setMode(mode: string): void {
    if (mode !== 'buy' && mode !== 'rent') {
      return;
    }

    this.mode.set(mode);
    this.appliedDrawerFilters.update((filters) => ({ ...filters, purpose: 'any' }));
    this.emitFiltersChanged();
  }

  toggleMoreFilters(event?: Event): void {
    if (!this.showMoreFiltersToggle()) {
      return;
    }

    event?.stopPropagation();

    if (this.variant() !== 'toolbar') {
      this.showMoreFilters.update((isOpen) => !isOpen);
      return;
    }

    if (this.moreFiltersOverlay.state().isOpen) {
      this.moreFiltersOverlay.close();
      return;
    }

    this.moreFiltersOverlay.open(
      {
        filters: { ...this.appliedDrawerFilters() },
        chips: this.activeChips().map((chip) => ({ ...chip })),
        selectedChipIds: this.selectedMoreFilters().map((chip) => chip.id)
      },
      {
        onApplied: (result) => this.applyMoreFiltersResult(result)
      }
    );
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

    if (payload.id === 'price') {
      this.appliedDrawerFilters.update((filters) => ({
        ...filters,
        minPrice: '',
        maxPrice: ''
      }));
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

  clearMoreFilters(): void {
    const clearSelections = (chips: FilterChipItem[]) =>
      chips.map((chip) => ({ ...chip, selected: false }));
    this.localBuyChips.update(clearSelections);
    this.localRentChips.update(clearSelections);
    this.appliedDrawerFilters.set({ ...EMPTY_MORE_FILTERS });
    this.emitFiltersChanged();
  }

  removeAppliedDrawerFilter(id: AppliedDrawerChip['id']): void {
    this.appliedDrawerFilters.update((filters) => {
      if (id === 'priceRange') return { ...filters, minPrice: '', maxPrice: '' };
      if (id === 'minArea') return { ...filters, minArea: '', maxArea: '' };
      if (id === 'verifiedOnly' || id === 'withPhotos') return { ...filters, [id]: false };
      return {
        ...filters,
        [id]: id === 'bathrooms' || id === 'furnishing' || id === 'purpose' ? 'any' : ''
      };
    });
    this.emitFiltersChanged();
  }

  updateSearch(value: string): void {
    this.searchQuery.set(value);
    this.syncSearchFieldValue(value);
    this.searchQueryChange.emit(value);
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

  private applyMoreFiltersResult(result: MoreFiltersOverlayResult): void {
    const filters = result.filters;

    if (filters.purpose === 'buy' || filters.purpose === 'rent') {
      this.mode.set(filters.purpose);
    }

    this.appliedDrawerFilters.set({ ...filters });
    const selected = new Set(result.selectedChipIds);
    const store = this.mode() === 'buy' ? this.localBuyChips : this.localRentChips;
    store.update((chips) =>
      chips.map((chip) => ({ ...chip, selected: selected.has(chip.id) }))
    );
    this.emitFiltersChanged();
  }

  private buildPayload(): PropertyFilterPayload {
    const drawer = this.appliedDrawerFilters();
    return {
      mode: this.mode(),
      query: this.searchQuery(),
      fields: this.activeFields(),
      chips: this.activeChips().filter((chip) => chip.selected),
      manualMinPrice: this.parseOptionalNumber(drawer.minPrice),
      manualMaxPrice: this.parseOptionalNumber(drawer.maxPrice),
      purposeOverride:
        drawer.purpose === 'buy'
          ? 'For Sale'
          : drawer.purpose === 'rent'
            ? 'For Rent'
            : undefined
    };
  }

  private parseOptionalNumber(value: string): number | undefined {
    const normalized = value.replace(/,/g, '').trim();
    if (!normalized) return undefined;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
  }

  private formatCompactNumber(value: string): string {
    const parsed = this.parseOptionalNumber(value);
    return parsed === undefined ? value : new Intl.NumberFormat('en-US').format(parsed);
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
