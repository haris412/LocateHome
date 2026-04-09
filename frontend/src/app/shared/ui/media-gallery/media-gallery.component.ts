import { ChangeDetectionStrategy, Component, EventEmitter, computed, input, Output } from '@angular/core';
import { MediaGalleryOverlayComponent } from '../media-gallery-overlay/media-gallery-overlay.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-media-gallery',
  standalone: true,
  imports: [MediaGalleryOverlayComponent, MatIconModule],
  templateUrl: './media-gallery.component.html',
  styleUrl: './media-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaGalleryComponent {
  readonly gallery = input.required<any>();
  /** API listing title — used for image `alt` text */
  readonly listingTitle = input<string>('');
  @Output() readonly openGallery = new EventEmitter<void>();
  @Output() readonly playVideo = new EventEmitter<void>();

  /** Ordered URLs from `gallery.images`, or `[primaryImage]` when the list is empty. */
  readonly displayImages = computed(() => {
    const g = this.gallery();
    const imgs = g.images as string[] | undefined;
    if (imgs?.length) {
      return imgs;
    }
    return g.primaryImage ? [g.primaryImage] : [];
  });

  readonly hasMultipleImages = computed(() => this.displayImages().length > 1);

  /** Photos after the first three thumbnails (primary + two side tiles). */
  readonly extraPhotoCount = computed(() => Math.max(0, this.displayImages().length - 3));

  isOverlayOpen = false;
  selectedIndex = 0;

  openOverlay(index: number): void {
    this.selectedIndex = index;
    this.isOverlayOpen = true;
  }

  closeOverlay(): void {
    this.isOverlayOpen = false;
  }
}
