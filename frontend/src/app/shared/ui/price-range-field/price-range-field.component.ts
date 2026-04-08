import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import {
  MatAutocomplete,
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger
} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { FiltersCatalogService } from '../../../core/services/filters-catalog.service';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface PriceRange {
  min: number | null;
  max: number | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-price-range-field',
  imports: [
    OverlayModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './price-range-field.component.html',
  styleUrl: './price-range-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriceRangeFieldComponent {
  protected readonly catalog = inject(FiltersCatalogService);

  // ── Inputs / Outputs ────────────────────────────────────────────────────

  readonly mode = input<'buy' | 'rent'>('buy');
  readonly rangeChange = output<PriceRange>();

  // ── View references — used to open autocomplete panels programmatically ──

  @ViewChild('minTrigger') private minTrigger!: MatAutocompleteTrigger;
  @ViewChild('maxTrigger') private maxTrigger!: MatAutocompleteTrigger;

  // ── Overlay state ───────────────────────────────────────────────────────

  readonly isOpen = signal(false);

  readonly overlayPositions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top',    offsetY: 4  },
    { originX: 'start', originY: 'top',    overlayX: 'start', overlayY: 'bottom', offsetY: -4 }
  ];

  // ── Form controls ────────────────────────────────────────────────────────

  readonly minControl = new FormControl<string>('', { nonNullable: true });
  readonly maxControl = new FormControl<string>('', { nonNullable: true });

  readonly minValue = signal<number | null>(null);
  readonly maxValue = signal<number | null>(null);

  // ── Derived ──────────────────────────────────────────────────────────────

  private readonly priceRangeForMode = computed(() =>
    this.catalog.getPriceRangeForMode(this.mode())
  );

  private readonly minText = toSignal(
    this.minControl.valueChanges.pipe(startWith('')),
    { initialValue: '' }
  );
  private readonly maxText = toSignal(
    this.maxControl.valueChanges.pipe(startWith('')),
    { initialValue: '' }
  );

  /** All presets for MIN — filtered as user types, full list when empty. */
  readonly filteredMinOptions = computed(() => {
    const range = this.priceRangeForMode();
    if (!range) return [];
    const text = this.minText().replace(/,/g, '').trim();
    if (!text) return range.min.options;
    return range.min.options.filter((o) => String(o).startsWith(text));
  });

  /** All presets for MAX — filtered as user types, full list when empty. */
  readonly filteredMaxOptions = computed(() => {
    const range = this.priceRangeForMode();
    if (!range) return [];
    const text = this.maxText().replace(/,/g, '').trim();
    if (!text) return range.max.options;
    return range.max.options.filter((o) => String(o).startsWith(text));
  });

  /** Trigger button label reflecting the current committed selection. */
  readonly triggerLabel = computed(() => {
    const symbol = this.catalog.priceRanges()?.symbol ?? 'PKR';
    const min = this.minValue();
    const max = this.maxValue();
    const fmt = (v: number) => `${symbol} ${v.toLocaleString()}`;

    if (min === null && max === null) return 'Any price';
    if (min !== null && max === null) return `${fmt(min)} and above`;
    if (min === null && max !== null) return `Up to ${fmt(max)}`;
    return `${fmt(min!)} – ${fmt(max!)}`;
  });

  // ── Constructor ──────────────────────────────────────────────────────────

  constructor() {
    // Reset both fields when mode switches (buy ↔ rent use different scales).
    effect(() => {
      this.mode();
      this.clearValues();
    });
  }

  // ── Overlay controls ─────────────────────────────────────────────────────

  open(): void {
    this.isOpen.set(true);
    // After the overlay renders, focus the MIN input and open its panel
    // so presets are immediately visible without an extra click.
    setTimeout(() => {
      this.minTrigger?.openPanel();
    });
  }

  close(): void {
    this.isOpen.set(false);
  }

  // ── Event handlers ───────────────────────────────────────────────────────

  onMinOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const val = Number(event.option.value);
    this.minValue.set(val);
    this.minControl.setValue(val.toLocaleString(), { emitEvent: false });
  }

  onMaxOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const val = Number(event.option.value);
    this.maxValue.set(val);
    this.maxControl.setValue(val.toLocaleString(), { emitEvent: false });
  }

  onMinBlur(): void {
    const num = this.parseInput(this.minControl.value);
    this.minValue.set(num);
    if (num !== null) {
      this.minControl.setValue(num.toLocaleString(), { emitEvent: false });
    } else {
      this.minControl.setValue('', { emitEvent: false });
    }
  }

  onMaxBlur(): void {
    const num = this.parseInput(this.maxControl.value);
    this.maxValue.set(num);
    if (num !== null) {
      this.maxControl.setValue(num.toLocaleString(), { emitEvent: false });
    } else {
      this.maxControl.setValue('', { emitEvent: false });
    }
  }

  /** Called when user clicks a MIN input — opens its autocomplete panel. */
  onMinFocus(): void {
    this.minTrigger?.openPanel();
  }

  /** Called when user clicks a MAX input — opens its autocomplete panel. */
  onMaxFocus(): void {
    this.maxTrigger?.openPanel();
  }

  apply(): void {
    this.rangeChange.emit({ min: this.minValue(), max: this.maxValue() });
    this.close();
  }

  reset(): void {
    this.clearValues();
    this.rangeChange.emit({ min: null, max: null });
    this.close();
  }

  // ── Template helpers ─────────────────────────────────────────────────────

  /**
   * Converts an option value to a display string.
   * Handles both number (from preset selection) and string (typed text).
   */
  readonly displayWith = (val: number | string | null): string => {
    if (val === null || val === '') return '';
    const num = typeof val === 'number' ? val : Number(String(val).replace(/,/g, ''));
    if (isNaN(num)) return String(val);
    const symbol = this.catalog.priceRanges()?.symbol ?? 'PKR';
    return `${symbol} ${num.toLocaleString()}`;
  };

  formatPreset(val: number): string {
    const symbol = this.catalog.priceRanges()?.symbol ?? 'PKR';
    return `${symbol} ${val.toLocaleString()}`;
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private parseInput(raw: string): number | null {
    const cleaned = raw.replace(/,/g, '').trim();
    if (!cleaned) return null;
    const num = Number(cleaned);
    return isNaN(num) ? null : num;
  }

  private clearValues(): void {
    this.minControl.setValue('', { emitEvent: false });
    this.maxControl.setValue('', { emitEvent: false });
    this.minValue.set(null);
    this.maxValue.set(null);
  }
}
