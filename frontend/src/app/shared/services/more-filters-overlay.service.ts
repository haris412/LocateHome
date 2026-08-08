import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import {
  MoreFiltersOverlayData,
  MoreFiltersOverlayResult
} from '../../core/models/filter.models';

interface MoreFiltersOverlayState {
  isOpen: boolean;
  data: MoreFiltersOverlayData | null;
}

interface MoreFiltersOverlayOpenOptions {
  onApplied?: (result: MoreFiltersOverlayResult) => void;
}

@Injectable({ providedIn: 'root' })
export class MoreFiltersOverlayService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly initialState: MoreFiltersOverlayState = {
    isOpen: false,
    data: null
  };

  private readonly _state = signal<MoreFiltersOverlayState>(this.initialState);
  private onApplied: ((result: MoreFiltersOverlayResult) => void) | null = null;
  private previousBodyOverflow: string | null = null;

  readonly state = this._state.asReadonly();

  open(data: MoreFiltersOverlayData, options: MoreFiltersOverlayOpenOptions = {}): void {
    if (!this._state().isOpen && isPlatformBrowser(this.platformId)) {
      this.previousBodyOverflow = this.document.body.style.overflow;
      this.document.body.style.overflow = 'hidden';
    }

    this.onApplied = options.onApplied ?? null;
    this._state.set({ isOpen: true, data });
  }

  close(): void {
    this._state.set(this.initialState);
    this.onApplied = null;

    if (isPlatformBrowser(this.platformId)) {
      this.document.body.style.overflow = this.previousBodyOverflow ?? '';
    }
    this.previousBodyOverflow = null;
  }

  apply(result: MoreFiltersOverlayResult): void {
    this.onApplied?.(result);
    this.close();
  }
}
