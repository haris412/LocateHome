import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  computed,
  inject,
  input,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCalendar, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';

import {
  AppointmentBookingPayload,
  AppointmentOverlayData,
  AppointmentSlotStatus,
  AppointmentTimeSlot
} from '../../../../core/models/appointment.models';

@Component({
  selector: 'app-appointment-overlay',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    MatCalendar
  ],
  templateUrl: './appointment-overlay.component.html',
  styleUrl: './appointment-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()]
})
export class AppointmentOverlayComponent {
  private readonly fb = inject(FormBuilder);

  readonly open = input(false);
  readonly data = input.required<AppointmentOverlayData>();

  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly confirmed = new EventEmitter<AppointmentBookingPayload>();

  readonly selectedDate = signal<Date | null>(null);
  readonly selectedSlotId = signal<string | null>(null);
  readonly selectedPeriod = signal<'AM' | 'PM'>('AM');

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(7)]]
  });

  ngOnInit(): void {
    const firstDate = this.data().dateSlots[0]?.date;

    this.form.patchValue({
      name: this.data().initialName ?? '',
      email: this.data().initialEmail ?? '',
      phone: this.data().initialPhone ?? ''
    });

    if (firstDate) {
      this.selectedDate.set(this.parseISODate(firstDate));
    }
  }

  readonly selectedDateKey = computed(() => {
    const value = this.selectedDate();
    return value ? this.formatDateKey(value) : '';
  });

  readonly selectedDateSlots = computed(() => {
    const key = this.selectedDateKey();
    return this.data().dateSlots.find(item => item.date === key)?.slots ?? [];
  });

  readonly amSlots = computed(() =>
    this.selectedDateSlots().filter(slot => slot.meridiem === 'AM')
  );

  readonly pmSlots = computed(() =>
    this.selectedDateSlots().filter(slot => slot.meridiem === 'PM')
  );

  readonly visibleSlots = computed(() =>
    this.selectedPeriod() === 'AM' ? this.amSlots() : this.pmSlots()
  );

  readonly selectedSlot = computed(() =>
    this.selectedDateSlots().find(slot => slot.id === this.selectedSlotId()) ?? null
  );

  readonly selectedDateLabel = computed(() => {
    const value = this.selectedDate();
    return value
      ? value.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
      : 'No date selected';
  });

  onDateChange(date: Date | null): void {
    this.selectedDate.set(date);
    this.selectedSlotId.set(null);
  }

  selectPeriod(period: 'AM' | 'PM'): void {
    this.selectedPeriod.set(period);
    this.selectedSlotId.set(null);
  }

  selectSlot(slot: AppointmentTimeSlot): void {
    if (slot.status === 'booked' || slot.status === 'blocked') {
      return;
    }

    this.selectedSlotId.set(slot.id);
  }

  dateHasAvailability = (date: Date | null): boolean => {
    if (!date) return false;
    return this.data().dateSlots.some(item => item.date === this.formatDateKey(date));
  };

  getSlotStatusText(status: AppointmentSlotStatus, isSelected: boolean): string {
    if (isSelected) return 'Selected';

    switch (status) {
      case 'available':
        return 'Available';
      case 'confirmed':
        return 'Confirmed';
      case 'booked':
        return 'Booked';
      case 'blocked':
        return 'Blocked';
      default:
        return status;
    }
  }

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('appointment-overlay')) {
      this.close();
    }
  }

  confirm(): void {
    if (this.form.invalid || !this.selectedSlot() || !this.selectedDateKey()) {
      this.form.markAllAsTouched();
      return;
    }

    const slot = this.selectedSlot()!;
    const formValue = this.form.getRawValue();

    this.confirmed.emit({
      listingId: this.data().listing.id,
      agentName: this.data().agentName,
      date: this.selectedDateKey(),
      slotId: slot.id,
      slotLabel: slot.label,
      name: formValue.name,
      email: formValue.email,
      phone: formValue.phone
    });
  }

  private formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseISODate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  readonly dateClass = (date: Date): string => {
    const key = this.formatDateKey(date);
    const match = this.data().dateSlots.find(item => item.date === key);

    if (!match) {
      return '';
    }

    const hasAvailable = match.slots.some(
      slot => slot.status === 'available' || slot.status === 'confirmed'
    );

    const allBlocked = match.slots.every(
      slot => slot.status === 'blocked' || slot.status === 'booked'
    );

    if (allBlocked) {
      return 'appointment-calendar-date--blocked';
    }

    if (hasAvailable) {
      return 'appointment-calendar-date--available';
    }

    return '';
  };
}