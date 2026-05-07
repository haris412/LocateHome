import { AgentItem } from '@/core/models/agent.model';

export const AGENTS_MOCK: readonly AgentItem[] = [
  {
    id: '1',
    name: 'Sophia Bennett',
    agencyName: 'Luxury specialist',
    avatarUrl: 'assets/images/people/agent-1.png',
    stats: { rating: 4.9, publishedListings: 49, },
    contact: { phone: '+1 213 555 0198', location: 'Beverly Hills, CA' },
    meta: {
      priceRange: '$2M+',
      tags: ['Luxury', 'Video tours', 'Negotiation'],
      description: 'Known for premium city homes and guided buying journeys.'
    }
  },
  {
    id: '2',
    name: 'Arman Sheikh',
    agencyName: 'Residential advisor',
    avatarUrl: 'assets/images/people/agent-2.png',
    stats: { rating: 4.8, publishedListings: 32, },
    contact: { phone: '+1 512 555 0142', location: 'Austin, TX' },
    meta: {
      priceRange: '$400k - $1.8M',
      tags: ['Family homes', 'Investors', 'Neighborhood expert'],
      description: 'Strong fit for family homes and suburban buyers.'
    }
  },
  {
    id: '3',
    name: 'Daniel Rivera',
    agencyName: 'Rental market lead',
    avatarUrl: 'assets/images/people/agent-3.png',
    stats: { rating: 5.0, publishedListings: 65, },
    contact: { phone: '+1 212 555 0176', location: 'New York, NY' },
    meta: {
      priceRange: '$1.2k - $8k / mo',
      tags: ['Rentals', 'Fast response', 'Local market'],
      description: 'Helps renters move faster with curated shortlists and tour support.'
    }
  },
  {
    id: '4',
    name: 'Camila Torres',
    agencyName: 'Commercial broker',
    avatarUrl: 'assets/images/people/agent-1.png',
    stats: { rating: 4.7, publishedListings: 51, },
    contact: { phone: '+1 305 555 0119', location: 'Miami, FL' },
    meta: {
      priceRange: '$750k - $6M',
      tags: ['Commercial', 'Leasing', 'Market analysis'],
      description: 'Specializes in retail and mixed-use spaces with strong ROI focus.'
    }
  },
  {
    id: '5',
    name: 'Omar Khalid',
    agencyName: 'Prime Nest Agency',
    avatarUrl: 'assets/images/people/agent-2.png',
    stats: { rating: 4.6, publishedListings: 39, },
    contact: { phone: '+1 408 555 0124', location: 'San Jose, CA' },
    meta: {
      priceRange: '$500k - $2.4M',
      tags: ['First-time buyers', 'Condos', 'Financing'],
      description: 'Guides buyers through end-to-end purchase and lender coordination.'
    }
  },
  {
    id: '6',
    name: 'Ayesha Khan',
    agencyName: 'Metropolitan Circle',
    avatarUrl: 'assets/images/people/agent-3.png',
    stats: { rating: 4.8, publishedListings: 72, },
    contact: { phone: '+1 312 555 0107', location: 'Chicago, IL' },
    meta: {
      priceRange: '$250k - $1.2M',
      tags: ['Relocation', 'Neighborhood expert', 'Negotiation'],
      description: 'Known for fast shortlists and smooth relocations for busy clients.'
    }
  },
  {
    id: '7',
    name: 'Luca Moretti',
    agencyName: 'Harbor & Stone',
    avatarUrl: 'assets/images/people/agent-1.png',
    stats: { rating: 4.9, publishedListings: 58, },
    contact: { phone: '+1 415 555 0133', location: 'San Francisco, CA' },
    meta: {
      priceRange: '$900k - $4.5M',
      tags: ['Luxury', 'Waterfront', 'Off-market'],
      description: 'Matches clients with off-market opportunities and premium waterfront homes.'
    }
  },
  {
    id: '8',
    name: 'Noah Park',
    agencyName: 'Urban Key Estates',
    avatarUrl: 'assets/images/people/agent-2.png',
    stats: { rating: 4.5, publishedListings: 28, },
    contact: { phone: '+1 206 555 0181', location: 'Seattle, WA' },
    meta: {
      priceRange: '$350k - $2.0M',
      tags: ['Modern homes', 'New builds', 'Video tours'],
      description: 'Focused on modern builds with strong walkthrough content and transparent comps.'
    }
  },
  {
    id: '9',
    name: 'Emma Collins',
    agencyName: 'Crestline Realty',
    avatarUrl: 'assets/images/people/agent-3.png',
    stats: { rating: 4.7, publishedListings: 44, },
    contact: { phone: '+1 646 555 0129', location: 'Brooklyn, NY' },
    meta: {
      priceRange: '$2.5k - $12k / mo',
      tags: ['Rentals', 'Corporate leasing', 'Fast response'],
      description: 'Handles corporate leasing and premium rentals with quick turnaround.'
    }
  },
  {
    id: '10',
    name: 'Hassan Ali',
    agencyName: 'Residential consultant',
    avatarUrl: 'assets/images/people/agent-1.png',
    stats: { rating: 4.6, publishedListings: 36, },
    contact: { phone: '+1 713 555 0164', location: 'Houston, TX' },
    meta: {
      priceRange: '$220k - $950k',
      tags: ['Family homes', 'Suburbs', 'Schools'],
      description: 'Optimizes searches around school districts, commute times, and long-term value.'
    }
  },
  {
    id: '11',
    name: 'Sara Mahmood',
    agencyName: 'Luxury advisor',
    avatarUrl: 'assets/images/people/agent-2.png',
    stats: { rating: 5.0, publishedListings: 19, },
    contact: { phone: '+1 702 555 0157', location: 'Las Vegas, NV' },
    meta: {
      priceRange: '$1.5M - $9M',
      tags: ['Luxury', 'High-rise', 'Investor'],
      description: 'Curates high-end inventory and investor-friendly opportunities.'
    }
  },
  {
    id: '12',
    name: 'Jason Lee',
    agencyName: 'Commercial leasing',
    avatarUrl: 'assets/images/people/agent-3.png',
    stats: { rating: 4.8, publishedListings: 63, },
    contact: { phone: '+1 617 555 0112', location: 'Boston, MA' },
    meta: {
      priceRange: '$600k - $5.5M',
      tags: ['Commercial', 'Leasing', 'Due diligence'],
      description: 'Supports due diligence, lease negotiation, and long-term tenant strategy.'
    }
  }
] as const;