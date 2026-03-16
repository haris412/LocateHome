import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ListingDetailModel } from '../../../core/models/listing-detail.vm';

@Component({
  selector: 'app-media-gallery',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './media-gallery.component.html',
  styleUrl: './media-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaGalleryComponent {
  readonly gallery = input.required<ListingDetailModel['gallery']>();

  @Output() readonly openGallery = new EventEmitter<void>();
  @Output() readonly playVideo = new EventEmitter<void>();

  get topImage(): string {
    return this.gallery().images?.[1] || this.gallery().primaryImage;
  }

  get bottomImage(): string {
    return this.gallery().images?.[2] || this.gallery().primaryImage;
  }
}