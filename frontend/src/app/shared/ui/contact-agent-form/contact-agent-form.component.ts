import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { InfoCardComponent } from '../info-card/info-card.component';
import { ListingAgent } from '../../../core/models/listing-detail.vm';
import {
  AppointmentBookingPayload,
  AppointmentDateSlots
} from '../../../core/models/appointment.models';
import { AppointmentOverlayComponent } from '../../../features/listings/components/appointment-overlay/appointment-overlay.component';

@Component({
  selector: 'app-contact-agent-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    InfoCardComponent,
    AppointmentOverlayComponent
  ],
  templateUrl: './contact-agent-form.component.html',
  styleUrl: './contact-agent-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactAgentFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly agent = input.required<ListingAgent>();
  readonly submitLabel = input('Request a tour');
  readonly secondary1 = input('Book appointment');
  readonly secondary2 = input('Ask a question');
  readonly defaultMessage = input('');

  readonly listingId = input('');
  readonly listingPrice = input('');
  readonly listingAddress = input('');
  readonly listingImageUrl = input('');
  readonly appointmentDateSlots = input<AppointmentDateSlots[]>([]);

  readonly isAppointmentOpen = signal(false);

  @Output() readonly submitted = new EventEmitter<{
    name: string;
    email: string;
    phone: string;
    message: string;
  }>();

  @Output() readonly appointmentBooked = new EventEmitter<AppointmentBookingPayload>();

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(7)]],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  ngOnInit(): void {
    this.form.patchValue({
      message: this.defaultMessage()
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }

  openBookAppointmentOverlay(): void {
    if (!this.listingId()) return;
    this.isAppointmentOpen.set(true);
  }

  closeBookAppointmentOverlay(): void {
    this.isAppointmentOpen.set(false);
  }

  handleAppointmentConfirmed(payload: AppointmentBookingPayload): void {
    this.appointmentBooked.emit(payload);
    this.isAppointmentOpen.set(false);
  }
}