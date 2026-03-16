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