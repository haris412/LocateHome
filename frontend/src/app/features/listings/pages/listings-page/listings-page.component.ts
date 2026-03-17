import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { FilterChipItem, FilterSelectConfig, FilterTabItem, SortOption } from '../../../../core/models/filter.models';
import { ListingItem } from '../../../../core/models/listing.models';
import { ListingsToolbarComponent } from '../../components/listings-toolbar/listings-toolbar.component';
import { ListingsResultsHeaderComponent } from '../../components/listings-results-header/listings-results-header.component';
import { ListingsGridComponent } from '../../components/listings-grid/listings-grid.component';
import { PropertyFiltersComponent } from 'src/app/shared/ui/property-filters/property-filters.component';

@Component({
  selector: 'app-listings-page',
  standalone: true,
  imports: [
    ListingsResultsHeaderComponent,
    ListingsGridComponent,
    PropertyFiltersComponent
  ],
  templateUrl: './listings-page.component.html',
  styleUrl: './listings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingsPageComponent {
  readonly searchQuery = signal('Ontario, Canada');

  onSearchQueryChange(value: string) {
    this.searchQuery.set(value);
  }
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
  private readonly router = inject(Router);

  readonly listings = signal<ListingItem[]>([
    {
      id: '1',
      title: 'Skyline Marina Apartment',
      address: 'Dubai Marina, Dubai',
      price: '$945,000',
      badge: 'For Sale',
      badgeVariant: 'sale',
      imageUrl: 'assets/images/listings/listing-1.jpg',
      beds: 2,
      baths: 2,
      area: '1,240 sqft',
      favorite: false
    },
    {
      id: '2',
      title: 'Palm View Residence',
      address: 'Palm Jumeirah, Dubai',
      price: '$1,850,000',
      badge: 'Featured',
      badgeVariant: 'featured',
      imageUrl: 'assets/images/listings/listing-2.jpg',
      beds: 3,
      baths: 3,
      area: '2,140 sqft',
      favorite: true
    },
    {
      id: '3',
      title: 'Downtown Loft',
      address: 'Downtown Dubai, Dubai',
      price: '$2,800 / mo',
      badge: 'For Rent',
      badgeVariant: 'rent',
      imageUrl: 'assets/images/listings/listing-3.jpg',
      beds: 1,
      baths: 1,
      area: '920 sqft',
      favorite: false
    },
    {
      id: '4',
      title: 'Modern Family Villa',
      address: 'Arabian Ranches, Dubai',
      price: '$1,450,000',
      badge: 'New',
      badgeVariant: 'new',
      imageUrl: 'assets/images/listings/listing-4.jpg',
      beds: 4,
      baths: 4,
      area: '3,600 sqft',
      favorite: false
    },
    {
      id: '5',
      title: 'Harbor Crest Apartment',
      address: 'Dubai Creek Harbour, Dubai',
      price: '$4,100 / mo',
      badge: 'Verified',
      badgeVariant: 'verified',
      imageUrl: 'assets/images/listings/listing-5.jpg',
      beds: 2,
      baths: 2,
      area: '1,380 sqft',
      favorite: true
    },
    {
      id: '6',
      title: 'JBR Luxury Flat',
      address: 'Jumeirah Beach Residence, Dubai',
      price: '$1,120,000',
      badge: 'For Sale',
      badgeVariant: 'sale',
      imageUrl: 'assets/images/listings/listing-6.jpg',
      beds: 2,
      baths: 3,
      area: '1,510 sqft',
      favorite: false
    }
  ]);

  readonly sortOptions = signal<SortOption[]>([
    { id: 'newest', label: 'Newest' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'most-viewed', label: 'Most Viewed' }
  ]);

  readonly selectedSort = signal('newest');
  readonly selectedView = signal<'grid' | 'list'>('grid');

  readonly selectedSortLabel = computed(() => {
    return (
      this.sortOptions().find((option) => option.id === this.selectedSort())?.label ??
      'Newest'
    );
  });

  updateSort(value: string): void {
    this.selectedSort.set(value);
  }

  openListingDetail(id: string): void {
    console.log('navigating to detail', id);
    this.router.navigate(['/listings', id]);
  }

  onFavoriteToggled(id: string): void {
    this.listings.update((items) =>
      items.map((item) =>
        item.id === id
          ? {
            ...item,
            favorite: !item.favorite
          }
          : item
      )
    );
  }
}