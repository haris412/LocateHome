import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { FilterChipItem } from '../../../core/models/filter.models';

@Component({
  selector: 'app-filter-chip-group',
  imports: [MatChipsModule, MatIconModule],
  templateUrl: './filter-chip-group.component.html',
  styleUrl: './filter-chip-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterChipGroupComponent {
  readonly items = input.required<readonly FilterChipItem[]>();
  readonly toggled = output<string>();
}