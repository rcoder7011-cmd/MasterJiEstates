/**
 * Property Data, Filter and Search Type Definitions
 * Used across Explore screen, Home screen, Property Details, and future API integrations.
 */

import { PropertyVerificationInfo, SuspiciousSignals } from './moderation';

export type TransactionType = 'buy' | 'rent' | 'sell';

export type PropertyCategoryType = 'residential' | 'commercial' | 'plot';

export type PropertyStatus = 'available' | 'sold' | 'rented';

export type BedroomOption = '1' | '2' | '3' | '4+';

export type PropertySortOption = 'newest' | 'price_asc' | 'price_desc' | 'distance';

export interface PropertyItem {
  id: string;
  title: string;
  description?: string;
  transaction: TransactionType;
  propertyType: PropertyCategoryType;
  subType: string;
  price: number;
  priceUnit?: 'total' | 'per_month';
  pricePerSqFt?: string;
  priceNegotiable?: boolean;
  city: string;
  locality: string;
  address: string;
  bedrooms?: string;
  bedroomCount?: number;
  bathrooms?: number;
  balconies?: number;
  area: string;
  builtUpArea?: string;
  carpetArea?: string;
  plotArea?: string;
  furnishingStatus?: 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished';
  parking?: string;
  floor?: string;
  totalFloors?: number;
  facing?: string;
  propertyAge?: string;
  possession?: string;
  amenities?: string[];
  images?: string[];
  videoUrl?: string;
  videoThumbnail?: string;
  status: PropertyStatus;
  isFeatured?: boolean;
  isSampleData?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  formattedAddress?: string;
  country?: string;
  state?: string;
  pincode?: string;
  distanceKm?: number;
  verification?: PropertyVerificationInfo;
  suspiciousSignals?: SuspiciousSignals;
  createdAt: string;
}

export type CreatePropertyInput = Omit<PropertyItem, 'id' | 'createdAt' | 'isSampleData'> & {
  id?: string;
  createdAt?: string;
  isSampleData?: boolean;
};

export interface PropertyFilterState {
  searchQuery: string;
  transaction: TransactionType | 'all';
  propertyType: PropertyCategoryType | 'all';
  minPrice: number | null;
  maxPrice: number | null;
  city: string | 'all';
  locality: string | 'all';
  bedrooms: string[];
  status: PropertyStatus | 'all';
  nearMeCoords?: { latitude: number; longitude: number } | null;
  maxDistanceKm?: number | null;
}

export interface ActiveFilterChip {
  id: string;
  label: string;
  category: keyof PropertyFilterState;
  value: unknown;
}

export interface SortOptionItem {
  id: PropertySortOption;
  label: string;
}
