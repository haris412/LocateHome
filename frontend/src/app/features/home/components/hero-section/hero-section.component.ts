import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { StatPillItem } from '../../../../core/models/home.models';
import { StatsPillComponent } from '../../../../shared/ui/stats-pill/stats-pill.component';

@Component({
  selector: 'app-hero-section',
  imports: [MatIconModule],
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