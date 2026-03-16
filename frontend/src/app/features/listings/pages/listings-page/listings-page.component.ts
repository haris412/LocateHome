import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { SortOption } from '../../../../core/models/filter.models';
import { ListingItem } from '../../../../core/models/listing.models';
import { ListingsToolbarComponent } from '../../components/listings-toolbar/listings-toolbar.component';
import { ListingsResultsHeaderComponent } from '../../components/listings-results-header/listings-results-header.component';
import { ListingsGridComponent } from '../../components/listings-grid/listings-grid.component';

@Component({
  selector: 'app-listings-page',
  standalone: true,
  imports: [
    ListingsToolbarComponent,
    ListingsResultsHeaderComponent,
    ListingsGridComponent
  ],
  templateUrl: './listings-page.component.html',
  styleUrl: './listings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingsPageComponent {
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