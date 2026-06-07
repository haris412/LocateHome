import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { ListingItem } from '../models/listing.models';

const STORAGE_KEY = 'ep_recently_viewed';
const MAX_ITEMS   = 10;

@Injectable({ providedIn: 'root' })
export class RecentlyViewedService {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _items = signal<ListingItem[]>(this.hydrate());

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().length);

  add(item: ListingItem): void {
    this._items.update((current) => {
      const without = current.filter((i) => i.id !== item.id);
      return [item, ...without].slice(0, MAX_ITEMS);
    });
    this.persist();
  }

  clear(): void {
    this._items.set([]);
    this.persist();
  }

  private hydrate(): ListingItem[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ListingItem[]) : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this._items()));
  }
}
