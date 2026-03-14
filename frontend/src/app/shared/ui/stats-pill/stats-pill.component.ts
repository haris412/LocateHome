import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StatPillItem } from '../../../core/models/home.models';

@Component({
  selector: 'app-stats-pill',
  templateUrl: './stats-pill.component.html',
  styleUrl: './stats-pill.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatsPillComponent {
  readonly item = input.required<StatPillItem>();
}