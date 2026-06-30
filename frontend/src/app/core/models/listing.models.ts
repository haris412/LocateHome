export type ListingPurpose = 'For Sale' | 'For Rent';
export type ListingStatus = 'Draft' | 'Published';

export interface ListingsApiImage {
  url: string;
  orderIndex: number;
  isThumbnail: boolean;
}

/** Populated `userId` on GET /api/properties */
export interface ListingsApiPropertyOwnerRef {
  _id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

/** Feature/amenity from `featureIds[]` on GET /api/properties/:id */
export interface ListingsApiFeature {
  _id: string;
  slug: string;
  name: string;
  position?: number;
}

/** Location hierarchy level (country=0, province=1, city=2, area/neighborhood=3) */
export interface ListingsApiLocation {
  level: number;
  name: string;
  id?: string;
}

export interface ListingsApiProperty {
  _id: string;
  purpose: ListingPurpose;
  propertyType: string;
  propertyTypeId?: string;
  subtype?: string;
  subtypeId?: string;
  listingTitle: string;
  propertyDescription?: string;
  price: number;
  areaSize: number;
  areaUnit: string;
  numBedrooms: number;
  numBathrooms: number;
  numParkingSpaces?: number;
  numFloors?: number;
  featureIds?: ListingsApiFeature[];
  images: ListingsApiImage[];
  videoTourUrl?: string;
  location?: ListingsApiLocation[];
  latitude?: number;
  longitude?: number;
  fullAddress: string;
  zipCode?: string;
  mapLink?: string;
  contactName: string;
  contactEmail: string;
  contactPhoneNumber: string;
  contactLocation?: string;
  isFeatured?: boolean;
  /** Listing owner; string id or populated subdocument */
  userId?: string | ListingsApiPropertyOwnerRef;
  /** Optional stable CRM / frontend key */
  listingKey?: string;
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
