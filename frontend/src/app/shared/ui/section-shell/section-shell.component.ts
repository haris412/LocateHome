import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-section-shell',
  standalone: true,
  templateUrl: './section-shell.component.html',
  styleUrl: './section-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionShellComponent {
  readonly variant = input<'default' | 'soft' | 'dark-gradient'>('default');
  readonly padded = input<boolean>(true);
}