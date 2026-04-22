import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

import { SectionShellComponent } from '../../../../shared/ui/section-shell/section-shell.component';
import { StatTileComponent } from '../../../../shared/ui/stat-tile/stat-tile.component';
import { InfoChipComponent } from '../../../../shared/ui/info-chip/info-chip.component';

@Component({
  selector: 'app-valuation-section',
  standalone: true,
  imports: [
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    SectionShellComponent,
    StatTileComponent,
    InfoChipComponent
  ],
  templateUrl: './valuation-section.component.html',
  styleUrl: './valuation-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValuationSectionComponent {
  readonly stats = [
    { label: 'Valuations generated', value: '12,400+' },
    { label: 'Avg. turnaround', value: 'Under 2 min' },
    { label: 'Regions covered', value: 'Multi-market' }
  ];

  readonly summaryTiles = [
    { label: 'Estimated range', value: 'Premium bracket' },
    { label: 'Confidence', value: 'High' },
    { label: 'Updated', value: 'Today' }
  ];
}