import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { AgentItem } from '../../../../core/models/agent.model';
import { ListingItem } from '../../../../core/models/listing.models';
import { InfoCardComponent } from '../../../../shared/ui/info-card/info-card.component';
import { ListingCardComponent } from '../../../../shared/ui/listing-card/listing-card.component';
import { SectionHeadingComponent } from '../../../../shared/ui/section-heading/section-heading.component';
import { StatCardComponent } from '../../../../shared/ui/stat-card/stat-card.component';

@Component({
  selector: 'app-agent-profile-shell',
  standalone: true,
  imports: [
    MatIconModule,
    RouterLink,
    InfoCardComponent,
    ListingCardComponent,
    SectionHeadingComponent,
    StatCardComponent
  ],
  templateUrl: './agent-profile-shell.component.html',
  styleUrl: './agent-profile-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentProfileShellComponent {
  readonly agent = input.required<AgentItem>();
  readonly listings = input<ListingItem[]>([]);

  @Output() readonly back = new EventEmitter<void>();
  @Output() readonly listingSelected = new EventEmitter<string>();
}
