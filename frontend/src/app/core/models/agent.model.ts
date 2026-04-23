export interface AgentItem {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;

  stats: {
    rating: number;
    properties?: number;
    salesLabel?: string;
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