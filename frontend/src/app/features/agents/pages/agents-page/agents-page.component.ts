import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgentsHeroComponent } from '../../components/agents-hero/agents-hero.component';
import { AgentsFiltersComponent, AgentFilters } from '../../components/agents-filters/agents-filters.component';
import { PaginationComponent } from '../../../../shared/ui/pagination/pagination.component';
import { AgentCardComponent } from '../../../../shared/ui/agent-card/agent-card.component';

import { AgentItem } from '@/core/models/agent.model';
import { AGENTS_MOCK } from '../../mocks/agents.mock';

@Component({
  selector: 'app-agents-page',
  imports: [
    CommonModule,
    AgentsHeroComponent,
    AgentsFiltersComponent,
    PaginationComponent,
    AgentCardComponent
  ],
  templateUrl: './agents-page.component.html',
  styleUrl: './agents-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentsPageComponent {
  // pagination
  readonly page = signal(1);
  readonly pageSize = signal(6);

  // data
  readonly allAgents = signal<readonly AgentItem[]>(AGENTS_MOCK);
  readonly filters = signal<AgentFilters>({
    location: null,
    agency: null,
    rating: null
  });

  // derived
  readonly filteredAgents = computed(() => {
    const { location, agency, rating } = this.filters();

    return this.allAgents().filter(agent => {
      const matchesLocation = !location || agent.contact?.location === location;
      const matchesAgency = !agency || agent.role === agency; // adjust if you later add real agency field
      const matchesRating = rating == null || agent.stats.rating >= rating;

      return matchesLocation && matchesAgency && matchesRating;
    });
  });

  readonly pageCount = computed(() => {
    const total = this.filteredAgents().length;
    return Math.max(1, Math.ceil(total / this.pageSize()));
  });

  readonly pagedAgents = computed(() => {
    const totalPages = this.pageCount();
    const p = clamp(this.page(), 1, totalPages);

    // keep page signal valid when filters reduce results
    if (p !== this.page()) this.page.set(p);

    const size = this.pageSize();
    const start = (p - 1) * size;

    return this.filteredAgents().slice(start, start + size);
  });

  onFiltersChange(next: AgentFilters) {
    this.filters.set(next);
    this.page.set(1);
  }

  onPageChange(next: number) {
    this.page.set(clamp(next, 1, this.pageCount()));
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}