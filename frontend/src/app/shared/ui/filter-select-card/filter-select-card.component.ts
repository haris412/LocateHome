import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FilterSelectConfig } from '../../../core/models/filter.models';

@Component({
  selector: 'app-filter-select',
  imports: [MatFormFieldModule, MatSelectModule, MatIconModule],
  templateUrl: './filter-select-card.component.html',
  styleUrl: './filter-select-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterSelectComponent {
  readonly config = input.required<FilterSelectConfig>();
  readonly valueChanged = output<{ id: string; value: string | null }>();

  onSelectionChange(value: string | null): void {
    this.valueChanged.emit({
      id: this.config().id,
      value
    });
  }
}