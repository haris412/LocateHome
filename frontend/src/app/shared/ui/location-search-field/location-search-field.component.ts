import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, share, switchMap } from 'rxjs/operators';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { GooglePlacePrediction } from '../../../core/models/google-places.models';
import { LocationCatalogService } from '../../../core/services/location-catalog.service';

// ── Constants ─────────────────────────────────────────────────────────────────

const SUGGESTION_DEBOUNCE_MS = 300;
const SEARCH_DEBOUNCE_MS     = 400;
const MIN_QUERY_LENGTH       = 3;

// ── Types ─────────────────────────────────────────────────────────────────────

export type LocationSearchMode = 'city' | 'area';

// ── Module-level helpers ──────────────────────────────────────────────────────

const ICON_BY_MODE: Record<LocationSearchMode, string> = {
  city: 'location_on',
  area: 'pin_drop'
};

function passesLengthGate(query: string): boolean {
  const len = query.trim().length;
  return len === 0 || len >= MIN_QUERY_LENGTH;
}

function toDisplayName(value: GooglePlacePrediction | string | null | undefined): string {
  if (value == null || typeof value === 'string') return value ?? '';
  return value.structuredFormat.mainText.text;
}

// ── Component ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-location-search-field',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatIconModule],
  templateUrl: './location-search-field.component.html',
  styleUrl: './location-search-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationSearchFieldComponent {
  private readonly catalog = inject(LocationCatalogService);

  // ── Inputs ───────────────────────────────────────────────────────────────────

  readonly mode        = input<LocationSearchMode>('city');
  readonly label       = input('');
  readonly placeholder = input('Search location');
  readonly value       = input('');
  readonly prefixIcon  = input<string | null>(null);
  readonly voiceAction = input(false);
  readonly voiceDisabled = input(false);
  readonly voiceActive = input(false);
  readonly voiceExpanded = input(false);
  readonly listingPageField = input(false);

  // ── Outputs ──────────────────────────────────────────────────────────────────

  readonly searchCommitted = output<string>();
  readonly voiceTriggered = output<void>();

  // ── View state ───────────────────────────────────────────────────────────────

  readonly suggestions = signal<GooglePlacePrediction[]>([]);

  /** Mirrors the [value] input but can diverge while the user is mid-type. */
  readonly draft = linkedSignal(() => this.value());

  readonly icon = computed(() => ICON_BY_MODE[this.mode()]);
  readonly leadingIcon = computed(() => this.prefixIcon() ?? this.icon());

  // ── Template binding for mat-autocomplete [displayWith] ───────────────────────

  readonly toDisplayName = toDisplayName;

  // ── Private reactive pipeline ─────────────────────────────────────────────────

  private readonly rawInput$ = new Subject<string>();

  constructor() {
    /**
     * Gate the raw stream once — both downstream pipes only see queries
     * that are either empty (clear) or long enough to be meaningful.
     */
    const gatedInput$ = this.rawInput$.pipe(
      filter(passesLengthGate),
      share()
    );

    // Autocomplete suggestions
    gatedInput$.pipe(
      debounceTime(SUGGESTION_DEBOUNCE_MS),
      distinctUntilChanged(),
      switchMap(query => query.trim() ? this.catalog.searchPlaces(query) : of([])),
      takeUntilDestroyed()
    ).subscribe(predictions => this.suggestions.set(predictions));

    // Committed search — navigates after the user pauses typing
    gatedInput$.pipe(
      debounceTime(SEARCH_DEBOUNCE_MS),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(query => this.searchCommitted.emit(query));
  }

  // ── Event handlers ────────────────────────────────────────────────────────────

  onInput(event: Event): void {
    const rawValue = (event.target as HTMLInputElement).value;
    this.draft.set(rawValue);
    this.rawInput$.next(rawValue);
    if (rawValue.trim().length < MIN_QUERY_LENGTH) this.suggestions.set([]);
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const prediction  = event.option.value as GooglePlacePrediction;
    const displayName = prediction.structuredFormat.mainText.text;
    this.draft.set(displayName);
    this.searchCommitted.emit(displayName);
  }
}
