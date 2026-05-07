import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { AgentFilters } from '@/core/models/agent.model';
import { AgentsService } from '../../services/agents.service';
import { AgentsFiltersComponent } from '../../components/agents-filters/agents-filters.component';
import { AgentsHeroComponent } from '../../components/agents-hero/agents-hero.component';
import { AgentCardComponent } from '../../../../shared/ui/agent-card/agent-card.component';
import { PaginationComponent } from '../../../../shared/ui/pagination/pagination.component';

const PAGE_SIZE = 6;

@Component({
  selector: 'app-agents-page',
  imports: [AgentsHeroComponent, AgentsFiltersComponent, AgentCardComponent, PaginationComponent],
  templateUrl: './agents-page.component.html',
  styleUrl: './agents-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentsPageComponent {
  private readonly agentsService = inject(AgentsService);

  readonly page    = signal(1);
  readonly loading = signal(false);
  readonly filters = signal<AgentFilters>({ location: null, agency: null, rating: null });

  protected readonly skeletons = new Array<null>(PAGE_SIZE).fill(null);

  private readonly params = computed(() => ({
    page:      this.page(),
    limit:     PAGE_SIZE,
    location:  this.filters().location  ?? undefined,
    minRating: this.filters().rating    ?? undefined,
  }));

  private readonly result$ = toObservable(this.params).pipe(
    switchMap(params => {
      this.loading.set(true);
      return this.agentsService.getAgents(params);
    }),
    tap(() => this.loading.set(false)),
    shareReplay(1)
  );

  readonly agents    = toSignal(this.result$.pipe(map(r => r.items)),      { initialValue: [] });
  readonly pageCount = toSignal(this.result$.pipe(map(r => r.totalPages)), { initialValue: 1 });
  readonly total     = toSignal(this.result$.pipe(map(r => r.total)),      { initialValue: 0 });

  protected onFiltersChange(next: AgentFilters): void {
    this.filters.set(next);
    this.page.set(1);
  }

  protected onPageChange(next: number): void {
    this.page.set(next);
  }
}
