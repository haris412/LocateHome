import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SavedPropertiesService } from '@/core/services/saved-properties.service';
import { RecentlyViewedService } from '@/core/services/recently-viewed.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
  CategoryItem,
  TrendItem
} from '@/core/models/home.models';
import { ListingItem } from '@/core/models/listing.models';
import { AgentsService } from '../../../agents/services/agents.service';
import { HeroSectionComponent } from '../../components/hero-section/hero-section.component';
import { SearchPanelComponent } from '../../components/search-panel/search-panel.component';
import { ListingsCarouselSectionComponent } from '@/shared/ui/listings-carousel-section/listings-carousel-section.component';
import { AgentsSectionComponent } from '../../components/agents-section/agents-section.component';
import { AppPromoSectionComponent } from '../../components/app-promo-section/app-promo-section.component';
import { ValuationSectionComponent } from "../../components/valuation-section/valuation-section.component";
import { SearchPayload } from '@/core/interfaces/search-payload.interface';

@Component({
  selector: 'app-home-page',
  imports: [
    HeroSectionComponent,
    SearchPanelComponent,
    ListingsCarouselSectionComponent,
    AgentsSectionComponent,
    AppPromoSectionComponent,
    ValuationSectionComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent {
  private readonly router        = inject(Router);
  private readonly agentsService = inject(AgentsService);
  private readonly savedService          = inject(SavedPropertiesService);
  private readonly recentlyViewedService = inject(RecentlyViewedService);

  /** Directly reads the service signal — no local copy, always in sync */
  readonly savedProperties = this.savedService.savedListings;

  readonly featuredListings = signal<ListingItem[]>([
    { id: '1', title: 'Beverly Hills Mansion', address: '1241 Laurel Way, Beverly Hills, CA', price: '$2,850,000', badge: 'For Sale', badgeVariant: 'sale', imageUrl: 'assets/images/listings/featured-1.png', beds: 5, baths: 6, area: '8,400 sqft', favorite: false },
    { id: '2', title: 'Skyline Penthouse', address: '620 5th Ave, New York, NY', price: '$8,500', badge: 'For Rent', badgeVariant: 'rent', imageUrl: 'assets/images/listings/featured-2.png', beds: 3, baths: 2, area: '2,100 sqft', favorite: true, rent: true },
    { id: '3', title: 'Cozy Suburban Family Home', address: '32 Oakwood Drive, Austin, TX', price: '$945,000', badge: 'For Sale', badgeVariant: 'sale', imageUrl: 'assets/images/listings/featured-3.png', beds: 4, baths: 3, area: '2,900 sqft', favorite: false },
    { id: '4', title: 'Waterfront Glass Villa', address: '18 Pacific Coast, Miami, FL', price: '$3,400,000', badge: 'Featured', badgeVariant: 'featured', imageUrl: 'assets/images/listings/featured-4.png', beds: 5, baths: 5, area: '7,300 sqft', favorite: false },
    { id: '5', title: 'Waterfront Glass Villa', address: '18 Pacific Coast, Miami, FL', price: '$3,400,000', badge: 'Featured', badgeVariant: 'featured', imageUrl: 'assets/images/listings/featured-4.png', beds: 5, baths: 5, area: '7,300 sqft', favorite: false }

  ]);

  readonly hotListings = signal<ListingItem[]>([
    { id: '5', title: 'Skyline Townhouse', address: '120 Syln Blvd, Seattle, WA', price: '$4,200', badge: 'New', badgeVariant: 'new', imageUrl: 'assets/images/listings/featured-1.png', beds: 2, baths: 2, area: '1,300 sqft', favorite: false, rent: true },
    { id: '6', title: 'Lakeview Family Estate', address: '79 Wellington Dr, Chicago, IL', price: '$1,250,000', badge: 'New', badgeVariant: 'new', imageUrl: 'assets/images/listings/featured-2.png', beds: 4, baths: 3, area: '3,800 sqft', favorite: false },
    { id: '6', title: 'Lakeview Family Estate', address: '79 Wellington Dr, Chicago, IL', price: '$1,250,000', badge: 'New', badgeVariant: 'new', imageUrl: 'assets/images/listings/featured-2.png', beds: 4, baths: 3, area: '3,800 sqft', favorite: false },
    { id: '6', title: 'Lakeview Family Estate', address: '79 Wellington Dr, Chicago, IL', price: '$1,250,000', badge: 'New', badgeVariant: 'new', imageUrl: 'assets/images/listings/featured-2.png', beds: 4, baths: 3, area: '3,800 sqft', favorite: false }

  ]);

  readonly recentListings = this.recentlyViewedService.items;
  readonly trendItems = signal<TrendItem[]>([
    { id: '1', city: 'Seattle, WA', demand: 'Hot demand score', growth: '+18.4%', summary: 'Fast rising interest for modern homes and riverfront views.' },
    { id: '2', city: 'Austin, TX', demand: 'Strong buyer activity', growth: '+21.7%', summary: 'High intent across family homes and suburban communities.' },
    { id: '3', city: 'Miami, FL', demand: 'Rental demand', growth: '+11.2%', summary: 'Luxury coastal properties continue to attract attention.' }
  ]);

  readonly agents = toSignal(
    this.agentsService.getFeaturedAgents(),
    { initialValue: [] }
  );

  readonly appPromoBullets = signal<string[]>([
    'Voice-enabled property search',
    'HD video walkthroughs',
    'Pick up where you left off',
    'Saved homes sync across devices'
  ]);

  onSearchRequested(payload: SearchPayload): void {
    console.log(payload);
    this.router.navigate(['/listings'], {
      queryParams: this.buildListingsRouteQuery(payload)
    });
  }

  onCategoryCtaClicked(category: CategoryItem): void {
    const purpose = category.purpose;
    if (!purpose) return;
    this.router.navigate(['/listings'], {
      queryParams: {
        page: 1,
        limit: 20,
        purpose,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }
    });
  }

  private buildListingsRouteQuery(
    payload: SearchPayload
  ): Record<string, string | number | null> {
    const locationName = payload.locationName?.trim() || undefined;
    const minPrice = payload.minPrice ?? undefined;
    const maxPrice = payload.maxPrice ?? undefined;
    const category =
      payload.primaryType && payload.primaryType !== 'any' ? payload.primaryType : undefined;
    const subtype =
      payload.subtype && payload.subtype !== 'any' ? payload.subtype : undefined;

    return {
      page: 1,
      limit: 20,
      purpose: payload.mode === 'rent' ? 'For Rent' : 'For Sale',
      locationName: locationName ?? null,
      propertyType: category ?? null,
      subtype: subtype ?? null,
      category: null,
      placeId: payload.placeId ?? null,
      minPrice: minPrice ?? null,
      maxPrice: maxPrice ?? null,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
  }
  onFavoriteToggled(id: string): void {
    this.featuredListings.update(items =>
      items.map(item =>
        item.id === id
          ? { ...item, favorite: !item.favorite }
          : item
      )
    );
  }

  /** Heart click on a saved-properties card removes it from the saved list */
  onSavedFavoriteToggled(id: string): void {
    this.savedService.unsave(id);
  }

}
