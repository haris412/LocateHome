import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { SortOption } from '../../../core/models/filter.models';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-sort-dropdown',
  imports: [MatFormFieldModule, MatSelectModule],
  templateUrl: './sort-dropdown.component.html',
  styleUrl: './sort-dropdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SortDropdownComponent {
  readonly value = input.required<string>();
  readonly options = input.required<readonly SortOption[]>();

  readonly valueChanged = output<string>();
}