import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StatTileComponent } from '../../../../shared/ui/stat-tile/stat-tile.component';
import { InfoChipComponent } from '../../../../shared/ui/info-chip/info-chip.component';

@Component({
  selector: 'app-valuation-section',
  standalone: true,
  imports: [
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

}
