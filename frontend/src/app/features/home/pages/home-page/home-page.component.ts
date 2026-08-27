import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CategoryItem } from '@/core/models/home.models';
import { SearchPayload } from '@/core/interfaces/search-payload.interface';
import { ListingItem } from '@/core/models/listing.models';
import { AgentsService } from '../../../agents/services/agents.service';
import { ListingsService } from '../../../listings/services/listings.service';
import { HeroSectionComponent } from '../../components/hero-section/hero-section.component';
import { SearchPanelComponent } from '../../components/search-panel/search-panel.component';
import { AgentsSectionComponent } from '../../components/agents-section/agents-section.component';
import { AppPromoSectionComponent } from '../../components/app-promo-section/app-promo-section.component';
import { ValuationSectionComponent } from '../../components/valuation-section/valuation-section.component';
import { ListingsCarouselSectionComponent } from '@/shared/ui/listings-carousel-section/listings-carousel-section.component';

@Component({
  selector: 'app-home-page',
  imports: [
    HeroSectionComponent,
    SearchPanelComponent,
    AgentsSectionComponent,
    AppPromoSectionComponent,
    ValuationSectionComponent,
    ListingsCarouselSectionComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent {
  private readonly router = inject(Router);
  private readonly agentsService = inject(AgentsService);
  private readonly listingsService = inject(ListingsService);

  readonly agents = toSignal(this.agentsService.getFeaturedAgents(), {
    initialValue: []
  });
  readonly hotListings = signal<ListingItem[]>([]);
  readonly lastPlaceId = signal('');
  readonly lastLocationName = signal('');

  readonly hotBrowseQuery = computed(() => ({
    isHot: true,
    placeId: this.lastPlaceId() || null,
    locationName: this.lastLocationName() || null,
    page: 1
  }));

  readonly appPromoBullets = signal<string[]>([
    'Smart Search',
    'Save & Compare',
    'Connect Instantly',
    'Stay Updated'
  ]);

  readonly appPromoFeatureDescriptions = signal<string[]>([
    'Find properties that match your location and lifestyle.',
    'Shortlist and compare the homes you care about.',
    'Chat with verified agents and get quick responses.',
    'Receive alerts for new listings and important updates.'
  ]);

  constructor() {
    const last = this.listingsService.readLastPlace();
    if (last?.placeId) {
      this.lastPlaceId.set(last.placeId);
      this.lastLocationName.set(last.locationName);
      this.listingsService.getHotCarousel({ placeId: last.placeId }).subscribe((items) => {
        this.hotListings.set(items);
      });
    }
  }

  onSearchRequested(payload: SearchPayload): void {
    if (payload.placeId) {
      this.listingsService.saveLastPlace(payload.placeId, payload.locationName);
    }
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
}
