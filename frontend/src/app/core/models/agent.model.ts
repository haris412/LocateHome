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
    email?: string;
    location?: string;
  };

  meta?: {
    priceRange?: string;
    tags?: string[];
    description?: string;
    experienceYears?: number;
    languages?: string[];
    licenseNumber?: string;
    verified?: boolean;
  };
}

export interface AgentFilters {
  location: string | null;
  agency:   string | null;
  rating:   number | null;
}
