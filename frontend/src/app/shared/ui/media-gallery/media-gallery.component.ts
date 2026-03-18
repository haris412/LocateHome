import { ChangeDetectionStrategy, Component, EventEmitter, input, Output } from '@angular/core';
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
  @Output() readonly openGallery = new EventEmitter<void>();
  @Output() readonly playVideo = new EventEmitter<void>();

  get topImage(): string {
    return this.gallery().images?.[1] || this.gallery().primaryImage;
  }

  get bottomImage(): string {
    return this.gallery().images?.[2] || this.gallery().primaryImage;
  }

  isOverlayOpen = false;
  selectedIndex = 0;

  get images(): string[] {
    return this.gallery().images || [
      this.gallery().primaryImage,
      this.gallery().topImage,
      this.gallery().bottomImage
    ];
  }

  openOverlay(index: number) {
    this.selectedIndex = index;
    this.isOverlayOpen = true;
  }

  closeOverlay() {
    this.isOverlayOpen = false;
  }
}