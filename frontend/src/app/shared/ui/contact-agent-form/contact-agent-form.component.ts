import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  effect,
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
import { NgxMaterialIntlTelInputComponent } from 'ngx-material-intl-tel-input';
import { AppointmentOverlayService } from '../../services/appointment-overlay.service';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { catchError, finalize, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

export interface ContactAgentFormData {
  name: string;
  email: string;
  phoneNumber: string;
  message: string;
}

@Component({
  selector: 'app-contact-agent-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatInputModule,
    InfoCardComponent,
    NgxMaterialIntlTelInputComponent,
    
  ],
  templateUrl: './contact-agent-form.component.html',
  styleUrl: './contact-agent-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactAgentFormComponent {
  private readonly fb             = inject(FormBuilder);
  private readonly inquiryService = inject(InquiryService);
  private readonly appointmentOverlay = inject(AppointmentOverlayService);
   private readonly toastr = inject(ToastrService);

  readonly agent = input.required<PropertyAgent>();
  readonly resetTrigger = input(0);
  readonly submitLabel = input('Request a tour');
  readonly secondary1 = input('Book appointment');
  readonly secondary2 = input('Ask a question');
  readonly defaultMessage = input('');

  readonly listingId       = input('');
  readonly listingPrice    = input('');
  readonly listingAddress  = input('');
  readonly listingImageUrl = input('');
  readonly appointmentDateSlots = input<AppointmentDateSlots[]>([]);
   readonly isSubmitting = this.inquiryService.isSubmitting;
  readonly inquiryId    = this.inquiryService.inquiryId;

  @Output() readonly submitted = new EventEmitter<{
    name: string;
    email: string;
    phoneNumber: string;
    message: string;
  }>();

  @Output() readonly appointmentBooked = new EventEmitter<AppointmentBookingPayload>();

  // ── Form ─────────────────────────────────────────────────────────────────

  readonly form = this.fb.nonNullable.group({
    name:    ['', [Validators.required, Validators.minLength(2)]],
    email:   ['', [Validators.required, Validators.email]],
    phoneNumber:   ['', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  constructor() {
    effect(() => {
      if (this.resetTrigger() > 0) this.form.reset();
    });
  }

  ngOnInit(): void {
    this.form.patchValue({ message: this.defaultMessage() });
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  submit(type: InquiryType = 'tour'): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
   
    const { name, email, message } = this.form.getRawValue();
    let { phoneNumber } = this.form.getRawValue(); 
    phoneNumber = phoneNumber?.replace(/\s+/g, '').replace(/-/g, '');
    this.inquiryService
      .submit({
        propertyId: this.listingId(),
        type,
        name,
        email,
        phoneNumber,
        message,
      })
      .pipe(
        catchError((err) => {
          console.error(err);
          this.toastr.error(
            err?.error?.message ?? 'Failed to submit inquiry. Please try again.',
          );
          return throwError(() => err); // keep error flow intact
        }),
        finalize(()=> {
          this.inquiryService.isSubmitting.set(false);
        })
      )
      .subscribe((res) => {
        if(res.success) { 
          this.form.reset();
          this.toastr.success(
            res?.message ?? 'Request submitted successfully',
          );
        }
  });
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
      initialPhone: v.phoneNumber
    };

    this.appointmentOverlay.open(data, {
      onConfirmed: payload => this.handleAppointmentConfirmed(payload)
    });
  }

  handleAppointmentConfirmed(payload: AppointmentBookingPayload): void {
    this.appointmentBooked.emit(payload);
  }
}
