import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-segmented-tabs',
  standalone: true,
  templateUrl: './segmented-tabs.component.html',
  styleUrl: './segmented-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SegmentTabsComponent {
  readonly active = input.required<'signup' | 'login'>();
  readonly changed = output<'signup' | 'login'>();
}