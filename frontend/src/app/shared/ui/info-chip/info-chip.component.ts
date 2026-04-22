import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-info-chip',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './info-chip.component.html',
  styleUrl: './info-chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoChipComponent {
  readonly label = input.required<string>();
  readonly icon = input<string>('');
  readonly dark = input<boolean>(false);
}