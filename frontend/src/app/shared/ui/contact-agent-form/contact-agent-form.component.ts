import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  inject,
  input
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { InfoCardComponent } from '../info-card/info-card.component';
import { PropertyAgent } from '../../../core/models/property-detail.vm';
import {
  AppointmentBookingPayload,
  AppointmentDateSlots,
  AppointmentOverlayData
} from '../../../core/models/appointment.models';
import { InquiryType } from '../../../core/models/inquiry.models';
import { InquiryService } from '../../../core/services/inquiry.service';
import { AppointmentOverlayComponent } from '../../../features/listings/components/appointment-overlay/appointment-overlay.component';
import { AppointmentOverlayService } from '../../services/appointment-overlay.service';

@Component({
  selector: 'app-contact-agent-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    InfoCardComponent
  ],
  templateUrl: './contact-agent-form.component.html',
  styleUrl: './contact-agent-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactAgentFormComponent {
  private readonly fb             = inject(FormBuilder);
  private readonly inquiryService = inject(InquiryService);

  private readonly appointmentOverlay = inject(AppointmentOverlayService);

  // ── Inputs ───────────────────────────────────────────────────────────────

  readonly agent        = input.required<PropertyAgent>();
  readonly submitLabel  = input('Request a tour');
  readonly secondary1   = input('Book appointment');
  readonly secondary2   = input('Ask a question');
  readonly defaultMessage = input('');

  readonly listingId       = input('');
  readonly listingPrice    = input('');
  readonly listingAddress  = input('');
  readonly listingImageUrl = input('');
  readonly appointmentDateSlots = input<AppointmentDateSlots[]>([]);

  @Output() readonly submitted = new EventEmitter<{
    name: string;
    email: string;
    phone: string;
    message: string;
  }>();

  @Output() readonly appointmentBooked = new EventEmitter<AppointmentBookingPayload>();

  // ── Form ─────────────────────────────────────────────────────────────────

  readonly form = this.fb.nonNullable.group({
    name:    ['', [Validators.required, Validators.minLength(2)]],
    email:   ['', [Validators.required, Validators.email]],
    phone:   ['', [Validators.required, Validators.minLength(7)]],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  ngOnInit(): void {
    this.form.patchValue({ message: this.defaultMessage() });
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  submit(type: InquiryType = 'tour'): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, phone, message } = this.form.getRawValue();

    this.inquiryService
      .submit({ propertyId: this.listingId(), type, name, email, phone, message })
      .subscribe({ next: () => this.form.reset() });
  }

  openBookAppointmentOverlay(): void {
    if (!this.listingId()) return;
    const v = this.form.getRawValue();
    const data: AppointmentOverlayData = {
      agentName: this.agent().name,
      agentUserId: this.agent().userId,
      listing: {
        propertyId: this.listingId(),
        imageUrl: this.listingImageUrl(),
        price: this.listingPrice(),
        address: this.listingAddress()
      },
      dateSlots: this.appointmentDateSlots(),
      initialName: v.name,
      initialEmail: v.email,
      initialPhone: v.phone
    };

    this.appointmentOverlay.open(data, {
      onConfirmed: payload => this.handleAppointmentConfirmed(payload)
    });
  }

  handleAppointmentConfirmed(payload: AppointmentBookingPayload): void {
    this.appointmentBooked.emit(payload);
  }
}
