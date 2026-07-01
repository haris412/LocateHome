import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { AgentFilters, AgentItem } from '@/core/models/agent.model';
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
  private readonly route         = inject(ActivatedRoute);
  private readonly router        = inject(Router);
  private readonly agentsService = inject(AgentsService);

  readonly agents    = signal<AgentItem[]>([]);
  readonly pageCount = signal(1);
  readonly total     = signal(0);
  readonly page      = signal(1);
  readonly loading   = signal(false);

  protected readonly skeletons = new Array<null>(PAGE_SIZE).fill(null);

  constructor() {
    this.route.queryParamMap
      .pipe(
        takeUntilDestroyed(),
        tap(() => this.loading.set(true)),
        switchMap((params) => {
          const p = Number(params.get('page')) || 1;
          this.page.set(p);

          return this.agentsService.getAgents({
            page:       p,
            limit:      PAGE_SIZE,
            location:   params.get('location')   ?? undefined,
            agencyName: params.get('agencyName') ?? undefined,
            minRating:  params.get('minRating')  ? Number(params.get('minRating')) : undefined,
          }).pipe(
            catchError(() => of({ items: [] as AgentItem[], page: 1, totalPages: 1, total: 0 }))
          );
        }),
        tap(() => this.loading.set(false))
      )
      .subscribe((result) => {
        this.agents.set(result.items);
        this.pageCount.set(result.totalPages);
        this.total.set(result.total);
      });
  }

  protected onFiltersChange(next: AgentFilters): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page:       1,
        location:   next.location   || null,
        agencyName: next.agency     || null,
        minRating:  next.rating     || null,
      },
      queryParamsHandling: 'merge'
    });
  }

  protected onPageChange(next: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: next },
      queryParamsHandling: 'merge'
    });
  }
}
