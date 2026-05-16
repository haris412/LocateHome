import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { GooglePlacePrediction } from '../../../core/models/google-places.models';
import { LocationCatalogService } from '../../../core/services/location-catalog.service';

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

  readonly mode        = input<'city' | 'area'>('city');
  readonly label       = input<string>('');
  readonly placeholder = input<string>('');
  readonly value       = input<string>('');

  readonly valueChanged = output<string>();

  readonly suggestions = signal<GooglePlacePrediction[]>([]);
  readonly draft       = signal('');

  readonly isAreaMode = computed(() => this.mode() === 'area');
  readonly hasCity    = computed(() => this.catalog.selectedCityName() !== null);
  readonly isDisabled = computed(() => this.isAreaMode() && !this.hasCity());

  readonly icon = computed(() => this.isAreaMode() ? 'pin_drop' : 'location_on');
  readonly resolvedLabel       = computed(() => this.label()       || (this.isAreaMode() ? 'Area'        : ''));
  readonly resolvedPlaceholder = computed(() => this.placeholder() || (this.isAreaMode() ? 'Neighbourhood or road' : 'Search city'));

  private readonly query$ = new Subject<string>();

  constructor() {
    effect(() => { this.draft.set(this.value()); });

    // Area mode: clear draft + suggestions when city changes.
    effect(() => {
      if (!this.isAreaMode()) return;
      this.catalog.selectedCityName();
      this.draft.set('');
      this.suggestions.set([]);
    }, { allowSignalWrites: true });

    this.query$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => {
        if (!q.trim()) return of([]);
        const prefix = this.isAreaMode() ? (this.catalog.selectedCityName() ?? '') : '';
        const fullQuery = prefix ? `${prefix} ${q}` : q;
        return this.catalog.searchPlaces(fullQuery);
      }),
      takeUntilDestroyed()
    ).subscribe(preds => this.suggestions.set(preds));
  }

  displayValue = (v: GooglePlacePrediction | string | null | undefined): string => {
    if (v == null || typeof v === 'string') return v ?? '';
    return v.structuredFormat.mainText.text;
  };

  onInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.draft.set(v);
    this.valueChanged.emit(v);
    this.query$.next(v);
    if (!v.trim()) {
      this.suggestions.set([]);
      if (!this.isAreaMode()) this.catalog.setSelectedCityName(null);
    }
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const pred = event.option.value as GooglePlacePrediction;
    if (this.isAreaMode()) {
      const name = pred.structuredFormat.mainText.text;
      this.draft.set(name);
      this.valueChanged.emit(name);
    } else {
      const { city } = this.catalog.parsePlaceCityNeighborhood(pred);
      const name = city || pred.structuredFormat.mainText.text;
      this.catalog.setSelectedCityName(name);
      this.draft.set(name);
      this.valueChanged.emit(name);
    }
  }
}
