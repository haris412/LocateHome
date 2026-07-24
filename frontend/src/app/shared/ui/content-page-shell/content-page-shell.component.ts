import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-content-page-shell',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './content-page-shell.component.html',
  styleUrl: './content-page-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentPageShellComponent {
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly eyebrow = input<string>('');
  readonly icon = input<string>('');
  readonly meta = input<string>('');
  readonly width = input<'narrow' | 'medium' | 'wide'>('medium');
}
