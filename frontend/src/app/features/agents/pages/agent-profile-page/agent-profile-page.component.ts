import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';

import { AgentItem } from '../../../../core/models/agent.model';
import { ListingItem } from '../../../../core/models/listing.models';
import { ListingsService } from '../../../listings/services/listings.service';
import { AgentProfileShellComponent } from '../../components/agent-profile-shell/agent-profile-shell.component';
import { AgentsService } from '../../services/agents.service';

@Component({
  selector: 'app-agent-profile-page',
  standalone: true,
  imports: [AgentProfileShellComponent],
  templateUrl: './agent-profile-page.component.html',
  styleUrl: './agent-profile-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentProfilePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly agentsService = inject(AgentsService);
  private readonly listingsService = inject(ListingsService);

  readonly agent = signal<AgentItem | null>(null);
  readonly listings = signal<ListingItem[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.route.paramMap.pipe(
      map((params) => params.get('id')?.trim() ?? ''),
      tap(() => {
        this.loading.set(true);
        this.error.set(null);
      }),
      switchMap((id) => {
        if (!id) {
          return of({ agent: null as AgentItem | null, listings: [] as ListingItem[] });
        }

        return forkJoin({
          agent: this.agentsService.getAgentById(id),
          listingsResult: this.listingsService.getListings({
            page: 1,
            limit: 6,
            status: 'Published',
            userId: id,
            sortBy: 'createdAt',
            sortOrder: 'desc'
          }).pipe(
            catchError(() => of({ items: [] as ListingItem[], page: 1, totalPages: 1, total: 0 }))
          )
        }).pipe(
          map(({ agent, listingsResult }) => ({ agent, listings: listingsResult.items }))
        );
      }),
      takeUntilDestroyed()
    ).subscribe(({ agent, listings }) => {
      this.loading.set(false);
      this.agent.set(agent);
      this.listings.set(listings);
      this.error.set(agent ? null : 'Could not load this agent profile.');
    });
  }

  onBack(): void {
    history.back();
  }

  onListingSelected(id: string): void {
    this.router.navigate(['/listings', id]);
  }
}
