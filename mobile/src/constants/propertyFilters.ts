/**
 * Centralized Filter Configurations & Presets for MJ Estates Mobile App
 */

import {
  PropertyFilterState,
  TransactionType,
  PropertyCategoryType,
  PropertyStatus,
  BedroomOption,
  SortOptionItem,
} from '../types/property';

export const DEFAULT_FILTER_STATE: PropertyFilterState = {
  searchQuery: '',
  transaction: 'all',
  propertyType: 'all',
  minPrice: null,
  maxPrice: null,
  city: 'all',
  locality: 'all',
  bedrooms: [],
  status: 'all',
};

export const TRANSACTION_FILTER_OPTIONS: { id: TransactionType | 'all'; label: string }[] = [
  { id: 'all', label: 'All Modes' },
  { id: 'buy', label: 'Buy' },
  { id: 'rent', label: 'Rent' },
  { id: 'sell', label: 'Sell' },
];

export const PROPERTY_TYPE_FILTER_OPTIONS: { id: PropertyCategoryType | 'all'; label: string }[] = [
  { id: 'all', label: 'All Types' },
  { id: 'residential', label: 'Residential' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'plot', label: 'Land / Plot' },
];

export const BEDROOM_OPTIONS: { id: BedroomOption; label: string }[] = [
  { id: '1', label: '1 BHK' },
  { id: '2', label: '2 BHK' },
  { id: '3', label: '3 BHK' },
  { id: '4+', label: '4+ BHK' },
];

export const STATUS_FILTER_OPTIONS: { id: PropertyStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All Status' },
  { id: 'available', label: 'Available' },
  { id: 'sold', label: 'Sold' },
  { id: 'rented', label: 'Rented' },
];

export const CITY_OPTIONS = [
  'All Cities',
  'Noida',
  'Greater Noida',
  'Ghaziabad',
  'Indirapuram',
  'Delhi',
  'Gurugram',
] as const;

export interface BudgetPreset {
  id: string;
  label: string;
  min: number | null;
  max: number | null;
}

export const BUY_BUDGET_PRESETS: BudgetPreset[] = [
  { id: 'buy_under_50l', label: 'Under ₹50L', min: null, max: 5000000 },
  { id: 'buy_50l_1cr', label: '₹50L – ₹1 Cr', min: 5000000, max: 10000000 },
  { id: 'buy_1cr_2cr', label: '₹1 Cr – ₹2 Cr', min: 10000000, max: 20000000 },
  { id: 'buy_2cr_plus', label: '₹2 Cr+', min: 20000000, max: null },
];

export const RENT_BUDGET_PRESETS: BudgetPreset[] = [
  { id: 'rent_under_20k', label: 'Under ₹20K', min: null, max: 20000 },
  { id: 'rent_20k_40k', label: '₹20K – ₹40K', min: 20000, max: 40000 },
  { id: 'rent_40k_75k', label: '₹40K – ₹75K', min: 40000, max: 75000 },
  { id: 'rent_75k_plus', label: '₹75K+', min: 75000, max: null },
];

export const SORT_OPTIONS: SortOptionItem[] = [
  { id: 'newest', label: 'Newest First' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
];

