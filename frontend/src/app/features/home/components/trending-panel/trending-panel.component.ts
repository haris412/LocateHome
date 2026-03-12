import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TrendItem } from '../../../../core/models/home.models';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-trending-panel',
  imports: [MatIconModule],
  templateUrl: './trending-panel.component.html',
  styleUrl: './trending-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrendingPanelComponent {
  readonly items = input.required<readonly TrendItem[]>();
}