/**
 * Customer Property Service — src/services/propertyService.ts
 * Coordinates public property catalog discovery, search, filtering,
 * individual listing resolution, and backend field normalization.
 */

import {
  PropertyItem,
  PropertyCategoryType,
  TransactionType,
  PropertyStatus,
  PropertyFilterState,
} from '../types/property';
import { SAMPLE_PROPERTIES } from '../constants/sampleProperties';
import { apiGet } from './apiClient';

/**
 * Normalizes backend property categories into mobile category taxonomy
 */
function normalizeCategory(category?: string): PropertyCategoryType {
  const cat = (category || '').toLowerCase();
  if (cat.includes('plot') || cat.includes('land')) return 'plot';
  if (cat.includes('commercial') || cat.includes('office') || cat.includes('shop')) return 'commercial';
  return 'residential';
}

/**
 * Normalizes backend property status into mobile status enum
 */
function normalizeStatus(status?: string): PropertyStatus {
  const s = (status || '').toLowerCase();
  if (s === 'sold') return 'sold';
  if (s === 'rented') return 'rented';
  return 'available';
}

/**
 * Maps raw backend property document to mobile PropertyItem interface
 */
export function mapBackendPropertyToPropertyItem(raw: any): PropertyItem {
  const category = normalizeCategory(raw.category);
  const status = normalizeStatus(raw.availabilityStatus || raw.status);

  // Compile image list ensuring primary image is first
  const imageSet = new Set<string>();
  if (raw.imageUrl) imageSet.add(raw.imageUrl);
  if (Array.isArray(raw.images)) {
    raw.images.forEach((img: string) => {
      if (img && typeof img === 'string') imageSet.add(img);
    });
  }
  const images = Array.from(imageSet);

  const bedroomsCount = typeof raw.bedrooms === 'number' ? raw.bedrooms : parseInt(raw.bedrooms, 10) || 0;
  const bedroomsLabel = bedroomsCount > 0 ? `${bedroomsCount} BHK` : raw.bedrooms || undefined;

  const transaction: TransactionType =
    raw.transaction === 'rent' || raw.listingType === 'rent'
      ? 'rent'
      : raw.transaction === 'sell'
      ? 'sell'
      : 'buy';

  return {
    id: raw.id || raw.demoId || (raw._id ? raw._id.toString() : `prop-${Date.now()}`),
    title: raw.title || 'MasterJi Estates Verified Property',
    description: raw.description,
    transaction,
    propertyType: category,
    subType: raw.categoryLabel || raw.subType || (category === 'residential' ? 'Luxury Residence' : 'Commercial Space'),
    price: typeof raw.price === 'number' ? raw.price : parseFloat(raw.price) || 0,
    priceUnit: transaction === 'rent' ? 'per_month' : 'total',
    pricePerSqFt: raw.pricePerSqFt,
    city: raw.city || 'Delhi NCR',
    locality: raw.locality || 'Sector 15',
    address: raw.addressDisplay || raw.address || `${raw.locality || ''}, ${raw.city || 'Delhi NCR'}`,
    bedrooms: bedroomsLabel,
    bedroomCount: bedroomsCount,
    bathrooms: typeof raw.bathrooms === 'number' ? raw.bathrooms : undefined,
    area: raw.area ? (typeof raw.area === 'number' ? `${raw.area} sq ft` : String(raw.area)) : '1850 sq ft',
    builtUpArea: raw.builtUpArea || (raw.area ? `${raw.area} sq ft` : undefined),
    furnishingStatus: raw.furnishing || raw.furnishingStatus || 'Semi-Furnished',
    parking: raw.parking ? (typeof raw.parking === 'number' ? `${raw.parking} Dedicated` : String(raw.parking)) : undefined,
    floor: raw.floor,
    facing: raw.facing,
    amenities: Array.isArray(raw.amenities) ? raw.amenities : [],
    images: images.length > 0 ? images : undefined,
    videoUrl: raw.videoUrl || undefined,
    videoThumbnail: raw.videoThumbnail || undefined,
    status,
    isFeatured: Boolean(raw.featured || raw.isFeatured),
    isSampleData: Boolean(raw.isSampleData || false),
    latitude: typeof raw.latitude === 'number' && !isNaN(raw.latitude) ? raw.latitude : null,
    longitude: typeof raw.longitude === 'number' && !isNaN(raw.longitude) ? raw.longitude : null,
    formattedAddress: raw.formattedAddress || undefined,
    country: raw.country || 'India',
    distanceKm: typeof raw.distanceKm === 'number' ? raw.distanceKm : undefined,
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

/**
 * Fetch paginated property catalog from backend with filter criteria
 */
export async function fetchProperties(
  filters?: Partial<PropertyFilterState>
): Promise<PropertyItem[]> {
  try {
    const queryParams: Record<string, string> = {};

    if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
      queryParams.search = filters.searchQuery.trim();
    }
    if (filters?.city && filters.city !== 'all') {
      queryParams.city = filters.city;
    }
    if (filters?.locality && filters.locality !== 'all') {
      queryParams.locality = filters.locality;
    }
    if (filters?.propertyType && filters.propertyType !== 'all') {
      queryParams.category = filters.propertyType;
    }
    if (filters?.minPrice !== null && filters?.minPrice !== undefined) {
      queryParams.minPrice = String(filters.minPrice);
    }
    if (filters?.maxPrice !== null && filters?.maxPrice !== undefined) {
      queryParams.maxPrice = String(filters.maxPrice);
    }
    if (filters?.bedrooms && filters.bedrooms.length > 0) {
      queryParams.bedrooms = filters.bedrooms[0];
    }
    if (filters?.status && filters.status !== 'all') {
      queryParams.status = filters.status;
    }
    if (filters?.nearMeCoords) {
      queryParams.lat = String(filters.nearMeCoords.latitude);
      queryParams.lng = String(filters.nearMeCoords.longitude);
      queryParams.sort = 'distance';
    }
    if (filters?.maxDistanceKm) {
      queryParams.radius = String(filters.maxDistanceKm);
    }

    const queryString = new URLSearchParams(queryParams).toString();
    const endpoint = queryString ? `/properties?${queryString}` : '/properties';

    const response = await apiGet<any[]>(endpoint);
    if (response.success && Array.isArray(response.data)) {
      if (response.data.length > 0) {
        return response.data.map(mapBackendPropertyToPropertyItem);
      }
      // If server returned valid empty array (filters matched 0 listings), return empty array
      return [];
    }
  } catch {
    // Graceful offline fallback
  }

  // Fallback to sample data strictly in development mode
  if (__DEV__) {
    return SAMPLE_PROPERTIES;
  }
  return [];
}

/**
 * Fetch featured properties for Home screen carousel
 */
export async function fetchFeaturedProperties(): Promise<PropertyItem[]> {
  try {
    const response = await apiGet<any[]>('/properties?featured=true&limit=6');
    if (response.success && Array.isArray(response.data) && response.data.length > 0) {
      return response.data.map(mapBackendPropertyToPropertyItem);
    }
  } catch {
    // Offline fallback
  }

  if (__DEV__) {
    return SAMPLE_PROPERTIES.filter((p) => p.isFeatured).slice(0, 6);
  }
  return [];
}

/**
 * Fetch newest properties for Home screen
 */
export async function fetchLatestProperties(limit = 6): Promise<PropertyItem[]> {
  try {
    const response = await apiGet<any[]>(`/properties?sort=newest&limit=${limit}`);
    if (response.success && Array.isArray(response.data) && response.data.length > 0) {
      return response.data.map(mapBackendPropertyToPropertyItem);
    }
  } catch {
    // Offline fallback
  }

  if (__DEV__) {
    return SAMPLE_PROPERTIES.slice(0, limit);
  }
  return [];
}

/**
 * Fetch a single property listing by ID or slug
 */
export async function fetchPropertyById(id: string): Promise<PropertyItem | null> {
  try {
    const response = await apiGet<any>(`/properties/${id}`);
    if (response.success && response.data) {
      return mapBackendPropertyToPropertyItem(response.data);
    }
  } catch {
    // Offline fallback
  }

  if (__DEV__) {
    const sampleMatch = SAMPLE_PROPERTIES.find((p) => p.id === id);
    return sampleMatch || null;
  }
  return null;
}

export const propertyService = {
  fetchProperties,
  fetchFeaturedProperties,
  fetchLatestProperties,
  fetchPropertyById,
  mapBackendPropertyToPropertyItem,
};
