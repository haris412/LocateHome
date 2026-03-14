import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  computed,
  inject,
  signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

type SearchMode = 'buy' | 'rent';

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
  imports: [MatIconModule],
  templateUrl: './search-panel.component.html',
  styleUrl: './search-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchPanelComponent {
  private readonly platformId = inject(PLATFORM_ID);
  readonly showMoreFilters = signal(false);

  readonly tabs = signal<readonly SearchTab[]>([
    { id: 'buy', label: 'Buy' },
    { id: 'rent', label: 'Rent' }
  ]);

  readonly activeTab = signal<SearchMode>('buy');

  readonly keyword = signal('“2 bed apartment in downtown Seattle”');
  readonly propertyType = signal('House');

  readonly summaryFields = signal<readonly SearchSummaryField[]>([
    { id: 'city', icon: 'location_on', label: 'City', value: 'New York' },
    { id: 'budget', icon: 'monetization_on', label: 'Budget', value: '$500k - $2.5M' },
    { id: 'bedrooms', icon: 'bed', label: 'Bedrooms', value: 'Any' },
    { id: 'bathrooms', icon: 'bathtub', label: 'Bathrooms', value: 'Any' },
    { id: 'size', icon: 'straighten', label: 'Size', value: '1,000+ sqft' }
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
    const payload = {
      mode: this.activeTab(),
      keyword: this.keyword(),
      propertyType: this.propertyType(),
      fields: this.summaryFields(),
      filters: this.quickChips().filter((chip) => chip.active)
    };

    console.log('search payload', payload);
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