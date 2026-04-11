import { ChangeDetectionStrategy, Component, PLATFORM_ID, computed, effect, inject, input, output, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { take } from 'rxjs';

import { GeoNamePlace } from '../../../core/models/geonames.models';
import { LocationCatalogService } from '../../../core/services/location-catalog.service';

@Component({
  selector: 'app-location-city-field',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatIconModule],
  templateUrl: './location-city-field.component.html',
  styleUrl: './location-city-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationCityFieldComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly catalog = inject(LocationCatalogService);

  readonly label = input<string>('City');
  readonly placeholder = input<string>('Search city');
  readonly value = input<string>('');

  readonly valueChanged = output<string>();

  readonly allPlaces = signal<GeoNamePlace[]>([]);
  readonly draft = signal('');

  readonly filteredPlaces = computed(() =>
    this.catalog.filterPlacesByTerm(this.allPlaces(), this.draft(), 50)
  );

  constructor() {
    effect(() => {
      this.draft.set(this.value());
    });

    if (isPlatformBrowser(this.platformId)) {
      this.catalog
        .loadCitiesForProvince('any')
        .pipe(take(1))
        .subscribe((places) => this.allPlaces.set(places));
    }
  }

  displayPlace = (v: GeoNamePlace | string | null | undefined): string => {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    return v.toponymName || v.name;
  };

  onInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.draft.set(v);
    this.valueChanged.emit(v);
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const place = event.option.value as GeoNamePlace;
    this.catalog.setSelectedCityPlace(place);
    const label = place.toponymName || place.name;
    this.draft.set(label);
    this.valueChanged.emit(label);
  }
}
