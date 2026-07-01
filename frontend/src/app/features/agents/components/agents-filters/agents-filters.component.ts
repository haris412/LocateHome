import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';

import { AgentFilters } from '@/core/models/agent.model';
import { GooglePlacePrediction } from '@/core/models/google-places.models';
import { AgentsService } from '../../services/agents.service';
import { LocationCatalogService } from '@/core/services/location-catalog.service';

@Component({
  selector: 'app-agents-filters',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatIconModule
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

  readonly locationCtrl = new FormControl('');

  constructor() {
    // Load agencies from API once
    this.agentsService
      .getAgencies()
      .pipe(takeUntilDestroyed())
      .subscribe((names) => this.agencies.set(names));

    // Autocomplete: call Google Places as user types
    this.locationCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((q) => (q && q.trim() ? this.locationCatalog.searchPlaces(q) : of([]))),
      takeUntilDestroyed()
    ).subscribe((preds) => this.suggestions.set(preds));
  }

  onLocationSelected(event: MatAutocompleteSelectedEvent): void {
    const pred = event.option.value as GooglePlacePrediction;
    const { city } = this.locationCatalog.parsePlaceCityNeighborhood(pred);
    this.locationCtrl.setValue(city, { emitEvent: false });
    this.filters.update((f) => ({ ...f, location: city || null }));
  }

  onLocationCleared(): void {
    this.locationCtrl.setValue('');
    this.suggestions.set([]);
    this.filters.update((f) => ({ ...f, location: null }));
  }

  displayPlace = (pred: GooglePlacePrediction | string | null): string => {
    if (!pred) return '';
    if (typeof pred === 'string') return pred;
    return pred.structuredFormat.mainText.text;
  };

  updateFilter(key: keyof AgentFilters, value: string | number | null): void {
    this.filters.update((f) => ({ ...f, [key]: value }));
  }

  applyFilters(): void {
    this.filtersChange.emit(this.filters());
  }
}
