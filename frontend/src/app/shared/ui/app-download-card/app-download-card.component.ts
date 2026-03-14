import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-download-card',
  imports: [MatIconModule],
  templateUrl: './app-download-card.component.html',
  styleUrl: './app-download-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppDownloadCardComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly bullets = input.required<readonly string[]>();
  readonly phoneImageUrl = input.required<string>();
}