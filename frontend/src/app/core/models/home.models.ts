
export interface TrendItem {
  id: string;
  city: string;
  demand: string;
  growth: string;
  summary: string;
}

export interface CategoryItem {
  id: string;
  imgSrc: string;
  title: string;
  description: string;
  meta: string[];
  ctaLabel: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  rating: string;
  review: string;
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

export interface StatPillItem {
  id: string;
  label: string;
  value: string;
}

export interface FooterLinkGroup {
  id: string;
  title: string;
  links: { id: string; label: string; href: string }[];
}