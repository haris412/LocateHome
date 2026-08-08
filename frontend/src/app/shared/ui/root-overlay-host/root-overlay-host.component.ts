import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { AppointmentOverlayComponent } from '../../../features/listings/components/appointment-overlay/appointment-overlay.component';
import { AppointmentBookingPayload } from '../../../core/models/appointment.models';
import { AppointmentOverlayService } from '../../services/appointment-overlay.service';
import { MoreFiltersOverlayService } from '../../services/more-filters-overlay.service';
import { MoreFiltersOverlayComponent } from '../more-filters-overlay/more-filters-overlay.component';
import { MoreFiltersOverlayResult } from '../../../core/models/filter.models';

@Component({
  selector: 'app-root-overlay-host',
  standalone: true,
  imports: [AppointmentOverlayComponent, MoreFiltersOverlayComponent],
  templateUrl: './root-overlay-host.component.html',
  styleUrl: './root-overlay-host.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RootOverlayHostComponent {
  private readonly appointmentOverlay = inject(AppointmentOverlayService);
  private readonly moreFiltersOverlay = inject(MoreFiltersOverlayService);

  readonly state = this.appointmentOverlay.state;
  readonly overlayData = computed(() => this.state().data);
  readonly moreFiltersState = this.moreFiltersOverlay.state;
  readonly moreFiltersData = computed(() => this.moreFiltersState().data);

  closeAppointmentOverlay(): void {
    this.appointmentOverlay.close();
  }

  confirmAppointment(payload: AppointmentBookingPayload): void {
    this.appointmentOverlay.confirm(payload);
  }

  closeMoreFiltersOverlay(): void {
    this.moreFiltersOverlay.close();
  }

  applyMoreFilters(result: MoreFiltersOverlayResult): void {
    this.moreFiltersOverlay.apply(result);
  }
}
