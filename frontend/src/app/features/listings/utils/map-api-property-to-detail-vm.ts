import { ListingsApiProperty, ListingPurpose } from '../../../core/models/listing.models';
import {
  PropertyAmenityItem,
  PropertyDetailViewModel,
  PropertyVideoItem
} from '../../../core/models/property-detail.vm';
import { resolvePropertyImageUrlForDisplay } from './property-image-url.util';

const DEFAULT_AGENT_IMAGE = 'assets/svgs/agent_avatar.svg';

function formatPrice(price: number, purpose: ListingPurpose): string {
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(price);
  return purpose === 'For Rent' ? `$${formatted} / mo` : `$${formatted}`;
}

function ownerUserId(property: ListingsApiProperty): string | undefined {
  const u = property.userId;
  if (typeof u === 'string' && u.trim()) return u.trim();
  if (u && typeof u === 'object' && '_id' in u && typeof u._id === 'string') {
    return u._id.trim();
  }
  return undefined;
}

const FEATURE_SLUG_ICON: Record<string, string> = {
  'wifi':              'wifi',
  'swimming-pool':     'pool',
  'gym':               'fitness_center',
  'garage':            'garage',
  'central-ac':        'ac_unit',
  'balcony':           'balcony',
  'security':          'shield',
  'garden':            'yard',
  'elevator':          'elevator',
  'laundry-room':      'local_laundry_service',
  'laundry':           'local_laundry_service',
  'furnished':         'chair',
  'pet-friendly':      'pets',
  'backup-power':      'bolt',
  'solar-panels':      'solar_power',
  'store-room':        'inventory_2',
  'servant-quarter':   'cottage',
  'corner-plot':       'crop_square',
};

function amenityItems(property: ListingsApiProperty): PropertyAmenityItem[] {
  return (property.featureIds ?? []).map(f => ({
    icon: FEATURE_SLUG_ICON[f.slug] ?? 'check_circle',
    label: f.name
  }));
}

export function mapApiPropertyToDetailView(property: ListingsApiProperty): PropertyDetailViewModel {
  const sortedImages = [...property.images].sort((a, b) => a.orderIndex - b.orderIndex);
  const thumb = sortedImages.find((img) => img.isThumbnail) ?? sortedImages[0];
  const imageUrls = sortedImages.map((img) => resolvePropertyImageUrlForDisplay(img.url));
  const primaryImage = resolvePropertyImageUrlForDisplay(thumb?.url ?? '');

  const price = formatPrice(property.price, property.purpose);

  const aboutText = (property.propertyDescription ?? '').trim();
  const paragraphs = aboutText
    ? aboutText.split(/\n\s*\n/).filter((p) => p.trim())
    : ['No description provided for this listing.'];

  const items = amenityItems(property);
  if (property.subtype?.trim()) {
    items.unshift({ icon: 'category', label: property.subtype.trim() });
  }

  const videoTour = property.videoTourUrl?.trim();

  let videos: PropertyDetailViewModel['videos'];
  if (videoTour) {
    const tour: PropertyVideoItem = {
      id: `${property._id}-tour`,
      title: 'Video tour',
      videoUrl: videoTour,
      imageUrl: primaryImage
    };
    videos = {
      title: 'Property videos',
      subtitle: 'Walkthrough and neighborhood context.',
      viewAllLabel: 'View all videos',
      items: [tour]
    };
  }

  const breadcrumbLabel = property.listingTitle;

  return {
    id: property._id,
    listingKey: property.listingKey,
    listingTitle: property.listingTitle,
    purpose: property.purpose,
    breadcrumbLabel,
    statusChip: property.status,
    mapLink: property.mapLink?.trim() || undefined,
    gallery: {
      primaryImage,
      images: imageUrls,
      moreCount: imageUrls.length > 1 ? Math.max(0, imageUrls.length - 5) : undefined,
      featuredTag: property.purpose,
      videoTag: videoTour ? 'Video tour' : undefined,
      showPlay: Boolean(videoTour)
    },
    price,
    addressLine: property.fullAddress,
    stats: [
      { value: String(property.numBedrooms), label: 'Bedrooms', icon: 'bed' },
      { value: String(property.numBathrooms), label: 'Bathrooms', icon: 'bathtub' },
      {
        value: `${property.areaSize} ${property.areaUnit}`,
        label: 'Living area',
        icon: 'square_foot'
      },
      { value: property.propertyType, label: 'Type', icon: 'apartment' }
    ],
    about: {
      title: 'About this property',
      paragraphs
    },
    amenities: {
      title: 'Highlights & amenities',
      items: items.length ? items : [{ icon: 'info', label: 'See description for details' }]
    },
    videos,
    agent: {
      name: property.contactName?.trim() || 'Property contact',
      role: 'Property agent',
      imageUrl: DEFAULT_AGENT_IMAGE,
      userId: ownerUserId(property),
      blurb: '',
      email: property.contactEmail,
      phone: property.contactPhoneNumber
    },
    inquiry: {
      submitLabel: 'Request a tour',
      secondary1: 'Book appointment',
      secondary2: 'Ask a question',
      defaultMessage: `I am interested in ${property.listingTitle} and would like to schedule a tour.`
    }
  };
}
