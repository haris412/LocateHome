import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FilterMode, FilterTabItem } from '../../../core/models/filter.models';

@Component({
  selector: 'app-filter-segment-tabs',
  templateUrl: './filter-segment-tabs.component.html',
  styleUrl: './filter-segment-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterSegmentTabsComponent {
  readonly items = input.required<readonly FilterTabItem[]>();
  readonly active = input.required<FilterMode>();

  readonly changed = output<FilterMode>();

  selectTab(id: FilterMode): void {
    this.changed.emit(id);
  }
}