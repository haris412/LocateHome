import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroSectionComponent {
  readonly backgroundImageUrl = input.required<string>();
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
}
