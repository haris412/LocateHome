import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ListingDetailShellComponent } from '../../components/listing-detail-shell/listing-detail-shell.component';
import { LISTING_DETAIL_MOCK } from '../../data/listing-detail.mock';
import { ListingDetailModel } from '../../../../core/models/listing-detail.vm';
import {AppointmentBookingPayload} from "../../../../core/models/appointment.models"; 
import{AppointmentOverlayData} from "../../../../core/models/appointment.models";
import { AppointmentOverlayComponent } from "../../components/appointment-overlay/appointment-overlay.component"; 

@Component({
  selector: 'app-listing-detail-page',
  standalone: true,
  imports: [ListingDetailShellComponent, AppointmentOverlayComponent],
  templateUrl: './listing-detail-page.component.html',
  styleUrl: './listing-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingDetailPageComponent {
  readonly vm = computed<ListingDetailModel>(() => LISTING_DETAIL_MOCK);
   readonly overlayOpen=signal(false);
   readonly overlayData= computed<AppointmentOverlayData>(() => ({
    listing:{
      id: this.vm().id,
       price: this.vm().price,
       address:this.vm().addressLine,
       imageUrl:this.vm().gallery.primaryImage,
    },
    agentName: this.vm().agent.name,
    dateSlots:this.vm().appointmentDateSlots??[],
  }));


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
    this.overlayOpen.set(true);
  }
  onOverlayClosed(): void {
    this.overlayOpen.set(false);
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
  onAppointmentConfirmed(payload: AppointmentBookingPayload): void {
    console.log('appointment booked', payload);
    this.overlayOpen.set(false);
  }

}