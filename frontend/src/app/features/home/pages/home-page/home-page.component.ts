import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  AgentItem,
  CategoryItem,
  FooterLinkGroup,
  StatPillItem,
  TestimonialItem,
  TrendItem
} from '../../../../core/models/home.models';
import { ListingItem } from '../../../../core/models/listing.models';
import { HeroSectionComponent } from '../../components/hero-section/hero-section.component';
import { SearchPanelComponent } from '../../components/search-panel/search-panel.component';
import { ListingsCarouselSectionComponent } from '../../../../shared/ui/listings-carousel-section/listings-carousel-section.component';
import { TrendingPanelComponent } from '../../components/trending-panel/trending-panel.component';
import { CategoriesSectionComponent } from '../../components/categories-section/categories-section.component';
import { TestimonialsSectionComponent } from '../../components/testimonials-section/testimonials-section.component';
import { AgentsSectionComponent } from '../../components/agents-section/agents-section.component';
import { AppPromoSectionComponent } from '../../components/app-promo-section/app-promo-section.component';
import { FooterSectionComponent } from '../../components/footer-section/footer-section.component';
import { HeaderComponent } from '../../../../shared/ui/header/header.component';
import { SectionHeadingComponent } from '../../../../shared/ui/section-heading/section-heading.component';

@Component({
  selector: 'app-home-page',
  imports: [
    HeroSectionComponent,
    SearchPanelComponent,
    ListingsCarouselSectionComponent,
    TrendingPanelComponent,
    CategoriesSectionComponent,
    TestimonialsSectionComponent,
    AgentsSectionComponent,
    AppPromoSectionComponent,
    FooterSectionComponent,
    SectionHeadingComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent {
  readonly heroStats = signal<StatPillItem[]>([
    { id: '1', label: 'Properties', value: '12k+' },
    { id: '2', label: 'Verified agents', value: '1.2k' },
    { id: '3', label: 'Tours watched', value: '85k+' }
  ]);

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

  readonly recentListings = signal<ListingItem[]>([
    { id: '7', title: 'Skyline Boulevard Apartment', address: '302 Green Boulevard, Seattle, WA', price: '$4,200', badge: 'Viewed', badgeVariant: 'viewed', imageUrl: 'assets/images/listings/featured-3.png', beds: 2, baths: 2, area: '950 sqft', favorite: false, rent: true },
    { id: '8', title: 'Oakwood Family Residence', address: '22 Oakwood Drive, Austin, TX', price: '$945,000', badge: 'Viewed', badgeVariant: 'viewed', imageUrl: 'assets/images/listings/featured-4.png', beds: 4, baths: 2, area: '2,850 sqft', favorite: true },
    { id: '9', title: 'Fifth Avenue Penthouse', address: '620 5th Ave, New York, NY', price: '$8,500', badge: 'Viewed', badgeVariant: 'viewed', imageUrl: 'assets/images/listings/featured-1.png', beds: 3, baths: 3, area: '2,300 sqft', favorite: false, rent: true },
  ]);
  readonly trendItems = signal<TrendItem[]>([
    { id: '1', city: 'Seattle, WA', demand: 'Hot demand score', growth: '+18.4%', summary: 'Fast rising interest for modern homes and riverfront views.' },
    { id: '2', city: 'Austin, TX', demand: 'Strong buyer activity', growth: '+21.7%', summary: 'High intent across family homes and suburban communities.' },
    { id: '3', city: 'Miami, FL', demand: 'Rental demand', growth: '+11.2%', summary: 'Luxury coastal properties continue to attract attention.' }
  ]);

  readonly categories = signal<CategoryItem[]>([
    { id: '1', imgSrc: 'assets/images/home/buy-home.png', title: 'Buy a home', description: 'Browse verified listings with HD video tours, neighborhood insights and real-time market data.', meta: ['Market trends', 'Price history', 'Agent support'], ctaLabel: 'Start buying journey' },
    { id: '2', imgSrc: 'assets/images/home/rent-home.png', title: 'Rent a home', description: 'Find the best rentals with virtual showings, instant applications and secure online payments.', meta: ['Verified rentals', 'Flexible leases', 'No hidden fees'], ctaLabel: 'Explore rentals' },
    { id: '3', imgSrc: 'assets/images/home/sell-home.png', title: 'Sell a home', description: 'Showcase your property with immersive video tours, professional insights and smart pricing tools.', meta: ['Free valuation', 'Expert guidance', 'Wider reach'], ctaLabel: 'Start selling' }
  ]);

  readonly testimonials = signal<TestimonialItem[]>([
    { id: '1', name: 'Emily Carter', role: 'Buyer in San Diego', avatarUrl: 'assets/images/people/testimonial-1.jpg', rating: '4.8', review: 'The video tours made it so much easier to shortlist homes before visiting in person.' },
    { id: '2', name: 'James Hudson', role: 'Seller in Seattle', avatarUrl: 'assets/images/people/testimonial-2.jpg', rating: '5.0', review: 'I listed with live walkthroughs and the engagement was noticeably higher than other portals.' },
    { id: '3', name: 'Sandra Parker', role: 'Renter in Austin', avatarUrl: 'assets/images/people/testimonial-3.jpg', rating: '4.9', review: 'The process felt modern, simple and transparent from first search to final move.' }
  ]);

  readonly agents = signal<AgentItem[]>([
    { id: '1', name: 'Sophia Bennett', role: 'Luxury specialist', avatarUrl: 'assets/images/people/agent-1.png', priceRange: '$2M+', rating: '4.9 / 5', salesLabel: '49 listings', description: 'Known for premium city homes and guided buying journeys.', tags: ['Luxury', 'Video tours', 'Negotiation'] },
    { id: '2', name: 'Arman Sheikh', role: 'Residential advisor', avatarUrl: 'assets/images/people/agent-2.png', priceRange: '$400k - $1.8M', rating: '4.8 / 5', salesLabel: '32 listings', description: 'Strong fit for family homes and suburban buyers.', tags: ['Family homes', 'Investors', 'Neighborhood expert'] },
    { id: '3', name: 'Daniel Rivera', role: 'Rental market lead', avatarUrl: 'assets/images/people/agent-3.png', priceRange: '$1.2k - $8k / mo', rating: '5.0 / 5', salesLabel: '65 listings', description: 'Helps renters move faster with curated shortlists and tour support.', tags: ['Rentals', 'Fast response', 'Local market'] }
  ]);

  readonly footerGroups = signal<FooterLinkGroup[]>([
    {
      id: '1',
      title: 'Explore',
      links: [
        { id: 'a', label: 'Homes for sale', href: '#' },
        { id: 'b', label: 'Homes for rent', href: '#' },
        { id: 'c', label: 'Luxury homes', href: '#' }
      ]
    },
    {
      id: '2',
      title: 'Company',
      links: [
        { id: 'a', label: 'About us', href: '#' },
        { id: 'b', label: 'Careers', href: '#' },
        { id: 'c', label: 'Press', href: '#' }
      ]
    },
    {
      id: '3',
      title: 'Support',
      links: [
        { id: 'a', label: 'Help center', href: '#' },
        { id: 'b', label: 'Privacy policy', href: '#' },
        { id: 'c', label: 'Terms', href: '#' }
      ]
    }
  ]);

  readonly appPromoBullets = signal<string[]>([
    'Voice-enabled property search',
    'HD video walkthroughs',
    'Pick up where you left off',
    'Saved homes sync across devices'
  ]);
}