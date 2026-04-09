import { PropertyDetailViewModel } from '../../../core/models/property-detail.vm';
import { AppointmentDateSlots } from '../../../core/models/appointment.models';

const MOCK_APPOINTMENT_DATE_SLOTS: AppointmentDateSlots[] = [
  {
    date: '2026-03-18',
    slots: [
      { id: '2026-03-18-0900', label: '09:00 AM', hour24: 9, minute: 0, meridiem: 'AM', status: 'available' },
      { id: '2026-03-18-1000', label: '10:00 AM', hour24: 10, minute: 0, meridiem: 'AM', status: 'confirmed', note: 'Agent on-site' },
      { id: '2026-03-18-1100', label: '11:00 AM', hour24: 11, minute: 0, meridiem: 'AM', status: 'booked', note: 'Already reserved' },
      { id: '2026-03-18-1200', label: '12:00 PM', hour24: 12, minute: 0, meridiem: 'PM', status: 'available' },
      { id: '2026-03-18-1300', label: '01:00 PM', hour24: 13, minute: 0, meridiem: 'PM', status: 'available' },
      { id: '2026-03-18-1500', label: '03:00 PM', hour24: 15, minute: 0, meridiem: 'PM', status: 'blocked', note: 'Office closed' },
      { id: '2026-03-18-1700', label: '05:00 PM', hour24: 17, minute: 0, meridiem: 'PM', status: 'available' }
    ]
  },
  {
    date: '2026-03-19',
    slots: [
      { id: '2026-03-19-0900', label: '09:00 AM', hour24: 9, minute: 0, meridiem: 'AM', status: 'booked' },
      { id: '2026-03-19-1000', label: '10:00 AM', hour24: 10, minute: 0, meridiem: 'AM', status: 'booked' },
      { id: '2026-03-19-1100', label: '11:00 AM', hour24: 11, minute: 0, meridiem: 'AM', status: 'available' },
      { id: '2026-03-19-1200', label: '12:00 PM', hour24: 12, minute: 0, meridiem: 'PM', status: 'confirmed' },
      { id: '2026-03-19-1300', label: '01:00 PM', hour24: 13, minute: 0, meridiem: 'PM', status: 'blocked', note: 'Internal meeting' },
      { id: '2026-03-19-1400', label: '02:00 PM', hour24: 14, minute: 0, meridiem: 'PM', status: 'available' },
      { id: '2026-03-19-1600', label: '04:00 PM', hour24: 16, minute: 0, meridiem: 'PM', status: 'available' }
    ]
  },
  {
    date: '2026-03-20',
    slots: [
      { id: '2026-03-20-0900', label: '09:00 AM', hour24: 9, minute: 0, meridiem: 'AM', status: 'blocked', note: 'Agent unavailable' },
      { id: '2026-03-20-1000', label: '10:00 AM', hour24: 10, minute: 0, meridiem: 'AM', status: 'blocked', note: 'Agent unavailable' },
      { id: '2026-03-20-1100', label: '11:00 AM', hour24: 11, minute: 0, meridiem: 'AM', status: 'available' },
      { id: '2026-03-20-1200', label: '12:00 PM', hour24: 12, minute: 0, meridiem: 'PM', status: 'available' },
      { id: '2026-03-20-1300', label: '01:00 PM', hour24: 13, minute: 0, meridiem: 'PM', status: 'booked' },
      { id: '2026-03-20-1500', label: '03:00 PM', hour24: 15, minute: 0, meridiem: 'PM', status: 'confirmed', note: 'Virtual tour slot' },
      { id: '2026-03-20-1700', label: '05:00 PM', hour24: 17, minute: 0, meridiem: 'PM', status: 'available' }
    ]
  },
  {
    date: '2026-03-21',
    slots: [
      { id: '2026-03-21-1000', label: '10:00 AM', hour24: 10, minute: 0, meridiem: 'AM', status: 'available' },
      { id: '2026-03-21-1100', label: '11:00 AM', hour24: 11, minute: 0, meridiem: 'AM', status: 'available' },
      { id: '2026-03-21-1200', label: '12:00 PM', hour24: 12, minute: 0, meridiem: 'PM', status: 'available' },
      { id: '2026-03-21-1300', label: '01:00 PM', hour24: 13, minute: 0, meridiem: 'PM', status: 'booked' },
      { id: '2026-03-21-1400', label: '02:00 PM', hour24: 14, minute: 0, meridiem: 'PM', status: 'booked' },
      { id: '2026-03-21-1500', label: '03:00 PM', hour24: 15, minute: 0, meridiem: 'PM', status: 'blocked', note: 'Office closed' }
    ]
  },
  {
    date: '2026-03-22',
    slots: [
      { id: '2026-03-22-1100', label: '11:00 AM', hour24: 11, minute: 0, meridiem: 'AM', status: 'blocked', note: 'Sunday off' },
      { id: '2026-03-22-1200', label: '12:00 PM', hour24: 12, minute: 0, meridiem: 'PM', status: 'blocked', note: 'Sunday off' },
      { id: '2026-03-22-1300', label: '01:00 PM', hour24: 13, minute: 0, meridiem: 'PM', status: 'blocked', note: 'Sunday off' },
      { id: '2026-03-22-1400', label: '02:00 PM', hour24: 14, minute: 0, meridiem: 'PM', status: 'blocked', note: 'Sunday off' }
    ]
  },
  {
    date: '2026-03-23',
    slots: [
      { id: '2026-03-23-0900', label: '09:00 AM', hour24: 9, minute: 0, meridiem: 'AM', status: 'available' },
      { id: '2026-03-23-1000', label: '10:00 AM', hour24: 10, minute: 0, meridiem: 'AM', status: 'available' },
      { id: '2026-03-23-1100', label: '11:00 AM', hour24: 11, minute: 0, meridiem: 'AM', status: 'confirmed' },
      { id: '2026-03-23-1200', label: '12:00 PM', hour24: 12, minute: 0, meridiem: 'PM', status: 'available' },
      { id: '2026-03-23-1300', label: '01:00 PM', hour24: 13, minute: 0, meridiem: 'PM', status: 'available' },
      { id: '2026-03-23-1500', label: '03:00 PM', hour24: 15, minute: 0, meridiem: 'PM', status: 'booked' },
      { id: '2026-03-23-1600', label: '04:00 PM', hour24: 16, minute: 0, meridiem: 'PM', status: 'available' }
    ]
  },
  {
    date: '2026-03-24',
    slots: [
      { id: '2026-03-24-0900', label: '09:00 AM', hour24: 9, minute: 0, meridiem: 'AM', status: 'booked' },
      { id: '2026-03-24-1000', label: '10:00 AM', hour24: 10, minute: 0, meridiem: 'AM', status: 'booked' },
      { id: '2026-03-24-1100', label: '11:00 AM', hour24: 11, minute: 0, meridiem: 'AM', status: 'booked' },
      { id: '2026-03-24-1200', label: '12:00 PM', hour24: 12, minute: 0, meridiem: 'PM', status: 'confirmed' },
      { id: '2026-03-24-1300', label: '01:00 PM', hour24: 13, minute: 0, meridiem: 'PM', status: 'available' },
      { id: '2026-03-24-1400', label: '02:00 PM', hour24: 14, minute: 0, meridiem: 'PM', status: 'available' },
      { id: '2026-03-24-1500', label: '03:00 PM', hour24: 15, minute: 0, meridiem: 'PM', status: 'blocked', note: 'Travel time' }
    ]
  },
  {
    date: '2026-03-25',
    slots: [
      { id: '2026-03-25-0900', label: '09:00 AM', hour24: 9, minute: 0, meridiem: 'AM', status: 'available' },
      { id: '2026-03-25-1000', label: '10:00 AM', hour24: 10, minute: 0, meridiem: 'AM', status: 'available' },
      { id: '2026-03-25-1100', label: '11:00 AM', hour24: 11, minute: 0, meridiem: 'AM', status: 'available' },
      { id: '2026-03-25-1200', label: '12:00 PM', hour24: 12, minute: 0, meridiem: 'PM', status: 'booked' },
      { id: '2026-03-25-1300', label: '01:00 PM', hour24: 13, minute: 0, meridiem: 'PM', status: 'booked' },
      { id: '2026-03-25-1400', label: '02:00 PM', hour24: 14, minute: 0, meridiem: 'PM', status: 'confirmed' },
      { id: '2026-03-25-1700', label: '05:00 PM', hour24: 17, minute: 0, meridiem: 'PM', status: 'available' }
    ]
  },
  {
    date: '2026-03-26',
    slots: [
      { id: '2026-03-26-0900', label: '09:00 AM', hour24: 9, minute: 0, meridiem: 'AM', status: 'blocked', note: 'Maintenance visit' },
      { id: '2026-03-26-1000', label: '10:00 AM', hour24: 10, minute: 0, meridiem: 'AM', status: 'available' },
      { id: '2026-03-26-1100', label: '11:00 AM', hour24: 11, minute: 0, meridiem: 'AM', status: 'available' },
      { id: '2026-03-26-1200', label: '12:00 PM', hour24: 12, minute: 0, meridiem: 'PM', status: 'available' },
      { id: '2026-03-26-1300', label: '01:00 PM', hour24: 13, minute: 0, meridiem: 'PM', status: 'confirmed' },
      { id: '2026-03-26-1400', label: '02:00 PM', hour24: 14, minute: 0, meridiem: 'PM', status: 'booked' },
      { id: '2026-03-26-1600', label: '04:00 PM', hour24: 16, minute: 0, meridiem: 'PM', status: 'available' }
    ]
  },
  {
    date: '2026-03-27',
    slots: [
      { id: '2026-03-27-0900', label: '09:00 AM', hour24: 9, minute: 0, meridiem: 'AM', status: 'available' },
      { id: '2026-03-27-1000', label: '10:00 AM', hour24: 10, minute: 0, meridiem: 'AM', status: 'available' },
      { id: '2026-03-27-1100', label: '11:00 AM', hour24: 11, minute: 0, meridiem: 'AM', status: 'available' },
      { id: '2026-03-27-1200', label: '12:00 PM', hour24: 12, minute: 0, meridiem: 'PM', status: 'available' },
      { id: '2026-03-27-1300', label: '01:00 PM', hour24: 13, minute: 0, meridiem: 'PM', status: 'available' },
      { id: '2026-03-27-1500', label: '03:00 PM', hour24: 15, minute: 0, meridiem: 'PM', status: 'confirmed' },
      { id: '2026-03-27-1700', label: '05:00 PM', hour24: 17, minute: 0, meridiem: 'PM', status: 'booked' }
    ]
  },
  {
    date: '2026-03-28',
    slots: [
      { id: '2026-03-28-1000', label: '10:00 AM', hour24: 10, minute: 0, meridiem: 'AM', status: 'available' },
      { id: '2026-03-28-1100', label: '11:00 AM', hour24: 11, minute: 0, meridiem: 'AM', status: 'booked' },
      { id: '2026-03-28-1200', label: '12:00 PM', hour24: 12, minute: 0, meridiem: 'PM', status: 'available' },
      { id: '2026-03-28-1300', label: '01:00 PM', hour24: 13, minute: 0, meridiem: 'PM', status: 'blocked', note: 'Office closed' },
      { id: '2026-03-28-1400', label: '02:00 PM', hour24: 14, minute: 0, meridiem: 'PM', status: 'available' },
      { id: '2026-03-28-1500', label: '03:00 PM', hour24: 15, minute: 0, meridiem: 'PM', status: 'confirmed' }
    ]
  },
  {
    date: '2026-03-30',
    slots: [
      { id: '2026-03-30-0900', label: '09:00 AM', hour24: 9, minute: 0, meridiem: 'AM', status: 'available' },
      { id: '2026-03-30-1000', label: '10:00 AM', hour24: 10, minute: 0, meridiem: 'AM', status: 'available' },
      { id: '2026-03-30-1100', label: '11:00 AM', hour24: 11, minute: 0, meridiem: 'AM', status: 'confirmed' },
      { id: '2026-03-30-1200', label: '12:00 PM', hour24: 12, minute: 0, meridiem: 'PM', status: 'booked' },
      { id: '2026-03-30-1300', label: '01:00 PM', hour24: 13, minute: 0, meridiem: 'PM', status: 'booked' },
      { id: '2026-03-30-1400', label: '02:00 PM', hour24: 14, minute: 0, meridiem: 'PM', status: 'available' },
      { id: '2026-03-30-1600', label: '04:00 PM', hour24: 16, minute: 0, meridiem: 'PM', status: 'available' }
    ]
  },
  {
    date: '2026-03-31',
    slots: [
      { id: '2026-03-31-0900', label: '09:00 AM', hour24: 9, minute: 0, meridiem: 'AM', status: 'available' },
      { id: '2026-03-31-1000', label: '10:00 AM', hour24: 10, minute: 0, meridiem: 'AM', status: 'blocked', note: 'Team sync' },
      { id: '2026-03-31-1100', label: '11:00 AM', hour24: 11, minute: 0, meridiem: 'AM', status: 'available' },
      { id: '2026-03-31-1200', label: '12:00 PM', hour24: 12, minute: 0, meridiem: 'PM', status: 'available' },
      { id: '2026-03-31-1300', label: '01:00 PM', hour24: 13, minute: 0, meridiem: 'PM', status: 'confirmed' },
      { id: '2026-03-31-1500', label: '03:00 PM', hour24: 15, minute: 0, meridiem: 'PM', status: 'booked' },
      { id: '2026-03-31-1700', label: '05:00 PM', hour24: 17, minute: 0, meridiem: 'PM', status: 'available' }
    ]
  }
];

/** Sample detail VM for tests / Storybook — prefer live GET /api/properties/:id in the app. */
export const PROPERTY_DETAIL_MOCK: PropertyDetailViewModel = {
  /** Same as GET /api/properties `._id` for this listing */
  id: '69d41533bebdffe528467380',
  listingTitle: '1200 Skyline Boulevard, Apt 4B',
  purpose: 'For Rent',
  breadcrumbLabel: 'Downtown Seattle · Seattle',
  statusChip: 'Published',
  mapLink: 'https://maps.google.com/?q=1200+Skyline+Blvd+Seattle',
  shareLabel: 'Share',
  saveLabel: 'Save',

  gallery: {
    primaryImage: 'assets/images/listings/featured-1.png',
    images: [
      'assets/images/listings/featured-1.png',
      'assets/images/listings/featured-2.png',
      'assets/images/listings/featured-3.png'
    ],
    moreCount: 15,
    featuredTag: 'For Rent',
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
    title: 'About this property',
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
        imageUrl: 'assets/images/listings/featured-1.png'
      },
      {
        id: 'video-2',
        title: 'Skyline rooftop tour',
        imageUrl: 'assets/images/listings/featured-2.png'
      },
      {
        id: 'video-3',
        title: 'Downtown Seattle living',
        imageUrl: 'assets/images/listings/featured-3.png'
      }
    ]
  },

  agent: {
    name: 'Sarah Jenkins',
    role: 'Listing agent',
    imageUrl: 'assets/images/people/agent-1.png',
    userId: '69c98f7b76bde59142889030',
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
        imageUrl: 'assets/images/listings/featured-1.png',
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
        imageUrl: 'assets/images/listings/featured-2.png',
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
        imageUrl: 'assets/images/listings/featured-3.png',
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
        imageUrl: 'assets/images/listings/featured-4.png',
        badge: 'New',
        badgeVariant: 'new',
        beds: 3,
        baths: 2.5,
        area: '1,500 sqft'
      }
    ]
  },
  appointmentDateSlots: MOCK_APPOINTMENT_DATE_SLOTS
};

/** @deprecated Use `PROPERTY_DETAIL_MOCK`. */
export const LISTING_DETAIL_MOCK = PROPERTY_DETAIL_MOCK;
