import { ChangeDetectionStrategy, Component, EventEmitter, input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-section-heading',
  imports: [MatIconModule, RouterLink],
  templateUrl: './section-heading.component.html',
  styleUrl: './section-heading.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionHeadingComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly linkLabel = input<string>('');
  readonly linkHref  = input<string>('');
  readonly subText = input<string>('');
  readonly icon = input<string>('info');
  readonly imgSrc = input<string>('');
  readonly actionLabel = input<string>('');
  readonly isBorderless = input<boolean>(false);

  @Output() readonly actionClick = new EventEmitter<void>();
}