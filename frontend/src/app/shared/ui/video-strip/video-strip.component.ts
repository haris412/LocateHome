import { ChangeDetectionStrategy, Component, EventEmitter, Output, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PropertyVideoItem } from '../../../core/models/property-detail.vm';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';
import { VideoGalleryOverlayComponent } from '../video-gallery-overlay/video-gallery-overlay.component';

@Component({
  selector: 'app-video-strip',
  standalone: true,
  imports: [MatIconModule, SectionHeadingComponent, VideoGalleryOverlayComponent],
  templateUrl: './video-strip.component.html',
  styleUrl: './video-strip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoStripComponent {
  readonly title = input('Property videos');
  readonly subtitle = input('');
  readonly actionLabel = input('View all videos');
  readonly videos = input<PropertyVideoItem[]>([]);

  @Output() readonly viewAll = new EventEmitter<void>();
  @Output() readonly videoSelected = new EventEmitter<string>();

  readonly isOverlayOpen = signal(false);
  readonly selectedIndex = signal(0);

  openVideo(index: number): void {
    this.selectedIndex.set(index);
    this.isOverlayOpen.set(true);
    this.videoSelected.emit(this.videos()[index]?.id || '');
  }

  openAll(): void {
    this.selectedIndex.set(0);
    this.isOverlayOpen.set(true);
    this.viewAll.emit();
  }

  closeOverlay(): void {
    this.isOverlayOpen.set(false);
  }
}