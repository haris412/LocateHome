import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  Output,
  computed,
  effect,
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable, Subscription, forkJoin, of, throwError } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { ListingsService } from '../../services/listings.service';

import {
  AppointmentBookingPayload,
  AppointmentDateSlots,
  AppointmentOverlayData,
  AppointmentSlotStatus,
  AppointmentTimeSlot
} from '../../../../core/models/appointment.models';
import { AppointmentBookingService } from '../../services/appointment-booking.service';
import {
  WeeklyAvailability,
  mergeWeeklyAvailabilityAndAppointments,
  parseAppointmentsResponse,
  parseWeeklyAvailabilityResponse
} from '../../utils/appointment-schedule.util';

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
    MatCalendar,
    MatSnackBarModule
  ],
  templateUrl: './appointment-overlay.component.html',
  styleUrl: './appointment-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()]
})
export class AppointmentOverlayComponent {
  private readonly fb = inject(FormBuilder);
  private readonly appointmentApi = inject(AppointmentBookingService);
  private readonly listingsService = inject(ListingsService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private fetchSub: Subscription | null = null;
  private propertyIdSub: Subscription | null = null;

  /**
   * `_id` from GET /api/properties?page=1&limit=20&sortBy=createdAt&sortOrder=desc
   * when it matches `data().listing.propertyId`; otherwise falls back to parent id.
   */
  readonly propertyIdFromPropertiesApi = signal<string | null>(null);

  /** User id used for availability / bookings (prefer owner id from GET /api/properties match). */
  private readonly scheduleUserId = signal<string | null>(null);

  readonly open = input(false);
  readonly data = input.required<AppointmentOverlayData>();

  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly confirmed = new EventEmitter<AppointmentBookingPayload>();

  /** Loaded from availability + appointments APIs when agentUserId is set */
  readonly liveSchedule = signal<AppointmentDateSlots[] | null>(null);
  readonly scheduleLoading = signal(false);
  readonly scheduleError = signal<string | null>(null);
  readonly confirmLoading = signal(false);
  readonly confirmError = signal<string | null>(null);
  readonly resolvedAgentName = signal<string | null>(null);

  /** Kept in sync when availability loads so we can re-merge after POST with a fresh GET /appointments/user. */
  private readonly weeklyAvailabilityCache = signal<WeeklyAvailability | null>(null);

  private readonly now = signal(new Date());
  readonly today = computed(() => this.startOfDay(new Date()));
  private readonly horizonDays = 60;

  readonly upcomingDateKeys = computed(() => {
    const start = this.today();
    const out: string[] = [];
    for (let i = 0; i <= this.horizonDays; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      out.push(this.formatDateKey(d));
    }
    return out;
  });
  readonly dateFilter = (d: Date | null): boolean => {
    if (!d) return false;
    return d.getTime() >= this.today().getTime();
  };

  readonly selectedDate = signal<Date | null>(null);
  readonly selectedSlotId = signal<string | null>(null);
  readonly selectedPeriod = signal<'AM' | 'PM'>('AM');

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(7)]]
  });

  readonly effectiveDateSlots = computed(() => {
    const live = this.liveSchedule();
    return live?.length ? live : this.data().dateSlots;
  });

  readonly displayAgentName = computed(
    () => this.resolvedAgentName()?.trim() || this.data().agentName
  );

  readonly selectedDateKey = computed(() => {
    const value = this.selectedDate();
    return value ? this.formatDateKey(value) : '';
  });

  readonly selectedDateSlots = computed(() => {
    const key = this.selectedDateKey();
    return this.effectiveDateSlots().find(item => item.date === key)?.slots ?? [];
  });

  readonly amSlots = computed(() =>
    this.selectedDateSlots().filter(slot => slot.meridiem === 'AM')
  );

  readonly pmSlots = computed(() =>
    this.selectedDateSlots().filter(slot => slot.meridiem === 'PM')
  );

  readonly visibleSlots = computed(() => {
    const base = this.selectedPeriod() === 'AM' ? this.amSlots() : this.pmSlots();
    const key = this.selectedDateKey();
    if (!key) return base;

    const now = this.now();
    const todayKey = this.formatDateKey(now);
    if (key !== todayKey) return base;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return base.filter(slot => slot.hour24 * 60 + slot.minute > currentMinutes);
  });

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

  constructor() {
    const timer = setInterval(() => this.now.set(new Date()), 30_000);
    this.destroyRef.onDestroy(() => clearInterval(timer));

    effect(() => {
      if (!this.open()) {
        this.fetchSub?.unsubscribe();
        this.fetchSub = null;
        this.propertyIdSub?.unsubscribe();
        this.propertyIdSub = null;
        this.propertyIdFromPropertiesApi.set(null);
        this.scheduleUserId.set(null);
        this.weeklyAvailabilityCache.set(null);
        return;
      }

      this.confirmError.set(null);
      this.form.patchValue({
        name: this.data().initialName ?? '',
        email: this.data().initialEmail ?? '',
        phone: this.data().initialPhone ?? ''
      });

      const candidatePropertyId = this.data().listing.propertyId?.trim() ?? '';
      const fallbackAgentUserId = this.data().agentUserId?.trim() ?? '';

      this.fetchSub?.unsubscribe();
      this.propertyIdSub?.unsubscribe();

      const runScheduleFetch = (userId: string): void => {
        const trimmed = userId.trim();
        this.scheduleUserId.set(trimmed || null);
        if (!trimmed) {
          this.liveSchedule.set(null);
          this.scheduleLoading.set(false);
          this.scheduleError.set(null);
          this.resolvedAgentName.set(null);
          this.weeklyAvailabilityCache.set(null);
          return;
        }

        this.scheduleLoading.set(true);
        this.scheduleError.set(null);
        this.resolvedAgentName.set(null);

        this.fetchSub = forkJoin({
          availability: this.appointmentApi.getUserAvailability(trimmed),
          appointments: this.appointmentApi.getAppointmentsForUser(trimmed),
          profile: this.appointmentApi.getUserProfile(trimmed)
        }).subscribe({
          next: ({ availability, appointments, profile }) => {
            this.scheduleLoading.set(false);
            const weekly = parseWeeklyAvailabilityResponse(availability);
            this.weeklyAvailabilityCache.set(weekly);
            const apMap = parseAppointmentsResponse(appointments);

            const datesFromAppointments = [...apMap.keys()];
            const dates = [...new Set([...this.upcomingDateKeys(), ...datesFromAppointments])];

            this.liveSchedule.set(
              mergeWeeklyAvailabilityAndAppointments({
                weeklyAvailability: weekly,
                appointments: apMap,
                dates
              })
            );

            const agent = [profile.firstname, profile.lastname].filter(Boolean).join(' ').trim();
            if (agent) this.resolvedAgentName.set(agent);
          },
          error: () => {
            this.scheduleLoading.set(false);
            this.scheduleError.set('Could not load availability. Using sample slots if present.');
            this.liveSchedule.set(null);
            this.weeklyAvailabilityCache.set(null);
          }
        });
      };

      if (!candidatePropertyId) {
        this.propertyIdFromPropertiesApi.set(null);
        runScheduleFetch(fallbackAgentUserId);
        return;
      }

      this.propertyIdFromPropertiesApi.set(candidatePropertyId);
      this.liveSchedule.set(null);
      this.scheduleLoading.set(true);
      this.scheduleError.set(null);
      this.resolvedAgentName.set(null);
      this.weeklyAvailabilityCache.set(null);
      this.scheduleUserId.set(null);

      this.propertyIdSub = this.listingsService.resolvePropertyListMatch(candidatePropertyId).subscribe({
        next: (match) => {
          const pid = (match.propertyId || candidatePropertyId).trim();
          this.propertyIdFromPropertiesApi.set(pid || candidatePropertyId);
          const userId = match.ownerUserId?.trim() || fallbackAgentUserId;
          runScheduleFetch(userId);
        },
        error: () => {
          this.propertyIdFromPropertiesApi.set(candidatePropertyId);
          runScheduleFetch(fallbackAgentUserId);
        }
      });
    });

    effect(() => {
      if (!this.open()) return;

      const slots = this.effectiveDateSlots();
      if (!slots.length) return;

      const key = this.selectedDateKey();
      const todayKey = this.formatDateKey(new Date());

      // Keep current selection if it exists in our generated range; otherwise default to today (or the first slot date).
      if (!key || !slots.some(s => s.date === key)) {
        const preferred = slots.some(s => s.date === todayKey) ? todayKey : slots[0].date;
        this.selectedDate.set(this.parseISODate(preferred));
        this.selectedSlotId.set(null);
      }
    });
  }

  onDateChange(date: Date | null): void {
    if (!date) {
      this.selectedDate.set(null);
      this.selectedSlotId.set(null);
      return;
    }

    // Prevent selecting past dates (in case of manual typing / edge cases)
    const picked = this.startOfDay(date);
    if (picked.getTime() < this.today().getTime()) {
      return;
    }

    this.selectedDate.set(date);
    this.selectedSlotId.set(null);
  }

  selectPeriod(period: 'AM' | 'PM'): void {
    this.selectedPeriod.set(period);
    this.selectedSlotId.set(null);
  }

  selectSlot(slot: AppointmentTimeSlot): void {
    if (
      slot.status === 'confirmed' ||
      slot.status === 'booked' ||
      slot.status === 'blocked' ||
      slot.status === 'not_available'
    ) {
      return;
    }

    this.selectedSlotId.set(slot.id);
  }

  dateHasAvailability = (date: Date | null): boolean => {
    if (!date) return false;
    return this.effectiveDateSlots().some(item => item.date === this.formatDateKey(date));
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
      case 'not_available':
        return 'Not Available';
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
    if (
      slot.status === 'not_available' ||
      slot.status === 'blocked' ||
      slot.status === 'booked' ||
      slot.status === 'confirmed'
    ) {
      return;
    }

    const formValue = this.form.getRawValue();
    const userId = this.scheduleUserId()?.trim() || this.data().agentUserId?.trim();

    const payload: AppointmentBookingPayload = {
      listingId: this.data().listing.propertyId,
      agentName: this.displayAgentName(),
      date: this.selectedDateKey(),
      slotId: slot.id,
      slotLabel: slot.label,
      name: formValue.name,
      email: formValue.email,
      phone: formValue.phone
    };

    if (!userId) {
      this.showBookingToast('Your appointment request was submitted.', 5000);
      this.confirmed.emit(payload);
      return;
    }

    this.confirmLoading.set(true);
    this.confirmError.set(null);

    const appointmentDateIso = this.toAppointmentDateUtcMidnight(this.selectedDateKey());
    const appointmentTime = `${String(slot.hour24).padStart(2, '0')}:${String(slot.minute).padStart(2, '0')}`;

    const resolvePropertyId$ = (): Observable<string> => {
      const cached = this.propertyIdFromPropertiesApi()?.trim();
      const candidate = this.data().listing.propertyId?.trim();
      if (cached) {
        return of(cached);
      }
      if (!candidate) {
        return throwError(() => new Error('missing-property'));
      }
      return this.listingsService.resolvePropertyMongoId(candidate);
    };

    resolvePropertyId$()
      .pipe(
        tap((resolved) => {
          const v = resolved?.trim();
          if (v) {
            this.propertyIdFromPropertiesApi.set(v);
          }
        }),
        switchMap(() => {
          const propertyId = this.propertyIdFromPropertiesApi()?.trim();
          if (!propertyId) {
            return throwError(() => new Error('missing-property'));
          }
          return this.appointmentApi.createAppointment({
            propertyId,
            userId,
            date: appointmentDateIso,
            time: appointmentTime,
            client: {
              name: formValue.name,
              email: formValue.email,
              phone: formValue.phone
            },
            appointmentType: 'Property viewing'
          });
        }),
        switchMap(() => this.appointmentApi.getAppointmentsForUser(userId)),
        tap((appointmentsRaw) => {
          this.mergeAppointmentsIntoLiveSchedule(appointmentsRaw);
          this.selectedSlotId.set(null);
        })
      )
      .subscribe({
        next: () => {
          this.confirmLoading.set(false);
          this.showBookingToast('Your appointment has been booked.', 6000);
          this.confirmed.emit(payload);
        },
        error: () => {
          this.confirmLoading.set(false);
          this.confirmError.set('Could not confirm appointment. Try again.');
        }
      });
  }

  private showBookingToast(message: string, durationMs: number): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: durationMs,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['locatehome-snackbar']
    });
  }

  /** Rebuilds `liveSchedule` after POST using fresh GET /api/appointments/user/:userId + cached weekly rules. */
  private mergeAppointmentsIntoLiveSchedule(appointmentsRaw: unknown): void {
    const weekly = this.weeklyAvailabilityCache();
    if (!weekly) {
      return;
    }
    const apMap = parseAppointmentsResponse(appointmentsRaw);
    const datesFromAppointments = [...apMap.keys()];
    const dates = [...new Set([...this.upcomingDateKeys(), ...datesFromAppointments])];
    this.liveSchedule.set(
      mergeWeeklyAvailabilityAndAppointments({
        weeklyAvailability: weekly,
        appointments: apMap,
        dates
      })
    );
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

  /** YYYY-MM-DD → ISO string at UTC midnight (matches typical appointment `date` field). */
  private toAppointmentDateUtcMidnight(dateKey: string): string {
    const [y, m, d] = dateKey.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0)).toISOString();
  }

  private startOfDay(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  readonly dateClass = (date: Date): string => {
    const key = this.formatDateKey(date);
    const match = this.effectiveDateSlots().find(item => item.date === key);

    if (!match) {
      return '';
    }

    const hasAvailable = match.slots.some(
      slot => slot.status === 'available' || slot.status === 'confirmed'
    );

    const allBlocked = match.slots.every(
      slot =>
        slot.status === 'blocked' ||
        slot.status === 'booked' ||
        slot.status === 'not_available'
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
