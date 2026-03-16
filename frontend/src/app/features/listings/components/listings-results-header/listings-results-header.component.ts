import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SortOption } from '../../../../core/models/filter.models';
import { SortDropdownComponent } from '../../../../shared/ui/sort-dropdown/sort-dropdown.component';
import { MatIconModule } from '@angular/material/icon';

export type ListingsViewMode = 'grid' | 'list';

@Component({
  selector: 'app-listings-results-header',
  imports: [SortDropdownComponent, MatIconModule],
  templateUrl: './listings-results-header.component.html',
  styleUrl: './listings-results-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingsResultsHeaderComponent {
  readonly resultsCount = input.required<number>();
  readonly selectedSort = input.required<string>();
  readonly sortOptions = input.required<readonly SortOption[]>();
  readonly selectedView = input<ListingsViewMode>('grid');

  readonly sortChanged = output<string>();
  readonly viewChanged = output<ListingsViewMode>();
}