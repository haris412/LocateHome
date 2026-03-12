import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AppDownloadCardComponent } from '../../../../shared/ui/app-download-card/app-download-card.component';

@Component({
  selector: 'app-app-promo-section',
  imports: [AppDownloadCardComponent],
  templateUrl: './app-promo-section.component.html',
  styleUrl: './app-promo-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppPromoSectionComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly bullets = input.required<readonly string[]>();
  readonly phoneImageUrl = input.required<string>();
}