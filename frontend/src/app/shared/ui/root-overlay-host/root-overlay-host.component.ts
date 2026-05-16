import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { AppointmentOverlayComponent } from '../../../features/listings/components/appointment-overlay/appointment-overlay.component';
import { AppointmentBookingPayload } from '../../../core/models/appointment.models';
import { AppointmentOverlayService } from '../../services/appointment-overlay.service';

@Component({
  selector: 'app-root-overlay-host',
  standalone: true,
  imports: [AppointmentOverlayComponent],
  templateUrl: './root-overlay-host.component.html',
  styleUrl: './root-overlay-host.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RootOverlayHostComponent {
  private readonly appointmentOverlay = inject(AppointmentOverlayService);

  readonly state = this.appointmentOverlay.state;
  readonly overlayData = computed(() => this.state().data);

  closeAppointmentOverlay(): void {
    this.appointmentOverlay.close();
  }

  confirmAppointment(payload: AppointmentBookingPayload): void {
    this.appointmentOverlay.confirm(payload);
  }
}
