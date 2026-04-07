import { AppointmentDateSlots } from './appointment.models';
import { ListingItem } from './listing.models';

export interface ListingAmenityItem {
  icon?: string;
  label: string;
}

export interface ListingVideoItem {
  id: string;
  title: string;
  videoUrl?: string;
  imageUrl?: string;
}

export interface ListingAgent {
  name: string;
  role: string;
  imageUrl: string;
  /** Backend user id for availability & appointments APIs */
  userId?: string;
  blurb?: string;
  rating?: string;
  listings?: string;
  responseTime?: string;
}

export interface ListingDetailModel {
  id: string;
  breadcrumbLabel?: string;
  statusChip?: string;

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
    items: ListingAmenityItem[];
  };

  videos?: {
    title?: string;
    subtitle?: string;
    viewAllLabel?: string;
    items: ListingVideoItem[];
  };

  agent: ListingAgent;

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