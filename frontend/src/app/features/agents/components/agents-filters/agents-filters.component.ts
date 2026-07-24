import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged, filter, map, of, switchMap, tap } from 'rxjs';

import { AgentFilters } from '@/core/models/agent.model';
import { GooglePlacePrediction } from '@/core/models/google-places.models';
import { AgentsService } from '../../services/agents.service';
import { LocationCatalogService } from '@/core/services/location-catalog.service';
import { FilterShellComponent } from '../../../../shared/ui/filter-shell/filter-shell.component';

@Component({
  selector: 'app-agents-filters',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatIconModule,
    FilterShellComponent
  ],
  templateUrl: './agents-filters.component.html',
  styleUrl: './agents-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentsFiltersComponent {
  private readonly agentsService   = inject(AgentsService);
  private readonly locationCatalog = inject(LocationCatalogService);

  readonly filtersChange = output<AgentFilters>();

  readonly filters     = signal<AgentFilters>({ location: null, agency: null, rating: null });
  readonly agencies    = signal<string[]>([]);
  readonly suggestions = signal<GooglePlacePrediction[]>([]);
  readonly ratings     = [4, 4.5, 4.7, 4.8];

  readonly locationCtrl = new FormControl<string | GooglePlacePrediction>('', { nonNullable: true });

  constructor() {
    // Load agencies from API once
    this.agentsService
      .getAgencies()
      .pipe(takeUntilDestroyed())
      .subscribe((names) => this.agencies.set(names));

    // Autocomplete: call Google Places as user types
    this.locationCtrl.valueChanges.pipe(
      map((value) => typeof value === 'string' ? value.trim() : null),
      debounceTime(200),
      filter((query): query is string => query !== null),
      distinctUntilChanged(),
      tap((query) => {
        const location = query || null;
        if (this.filters().location !== location) {
          this.filters.update((current) => ({ ...current, location }));
          this.emitFilters();
        }
      }),
      switchMap((query) => query ? this.locationCatalog.searchPlaces(query) : of([])),
      takeUntilDestroyed()
    ).subscribe((preds) => this.suggestions.set(preds));
  }

  onLocationSelected(event: MatAutocompleteSelectedEvent): void {
    const pred = event.option.value as GooglePlacePrediction;
    const { city } = this.locationCatalog.parsePlaceCityNeighborhood(pred);
    this.locationCtrl.setValue(city, { emitEvent: false });
    this.filters.update((f) => ({ ...f, location: city || null }));
    this.emitFilters();
  }

  onLocationCleared(): void {
    this.locationCtrl.setValue('');
    this.suggestions.set([]);
    this.filters.update((f) => ({ ...f, location: null }));
    this.emitFilters();
  }

  displayPlace = (pred: GooglePlacePrediction | string | null): string => {
    if (!pred) return '';
    if (typeof pred === 'string') return pred;
    return pred.structuredFormat.mainText.text;
  };

  updateFilter(key: keyof AgentFilters, value: string | number | null): void {
    this.filters.update((f) => ({ ...f, [key]: value }));
    this.emitFilters();
  }

  private emitFilters(): void {
    this.filtersChange.emit(this.filters());
  }
}
