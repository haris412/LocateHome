import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { AgentFilters } from '@/core/models/agent.model';

@Component({
  selector: 'app-agents-filters',
  imports: [MatFormFieldModule, MatSelectModule, MatInputModule, MatIconModule],
  templateUrl: './agents-filters.component.html',
  styleUrl: './agents-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentsFiltersComponent {
  readonly filtersChange = output<AgentFilters>();

  readonly filters = signal<AgentFilters>({ location: null, agency: null, rating: null });

  readonly locations = ['Beverly Hills', 'Downtown', 'Waterfront'];
  readonly agencies  = ['Urban Key', 'Prime Nest'];
  readonly ratings   = [4.5, 4.7, 4.8];

  updateFilter(key: keyof AgentFilters, value: string | number | null): void {
    this.filters.update(f => ({ ...f, [key]: value }));
  }

  applyFilters(): void {
    this.filtersChange.emit(this.filters());
  }
}
