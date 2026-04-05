export type ListingPurpose = 'For Sale' | 'For Rent';
export type ListingStatus = 'Draft' | 'Published';

export interface ListingsApiImage {
  url: string;
  orderIndex: number;
  isThumbnail: boolean;
}

export interface ListingsApiProperty {
  _id: string;
  purpose: ListingPurpose;
  propertyType: string;
  listingTitle: string;
  propertyDescription: string;
  price: number;
  areaSize: number;
  areaUnit: string;
  numBedrooms: number;
  numBathrooms: number;
  hasWifi?: boolean;
  hasSwimmingPool?: boolean;
  hasGym?: boolean;
  hasGarage?: boolean;
  hasCentralAc?: boolean;
  hasBalcony?: boolean;
  hasSecurity?: boolean;
  hasGarden?: boolean;
  images: ListingsApiImage[];
  videoTourUrl?: string;
  city: string;
  neighborhood?: string;
  fullAddress: string;
  mapLink?: string;
  contactName: string;
  contactEmail: string;
  contactPhoneNumber: string;
  contactLocation?: string;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ListingsApiResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: {
    properties: ListingsApiProperty[];
  };
}

export type ListingBadgeVariant =
  | 'sale'
  | 'rent'
  | 'featured'
  | 'viewed'
  | 'new'
  | 'verified';

export interface ListingItem {
  id: string;
  title: string;
  address: string;
  price: string;
  badge?: string;
  badgeVariant?: ListingBadgeVariant;
  imageUrl: string;
  beds: number;
  baths: number;
  area: string;
  favorite?: boolean;
  rent?: boolean;
}
