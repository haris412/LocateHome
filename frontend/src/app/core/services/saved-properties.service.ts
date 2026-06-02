import { PLATFORM_ID, Injectable, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { ListingItem } from '../models/listing.models';

const STORAGE_KEY = 'ep_saved_properties';

@Injectable({ providedIn: 'root' })
export class SavedPropertiesService {
  private readonly platformId = inject(PLATFORM_ID);

  // ── Private writable signal — only this service can mutate it ─────────────
  private readonly _saved = signal<ListingItem[]>(this.hydrate());

  // ── Public read-only surface ──────────────────────────────────────────────

  /** All saved listings — reactive, use in templates with savedListings() */
  readonly savedListings = this._saved.asReadonly();

  /** How many properties are currently saved */
  readonly count = computed(() => this._saved().length);

  // ── Public API ────────────────────────────────────────────────────────────

  isSaved(id: string): boolean {
    return this._saved().some(item => item.id === id);
  }

  /** Save if not saved, unsave if already saved */
  toggle(item: ListingItem): void {
    this.isSaved(item.id) ? this.unsave(item.id) : this.save(item);
  }

  save(item: ListingItem): void {
    if (this.isSaved(item.id)) return;                              // duplicate guard
    this._saved.update(current => [...current, { ...item, favorite: true }]);
    this.persist();
  }

  unsave(id: string): void {
    this._saved.update(current => current.filter(item => item.id !== id));
    this.persist();
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  /**
   * Called once at construction — reads sessionStorage and returns the initial
   * array. Returns [] on SSR or if the key doesn't exist yet.
   */
  private hydrate(): ListingItem[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ListingItem[]) : [];
    } catch {
      return [];   // corrupt JSON — start fresh
    }
  }

  /** Writes the current signal value to sessionStorage after every mutation */
  private persist(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this._saved()));
  }
}
