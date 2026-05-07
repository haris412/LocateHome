export interface AgentItem {
  id: string;
  name: string;
  agencyName: string;
  avatarUrl: string;

  stats: {
    rating?: number;
    ratingCount?: number;
    publishedListings?: number;
  };

  contact?: {
    phone?: string;
    location?: string;
  };

  meta?: {
    priceRange?: string;
    tags?: string[];
    description?: string;
  };
}

export interface AgentFilters {
  location: string | null;
  agency:   string | null;
  rating:   number | null;
}
