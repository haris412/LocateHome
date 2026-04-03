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
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

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
  imports: [MatIconModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './search-panel.component.html',
  styleUrl: './search-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchPanelComponent {
  private readonly platformId = inject(PLATFORM_ID);
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
  readonly area = signal('any');
  readonly city = signal('New York');
  readonly budget = signal('$500k - $2.5M');
  readonly bedrooms = signal('Any');
  readonly bathrooms = signal('Any');
  readonly size = signal('1,000+ sqft');

  // Options for selects
  readonly cityOptions = ['Any', 'New York', 'Seattle', 'Austin', 'Miami', 'Karachi', 'Lahore'];
  readonly provinceOptions = ['Any', 'Ontario', 'Alberta', 'British Columbia'];
  readonly stateOptions = ['Any', 'Toronto', 'Ottawa'];
  readonly areaOptions = ['Any', 'Downtown', 'Midtown', 'Suburbs'];

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
  }

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