import { ListingDetailModel } from '../../../core/models/listing-detail.vm';

export const LISTING_DETAIL_MOCK: ListingDetailModel = {
  id: 'listing-1200-skyline',
  breadcrumbLabel: 'Back to Search Results',
  statusChip: 'For Rent',
  shareLabel: 'Share',
  saveLabel: 'Save',

  gallery: {
    primaryImage: 'assets/images/listings/detail/living-room.jpg',
    images: [
      'assets/images/listings/detail/living-room.jpg',
      'assets/images/listings/detail/kitchen.jpg',
      'assets/images/listings/detail/bedroom.jpg'
    ],
    moreCount: 15,
    featuredTag: 'Featured rental',
    videoTag: 'Video tour available',
    showPlay: true
  },

  price: '$4,200',
  priceSuffix: '/mo',
  addressLine: '1200 Skyline Boulevard, Apt 4B, Downtown Seattle, WA 98101',
  ctaLabel: 'Schedule a Visit',

  stats: [
    { value: '2', label: 'Bedrooms', icon: 'bed' },
    { value: '2', label: 'Bathrooms', icon: 'bathtub' },
    { value: '1,100', label: 'Square feet', icon: 'square_foot' },
    { value: 'Apartment', label: 'Property type', icon: 'home' }
  ],

  about: {
    title: 'About this home',
    paragraphs: [
      'Experience elevated city living in the heart of Downtown Seattle. This premium 2-bedroom apartment features floor-to-ceiling windows, a bright open-plan living area, a designer kitchen with quartz finishes and a private balcony overlooking the skyline.',
      'Residents enjoy concierge service, a rooftop lounge, fitness studio, co-working spaces and secure resident parking. The building is minutes from Pike Place Market, light rail access, leading dining spots and major technology campuses.'
    ]
  },

  amenities: {
    title: 'Highlights & amenities',
    items: [
      { icon: 'apartment', label: '24/7 concierge service' },
      { icon: 'fitness_center', label: 'Private fitness center' },
      { icon: 'local_parking', label: 'Secure resident parking' },
      { icon: 'roofing', label: 'Rooftop lounge and terrace' },
      { icon: 'wifi', label: 'High-speed fiber internet' },
      { icon: 'shield', label: 'Smart access and security' }
    ]
  },

  videos: {
    title: 'Property videos',
    subtitle: 'Walkthrough clips, amenity previews and neighborhood visuals.',
    viewAllLabel: 'View all videos',
    items: [
      {
        id: 'video-1',
        title: 'Luxury living walkthrough',
        imageUrl: 'assets/images/listings/videos/video-1.jpg'
      },
      {
        id: 'video-2',
        title: 'Skyline rooftop tour',
        imageUrl: 'assets/images/listings/videos/video-2.jpg'
      },
      {
        id: 'video-3',
        title: 'Downtown Seattle living',
        imageUrl: 'assets/images/listings/videos/video-3.jpg'
      }
    ]
  },

  agent: {
    name: 'Sarah Jenkins',
    role: 'Listing agent',
    imageUrl: 'assets/images/agents/agent-1.jpg',
    blurb: 'Ask about rent terms, availability, move-in date or request an in-person or video tour.',
    rating: '4.9',
    listings: '42',
    responseTime: '12m'
  },

  inquiry: {
    submitLabel: 'Request a tour',
    secondary1: 'Book appointment',
    secondary2: 'Ask a question',
    defaultMessage: 'I am interested in 1200 Skyline Boulevard, Apt 4B and would like to schedule a tour.'
  },

  nearby: {
    title: 'Featured properties nearby',
    subtitle: 'More premium homes in Downtown Seattle that match your viewing history.',
    actionLabel: 'Browse all featured',
    items: [
      {
        id: 'nearby-1',
        title: '900 1st Avenue, Apt 12C',
        address: '900 1st Avenue, Apt 12C, Downtown Seattle, WA 98104',
        price: '$3,800 /mo',
        imageUrl: 'assets/images/listings/nearby/nearby-1.jpg',
        badge: 'For Rent',
        badgeVariant: 'rent',
        beds: 1,
        baths: 1,
        area: '850 sqft'
      },
      {
        id: 'nearby-2',
        title: '1400 3rd Avenue, Apt 8A',
        address: '1400 3rd Avenue, Apt 8A, Downtown Seattle, WA 98101',
        price: '$4,500 /mo',
        imageUrl: 'assets/images/listings/nearby/nearby-2.jpg',
        badge: 'For Rent',
        badgeVariant: 'rent',
        beds: 2,
        baths: 2,
        area: '1,250 sqft'
      },
      {
        id: 'nearby-3',
        title: '200 Pine Street, Apt 15F',
        address: '200 Pine Street, Apt 15F, Downtown Seattle, WA 98101',
        price: '$3,200 /mo',
        imageUrl: 'assets/images/listings/nearby/nearby-3.jpg',
        badge: 'For Rent',
        badgeVariant: 'rent',
        beds: 1,
        baths: 1,
        area: '720 sqft'
      },
      {
        id: 'nearby-4',
        title: '1101 Western Avenue, Penthouse B',
        address: '1101 Western Avenue, Penthouse B, Downtown Seattle, WA 98101',
        price: '$5,100 /mo',
        imageUrl: 'assets/images/listings/nearby/nearby-4.jpg',
        badge: 'New',
        badgeVariant: 'new',
        beds: 3,
        baths: 2.5,
        area: '1,500 sqft'
      }
    ]
  }
};