import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { ListingDetailShellComponent } from '../../components/listing-detail-shell/listing-detail-shell.component';
import { LISTING_DETAIL_MOCK } from '../../data/listing-detail.mock';
import { ListingDetailModel } from '../../../../core/models/listing-detail.vm';

@Component({
  selector: 'app-listing-detail-page',
  standalone: true,
  imports: [ListingDetailShellComponent],
  templateUrl: './listing-detail-page.component.html',
  styleUrl: './listing-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingDetailPageComponent {
  readonly vm = computed<ListingDetailModel>(() => LISTING_DETAIL_MOCK);

  onBack(): void {
    history.back();
  }

  onShare(): void {
    console.log('share');
  }

  onSave(): void {
    console.log('save');
  }

  onScheduleVisit(): void {
    console.log('schedule visit');
  }

  onOpenGallery(): void {
    console.log('open gallery');
  }

  onPlayVideo(): void {
    console.log('play video');
  }

  onViewAllVideos(): void {
    console.log('view all videos');
  }

  onVideoSelected(videoId: string): void {
    console.log('video selected', videoId);
  }

  onInquirySubmitted(payload: {
    name: string;
    email: string;
    phone: string;
    message: string;
  }): void {
    console.log('inquiry submitted', payload);
  }

  onNearbyFavoriteToggled(id: string): void {
    console.log('favorite toggled', id);
  }
}