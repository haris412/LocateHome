import { AppointmentDateSlots } from './appointment.models';
import { ListingItem, ListingPurpose } from './listing.models';

/** Amenity row for property detail (UI). */
export interface PropertyAmenityItem {
  icon?: string;
  label: string;
}

export interface PropertyVideoItem {
  id: string;
  title: string;
  videoUrl?: string;
  imageUrl?: string;
}

/** Contact / listing agent shown on property detail (from Property contact fields + owner userId). */
export interface PropertyAgent {
  name: string;
  role: string;
  imageUrl: string;
  /** Backend user id for availability & appointments APIs */
  userId?: string;
  blurb?: string;
  rating?: string;
  listings?: string;
  responseTime?: string;
  email?: string;
  phone?: string;
}

/**
 * View model for property detail page — maps from Mongoose `Property` / GET /api/properties shape.
 */
export interface PropertyDetailViewModel {
  /** Mongo `_id` */
  id: string;
  /** Optional stable key from CRM (`listingKey`) */
  listingKey?: string;
  /** API `listingTitle` */
  listingTitle: string;
  /** API `purpose` — For Sale / For Rent */
  purpose: ListingPurpose;
  breadcrumbLabel?: string;
  /** API `status` — e.g. Published */
  statusChip?: string;
  /** API `mapLink` */
  mapLink?: string;

  shareLabel?: string;
  saveLabel?: string;

  gallery: {
    primaryImage: string;
    images: string[];
    moreCount?: number;
    featuredTag?: string;
    videoTag?: string;
    showPlay?: boolean;
  };

  price: string;
  priceSuffix?: string;
  addressLine: string;
  ctaLabel?: string;

  stats: Array<{
    value: string;
    label: string;
    icon?: string;
  }>;

  about: {
    title?: string;
    paragraphs: string[];
  };

  amenities: {
    title?: string;
    items: PropertyAmenityItem[];
  };

  videos?: {
    title?: string;
    subtitle?: string;
    viewAllLabel?: string;
    items: PropertyVideoItem[];
  };

  agent: PropertyAgent;

  inquiry: {
    submitLabel?: string;
    secondary1?: string;
    secondary2?: string;
    defaultMessage?: string;
  };

  nearby?: {
    title?: string;
    subtitle?: string;
    actionLabel?: string;
    items?: ListingItem[];
  };

  appointmentDateSlots?: AppointmentDateSlots[];
}
