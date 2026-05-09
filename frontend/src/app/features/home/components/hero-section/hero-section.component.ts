import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StatPillItem } from '../../../../core/models/home.models';

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
  readonly stats = input.required<readonly StatPillItem[]>();
}
