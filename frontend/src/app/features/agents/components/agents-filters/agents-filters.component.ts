import { Component, EventEmitter, Output, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

export interface AgentFilter {
  location: string | null;
  agency: string | null;
  rating: number | null;
}

@Component({
  selector: 'app-agents-filters',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './agents-filters.component.html',
  styleUrls: ['./agents-filters.component.scss']
})
export class AgentsFiltersComponent {

  @Output() filtersChange = new EventEmitter<AgentFilter>();

  readonly filters = signal<AgentFilter>({
    location: null,
    agency: null,
    rating: null
  });

  locations = ['Beverly Hills', 'Downtown', 'Waterfront'];
  agencies = ['All agencies', 'Urban Key', 'Prime Nest'];
  ratings = [4.5, 4.7, 4.8];

  updateFilter(key: keyof AgentFilter, value: any) {
    this.filters.update(f => ({ ...f, [key]: value }));
  }

  applyFilters() {
    this.filtersChange.emit(this.filters());
  }
}