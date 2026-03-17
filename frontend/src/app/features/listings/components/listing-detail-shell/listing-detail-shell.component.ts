import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ListingDetailModel } from '../../../../core/models/listing-detail.vm';
import { InfoCardComponent } from '../../../../shared/ui/info-card/info-card.component';
import { MediaGalleryComponent } from '../../../../shared/ui/media-gallery/media-gallery.component';
import { AmenitiesGridComponent } from '../../../../shared/ui/amenities-grid/amenities-grid.component';
import { VideoStripComponent } from '../../../../shared/ui/video-strip/video-strip.component';
import { ContactAgentFormComponent } from '../../../../shared/ui/contact-agent-form/contact-agent-form.component';

// Replace this import with your actual existing shared listing card component path if needed.
import { ListingCardComponent } from '../../../../shared/ui/listing-card/listing-card.component';
import { SectionHeadingComponent } from 'src/app/shared/ui/section-heading/section-heading.component';
import { StatCardComponent } from 'src/app/shared/ui/stat-card/stat-card.component';
import { ListingsCarouselSectionComponent } from 'src/app/shared/ui/listings-carousel-section/listings-carousel-section.component';

@Component({
  selector: 'app-listing-detail-shell',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    InfoCardComponent,
    SectionHeadingComponent,
    StatCardComponent,
    MediaGalleryComponent,
    AmenitiesGridComponent,
    VideoStripComponent,
    ContactAgentFormComponent,
    ListingCardComponent,
    ListingsCarouselSectionComponent
  ],
  templateUrl: './listing-detail-shell.component.html',
  styleUrl: './listing-detail-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingDetailShellComponent {
  readonly vm = input.required<ListingDetailModel>();

  @Output() readonly back = new EventEmitter<void>();
  @Output() readonly share = new EventEmitter<void>();
  @Output() readonly save = new EventEmitter<void>();
  @Output() readonly scheduleVisit = new EventEmitter<void>();
  @Output() readonly openGallery = new EventEmitter<void>();
  @Output() readonly playVideo = new EventEmitter<void>();
  @Output() readonly viewAllVideos = new EventEmitter<void>();
  @Output() readonly videoSelected = new EventEmitter<string>();
  @Output() readonly inquirySubmitted = new EventEmitter<{
    name: string;
    email: string;
    phone: string;
    message: string;
  }>();
  @Output() readonly nearbyFavoriteToggled = new EventEmitter<string>();
}