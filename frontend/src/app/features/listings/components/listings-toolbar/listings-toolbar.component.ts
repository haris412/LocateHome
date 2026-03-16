import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  FilterChipItem,
  FilterMode,
  FilterSelectConfig,
  FilterTabItem
} from '../../../../core/models/filter.models';
import { FilterShellComponent } from '../../../../shared/ui/filter-shell/filter-shell.component';
import { FilterSegmentTabsComponent } from '../../../../shared/ui/filter-segment-tabs/filter-segment-tabs.component';
import { FilterSelectComponent } from '../../../../shared/ui/filter-select-card/filter-select-card.component';
import { FilterChipGroupComponent } from '../../../../shared/ui/filter-chip-group/filter-chip-group.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-listings-toolbar',
  imports: [
    FilterShellComponent,
    FilterSegmentTabsComponent,
    FilterSelectComponent,
    FilterChipGroupComponent,
    MatIconModule
  ],
  templateUrl: './listings-toolbar.component.html',
  styleUrl: './listings-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingsToolbarComponent {
  readonly mode = signal<FilterMode>('buy');
  readonly showMoreFilters = signal(false);
  readonly searchQuery = signal('Ontario, Canada');

  readonly tabs: readonly FilterTabItem[] = [
    { id: 'buy', label: 'Buy' },
    { id: 'rent', label: 'Rent' }
  ];

  readonly buyFields = signal<FilterSelectConfig[]>([
    {
      id: 'province',
      label: 'Province',
      icon: 'location_on',
      placeholder: 'Province',
      value: 'ontario',
      options: [
        { id: 'ontario', label: 'Ontario' },
        { id: 'alberta', label: 'Alberta' },
        { id: 'bc', label: 'British Columbia' }
      ]
    },
    {
      id: 'state',
      label: 'State',
      icon: 'map',
      placeholder: 'State',
      value: 'any-state',
      options: [
        { id: 'any-state', label: 'Any State' },
        { id: 'toronto', label: 'Toronto' },
        { id: 'ottawa', label: 'Ottawa' }
      ]
    },
    {
      id: 'area',
      label: 'Area',
      icon: 'pin_drop',
      placeholder: 'Area',
      value: 'downtown',
      options: [
        { id: 'downtown', label: 'Downtown' },
        { id: 'midtown', label: 'Midtown' },
        { id: 'suburbs', label: 'Suburbs' }
      ]
    },
    {
      id: 'type',
      label: 'Property Type',
      icon: 'apartment',
      placeholder: 'Property type',
      value: 'house-apartment',
      options: [
        { id: 'house-apartment', label: 'House, Apartment' },
        { id: 'house', label: 'House' },
        { id: 'apartment', label: 'Apartment' },
        { id: 'condo', label: 'Condo' }
      ]
    },
    {
      id: 'beds',
      label: 'Bedrooms',
      icon: 'bed',
      placeholder: 'Bedrooms',
      value: '3plus',
      options: [
        { id: 'any', label: 'Any' },
        { id: '1plus', label: '1+ Beds' },
        { id: '2plus', label: '2+ Beds' },
        { id: '3plus', label: '3+ Beds' },
        { id: '4plus', label: '4+ Beds' }
      ]
    },
    {
      id: 'price',
      label: 'Price Range',
      icon: 'monetization_on',
      placeholder: 'Price range',
      value: 'mid',
      options: [
        { id: 'low', label: 'Under $500k' },
        { id: 'mid', label: '$500k - $2.5M' },
        { id: 'high', label: '$2.5M+' }
      ]
    }
  ]);

  readonly rentFields = signal<FilterSelectConfig[]>([
    {
      id: 'province',
      label: 'Province',
      icon: 'location_on',
      placeholder: 'Province',
      value: 'ontario',
      options: [
        { id: 'ontario', label: 'Ontario' },
        { id: 'alberta', label: 'Alberta' },
        { id: 'bc', label: 'British Columbia' }
      ]
    },
    {
      id: 'state',
      label: 'State',
      icon: 'map',
      placeholder: 'State',
      value: 'any-state',
      options: [
        { id: 'any-state', label: 'Any State' },
        { id: 'toronto', label: 'Toronto' },
        { id: 'ottawa', label: 'Ottawa' }
      ]
    },
    {
      id: 'area',
      label: 'Area',
      icon: 'pin_drop',
      placeholder: 'Area',
      value: 'downtown',
      options: [
        { id: 'downtown', label: 'Downtown' },
        { id: 'midtown', label: 'Midtown' },
        { id: 'suburbs', label: 'Suburbs' }
      ]
    },
    {
      id: 'type',
      label: 'Property Type',
      icon: 'apartment',
      placeholder: 'Property type',
      value: 'apartment',
      options: [
        { id: 'apartment', label: 'Apartment' },
        { id: 'studio', label: 'Studio' },
        { id: 'condo', label: 'Condo' },
        { id: 'townhouse', label: 'Townhouse' }
      ]
    },
    {
      id: 'beds',
      label: 'Bedrooms',
      icon: 'bed',
      placeholder: 'Bedrooms',
      value: '2plus',
      options: [
        { id: 'any', label: 'Any' },
        { id: 'studio', label: 'Studio' },
        { id: '1plus', label: '1+ Beds' },
        { id: '2plus', label: '2+ Beds' },
        { id: '3plus', label: '3+ Beds' }
      ]
    },
    {
      id: 'price',
      label: 'Monthly Rent',
      icon: 'payments',
      placeholder: 'Monthly rent',
      value: 'mid',
      options: [
        { id: 'low', label: 'Under $1,500' },
        { id: 'mid', label: '$1,500 - $3,500' },
        { id: 'high', label: '$3,500+' }
      ]
    }
  ]);

  readonly buyChips = signal<FilterChipItem[]>([
    { id: 'open-house', label: 'Open house' },
    { id: 'new-projects', label: 'New projects' },
    { id: 'ready-to-move', label: 'Ready to move' },
    { id: 'video-tours', label: 'Video tours' },
    { id: 'verified', label: 'Verified listings' },
    { id: 'parking', label: 'Parking' }
  ]);

  readonly rentChips = signal<FilterChipItem[]>([
    { id: 'furnished', label: 'Furnished' },
    { id: 'pet-friendly', label: 'Pet friendly' },
    { id: 'utilities', label: 'Utilities included' },
    { id: 'available-now', label: 'Available now' },
    { id: 'video-tours', label: 'Video tours' },
    { id: 'parking', label: 'Parking' }
  ]);

  readonly activeFields = computed(() =>
    this.mode() === 'buy' ? this.buyFields() : this.rentFields()
  );

  readonly activeChips = computed(() =>
    this.mode() === 'buy' ? this.buyChips() : this.rentChips()
  );

  setMode(mode: FilterMode): void {
    this.mode.set(mode);
  }

  toggleMoreFilters(): void {
    this.showMoreFilters.update((value) => !value);
  }

  updateField(payload: { id: string; value: string | null }): void {
    const store = this.mode() === 'buy' ? this.buyFields : this.rentFields;

    store.update((fields) =>
      fields.map((field) =>
        field.id === payload.id
          ? { ...field, value: payload.value }
          : field
      )
    );
  }

  toggleChip(id: string): void {
    const store = this.mode() === 'buy' ? this.buyChips : this.rentChips;

    store.update((chips) =>
      chips.map((chip) =>
        chip.id === id ? { ...chip, selected: !chip.selected } : chip
      )
    );
  }

  updateSearch(value: string): void {
    this.searchQuery.set(value);
  }

  runSearch(): void {
    console.log('search', {
      mode: this.mode(),
      query: this.searchQuery(),
      fields: this.activeFields(),
      chips: this.activeChips().filter((chip) => chip.selected)
    });
  }
}