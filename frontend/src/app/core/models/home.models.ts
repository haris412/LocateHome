
export interface TrendItem {
  id: string;
  city: string;
  demand: string;
  growth: string;
  summary: string;
}

export type CategoryPurpose = 'For Sale' | 'For Rent';

export interface CategoryItem {
  id: string;
  imgSrc: string;
  title: string;
  description: string;
  meta: string[];
  ctaLabel: string;
  purpose?: CategoryPurpose;
}

export interface AgentItem {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  priceRange: string;
  rating: string;
  salesLabel: string;
  description: string;
  tags: string[];
  location?: string;
  phone?: string;
  properties?: number
}



