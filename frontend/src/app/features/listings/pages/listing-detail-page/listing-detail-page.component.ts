import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ListingDetailShellComponent } from '../../components/listing-detail-shell/listing-detail-shell.component';
import { AppointmentOverlayComponent } from '../../components/appointment-overlay/appointment-overlay.component';
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

@Component({
  selector: 'app-listing-detail-page',
  standalone: true,
  imports: [ListingDetailShellComponent, AppointmentOverlayComponent],
  templateUrl: './listing-detail-page.component.html',
  styleUrl: './listing-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly listingsService = inject(ListingsService);
  private readonly conversationService = inject(ConversationService);
  private readonly snackBar = inject(MatSnackBar);

  readonly detail = signal<PropertyDetailViewModel | null>(null);
  readonly detailLoading = signal(false);
  readonly detailError = signal<string | null>(null);

  readonly overlayOpen = signal(false);
  readonly resetInquiryForm = signal(0);

  readonly overlayData = computed((): AppointmentOverlayData | null => {
    const d = this.detail();
    if (!d) {
      return null;
    }
    return {
      listing: {
        propertyId: d.id,
        price: d.price,
        address: d.addressLine,
        imageUrl: d.gallery.primaryImage
      },
      agentName: d.agent.name,
      agentUserId: d.agent.userId,
      dateSlots: d.appointmentDateSlots ?? [],
      initialName: '',
      initialEmail: d.agent.email ?? '',
      initialPhone: d.agent.phone ?? ''
    };
  });

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
          this.overlayOpen.set(false);
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
          this.overlayOpen.set(false);
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
    this.overlayOpen.set(false);
  }
}
