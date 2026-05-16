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
  private readonly appointmentOverlay = inject(AppointmentOverlayService);

  readonly detail = signal<PropertyDetailViewModel | null>(null);
  readonly detailLoading = signal(false);
  readonly detailError = signal<string | null>(null);

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

  onNearbyFavoriteToggled(id: string): void {
    console.log('favorite toggled', id);
  }

  onAppointmentConfirmed(payload: AppointmentBookingPayload): void {
    console.log('appointment booked', payload);
  }
}
