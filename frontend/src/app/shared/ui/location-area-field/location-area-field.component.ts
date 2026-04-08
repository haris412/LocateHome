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
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { OsmLocationPickItem } from '../../../core/models/overpass.models';
import { LocationCatalogService } from '../../../core/services/location-catalog.service';

@Component({
  selector: 'app-location-area-field',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatIconModule],
  templateUrl: './location-area-field.component.html',
  styleUrl: './location-area-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationAreaFieldComponent {
  private readonly catalog = inject(LocationCatalogService);

  readonly label = input<string>('Area');
  readonly placeholder = input<string>('Neighbourhood, road, restaurant');
  readonly value = input<string>('');

  readonly valueChanged = output<string>();

  readonly suggestions = signal<OsmLocationPickItem[]>([]);
  readonly draft = signal('');

  readonly cityPlace = this.catalog.selectedCityPlace;
  readonly hasCity = computed(() => this.cityPlace() !== null);

  readonly filteredItems = computed(() =>
    this.catalog.filterAreaSuggestionsByTerm(this.suggestions(), this.draft(), 80)
  );

  constructor() {
    effect(() => {
      this.draft.set(this.value());
    });

    effect((onCleanup) => {
      const place = this.catalog.selectedCityPlace();
      if (!place) {
        this.suggestions.set([]);
        return;
      }
      const lat = Number(place.lat);
      const lng = Number(place.lng);
      const sub = this.catalog.getAreaSuggestionsAround(lat, lng).subscribe({
        next: (items) => this.suggestions.set(items),
        error: () => this.suggestions.set([])
      });
      onCleanup(() => sub.unsubscribe());
    });
  }

  displayItem = (v: OsmLocationPickItem | string | null | undefined): string => {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    return v.name;
  };

  optionLabel(item: OsmLocationPickItem): string {
    const k = item.kind.charAt(0).toUpperCase() + item.kind.slice(1);
    return `${item.name} · ${k}`;
  }

  onInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.draft.set(v);
    this.catalog.setSelectedAreaPick(null);
    this.valueChanged.emit(v);
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const item = event.option.value as OsmLocationPickItem;
    this.catalog.setSelectedAreaPick(item);
    this.draft.set(item.name);
    this.valueChanged.emit(item.name);
  }
}
