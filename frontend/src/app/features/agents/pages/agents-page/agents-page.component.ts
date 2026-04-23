import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentsHeroComponent } from '../../components/agents-hero/agents-hero.component';
import { AgentsFiltersComponent } from '../../components/agents-filters/agents-filters.component';
import { PaginationComponent } from '../../../../shared/ui/pagination/pagination.component';
import { AgentCardComponent } from '../../../..//shared/ui/agent-card/agent-card.component';
import { AgentItem } from '@/core/models/agent.model';

@Component({
  selector: 'app-agents-page',
  standalone: true,
  imports: [
    CommonModule,
    AgentsHeroComponent,
    AgentsFiltersComponent,
    PaginationComponent,
    AgentCardComponent
  ],
  templateUrl: './agents-page.component.html',
  styleUrls: ['./agents-page.component.scss']
})
export class AgentsPageComponent {

  readonly agents = signal<any[]>([
    { id: 1, name: 'Daniel Brooks' },
    { id: 2, name: 'Sophia Bennett' },
    { id: 3, name: 'Omar Khalid' },
    { id: 4, name: 'Ayesha Khan' },
    { id: 5, name: 'Luca Moretti' },
    { id: 6, name: 'Camila Torres' }
  ]);

  readonly currentPage = signal(1);
  readonly totalPages = signal(12);
  readonly allAgents = signal<AgentItem[]>([]);
  readonly filteredAgents = signal<AgentItem[]>([]);

  onFiltersChange(filters: any) {

    const result = this.allAgents().filter(agent => {

      return (
        (!filters.location || agent.contact?.location === filters.location) &&
        (!filters.rating || Number(agent.stats?.rating) >= filters.rating)
      );

    });

    this.filteredAgents.set(result);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }
}