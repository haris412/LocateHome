import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ListingVideoItem } from '../../../core/models/listing-detail.vm';

import { SectionHeadingComponent } from '../section-heading/section-heading.component';

@Component({
  selector: 'app-video-strip',
  standalone: true,
  imports: [MatIconModule, SectionHeadingComponent],
  templateUrl: './video-strip.component.html',
  styleUrl: './video-strip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoStripComponent {
  readonly title = input('Property videos');
  readonly subtitle = input('');
  readonly actionLabel = input('View all videos');
  readonly videos = input<ListingVideoItem[]>([]);

  @Output() readonly viewAll = new EventEmitter<void>();
  @Output() readonly videoSelected = new EventEmitter<string>();
}