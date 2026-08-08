import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  effect,
  input,
  output,
  signal
} from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import {
  EMPTY_MORE_FILTERS,
  MoreFiltersFormValue,
  MoreFiltersOverlayData,
  MoreFiltersOverlayResult
} from '../../../core/models/filter.models';
import { FilterChipGroupComponent } from '../filter-chip-group/filter-chip-group.component';

@Component({
  selector: 'app-more-filters-overlay',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    FilterChipGroupComponent
  ],
  templateUrl: './more-filters-overlay.component.html',
  styleUrl: './more-filters-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoreFiltersOverlayComponent {
  readonly data = input.required<MoreFiltersOverlayData>();
  readonly closed = output<void>();
  readonly applied = output<MoreFiltersOverlayResult>();

  readonly form = new FormGroup({
    currency: new FormControl('PKR', { nonNullable: true }),
    minPrice: new FormControl('', { nonNullable: true }),
    maxPrice: new FormControl('', { nonNullable: true }),
    minArea: new FormControl('', { nonNullable: true }),
    maxArea: new FormControl('', { nonNullable: true }),
    bathrooms: new FormControl('any', { nonNullable: true }),
    purpose: new FormControl('any', { nonNullable: true }),
    furnishing: new FormControl('any', { nonNullable: true }),
    amenity: new FormControl('', { nonNullable: true }),
    feature: new FormControl('', { nonNullable: true }),
    verifiedOnly: new FormControl(false, { nonNullable: true }),
    withPhotos: new FormControl(false, { nonNullable: true })
  });

  readonly formValue = signal<MoreFiltersFormValue>({ ...EMPTY_MORE_FILTERS });
  readonly selectedChipIds = signal<readonly string[]>([]);
  readonly priceError = signal('');

  readonly chips = computed(() => {
    const selected = new Set(this.selectedChipIds());
    return this.data().chips.map((chip) => ({ ...chip, selected: selected.has(chip.id) }));
  });

  readonly filterCount = computed(() => {
    const filters = this.formValue();
    let count = this.selectedChipIds().length;
    if (filters.minPrice || filters.maxPrice) count += 1;
    if (filters.minArea || filters.maxArea) count += 1;
    if (filters.bathrooms !== 'any') count += 1;
    if (filters.purpose !== 'any') count += 1;
    if (filters.furnishing !== 'any') count += 1;
    if (filters.amenity) count += 1;
    if (filters.feature) count += 1;
    if (filters.verifiedOnly) count += 1;
    if (filters.withPhotos) count += 1;
    return count;
  });

  constructor() {
    effect(() => {
      const data = this.data();
      this.form.reset(data.filters, { emitEvent: false });
      this.formValue.set({ ...data.filters });
      this.selectedChipIds.set([...data.selectedChipIds]);
      this.priceError.set('');
    });

    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.formValue.set(this.form.getRawValue());
        this.priceError.set('');
      });
  }

  @HostListener('document:keydown.escape')
  close(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('more-filters-overlay')) {
      this.close();
    }
  }

  toggleChip(id: string): void {
    this.selectedChipIds.update((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
    );
  }

  reset(): void {
    this.form.reset(EMPTY_MORE_FILTERS);
    this.selectedChipIds.set([]);
    this.priceError.set('');
  }

  apply(): void {
    const filters = this.form.getRawValue();
    const minPrice = this.parseOptionalNumber(filters.minPrice);
    const maxPrice = this.parseOptionalNumber(filters.maxPrice);

    if (
      (filters.minPrice.trim() && minPrice === undefined) ||
      (filters.maxPrice.trim() && maxPrice === undefined)
    ) {
      this.priceError.set('Enter a valid non-negative price.');
      return;
    }

    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      this.priceError.set('Minimum price cannot be greater than maximum price.');
      return;
    }

    this.applied.emit({
      filters,
      selectedChipIds: [...this.selectedChipIds()]
    });
  }

  private parseOptionalNumber(value: string): number | undefined {
    const normalized = value.replace(/,/g, '').trim();
    if (!normalized) return undefined;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
  }
}
