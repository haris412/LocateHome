import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ListingDetailShellComponent } from '../../components/listing-detail-shell/listing-detail-shell.component';
import { ListingsService } from '../../services/listings.service';
import { mapApiPropertyToDetailView } from '../../utils/map-api-property-to-detail-vm';
import { PropertyDetailViewModel } from '../../../../core/models/property-detail.vm';
import {
  AppointmentBookingPayload,
  AppointmentOverlayData
} from '../../../../core/models/appointment.models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConversationService } from '../../services/conversation.service';
import { CreateConversationDto } from '@/features/auth/models/conversation.model';
import { ContactAgentFormData } from '@/shared/ui/contact-agent-form/contact-agent-form.component';
import { AppointmentOverlayService } from '../../../../shared/services/appointment-overlay.service';

@Component({
  selector: 'app-listing-detail-page',
  standalone: true,
  imports: [ListingDetailShellComponent],
  templateUrl: './listing-detail-page.component.html',
  styleUrl: './listing-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly listingsService = inject(ListingsService);
  private readonly conversationService = inject(ConversationService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly appointmentOverlay = inject(AppointmentOverlayService);

  readonly detail = signal<PropertyDetailViewModel | null>(null);
  readonly detailLoading = signal(false);
  readonly detailError = signal<string | null>(null);
  readonly resetInquiryForm = signal(0);

  private buildOverlayData(detail: PropertyDetailViewModel): AppointmentOverlayData {
    return {
      listing: {
        propertyId: detail.id,
        price: detail.price,
        address: detail.addressLine,
        imageUrl: detail.gallery.primaryImage
      },
      agentName: detail.agent.name,
      agentUserId: detail.agent.userId,
      dateSlots: detail.appointmentDateSlots ?? [],
      initialName: '',
      initialEmail: detail.agent.email ?? '',
      initialPhone: detail.agent.phone ?? ''
    };
  }

  constructor() {
    this.route.paramMap
      .pipe(
        map(p => p.get('id')?.trim() ?? ''),
        tap(() => {
          this.detailLoading.set(true);
          this.detailError.set(null);
        }),
        switchMap(id => {
          if (!id) {
            this.detailLoading.set(false);
            return of({ vm: null as PropertyDetailViewModel | null, err: 'Missing listing id.' });
          }
          return this.listingsService.getPropertyById(id).pipe(
            map(api => {
              const vm = api ? mapApiPropertyToDetailView(api) : null;
              return {
                vm,
                err: vm ? null : ('Could not load this property.' as string | null)
              };
            }),
            tap(() => this.detailLoading.set(false))
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe(({ vm, err }) => {
        this.detail.set(vm);
        this.detailError.set(err);
        if (!vm) {
          this.appointmentOverlay.close();
        }
      });
  }

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
    const detail = this.detail();
    if (!detail) return;

    this.appointmentOverlay.open(this.buildOverlayData(detail), {
      onConfirmed: payload => this.onAppointmentConfirmed(payload)
    });
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

  onInquirySubmitted(inquiry: ContactAgentFormData): void {
    console.log('inquiry submitted', inquiry);
    let payload: CreateConversationDto = {
      propertyId: this.detail()?.id ?? '',
      propertyTitle: this.detail()?.listingTitle ?? '',
      propertyPrice: this.detail()?.price ?? '',
      recipientId: this.detail()?.agent.userId ?? '',
      sellerName: this.detail()?.agent.name ?? '',
      senderEmail: inquiry.email ?? '',
      senderName: inquiry.name ?? '',
      senderPhone: inquiry.phone ?? '',
      message: inquiry.message ?? ''
    };

    this.conversationService.create(payload).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.snackBar.open(res.message ?? 'Inquiry sent successfully.', 'Close', { duration: 4000 });
          this.resetInquiryForm.update(v => v + 1);
        } else {
          this.snackBar.open(res?.message ?? 'Failed to send inquiry. Please try again.', 'Close', { duration: 4000 });
        }
      },
      error: (err) => {
        this.snackBar.open(err?.error?.message ?? 'Failed to send inquiry. Please try again.', 'Close', { duration: 4000 });
      }
    });
  }

  onNearbyFavoriteToggled(id: string): void {
    console.log('favorite toggled', id);
  }

  onAppointmentConfirmed(payload: AppointmentBookingPayload): void {
    console.log('appointment booked', payload);
  }
}
