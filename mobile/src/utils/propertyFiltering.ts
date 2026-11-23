/**
 * Property Search, Filter & Sort Utilities
 * Pure functions for high testability and reusability.
 */

import {
  PropertyItem,
  PropertyFilterState,
  PropertySortOption,
  ActiveFilterChip,
} from '../types/property';
import { formatIndianCurrency } from './formatting';
import { calculateDistanceKm } from '../services/locationService';

/**
 * Filter properties by search keyword, transaction mode, property type,
 * budget boundaries, location, bedrooms, and status.
 */
export function filterProperties(
  properties: PropertyItem[],
  filters: PropertyFilterState
): PropertyItem[] {
  const normalizedQuery = (filters.searchQuery || '').trim().toLowerCase();

  return properties.filter((property) => {
    // 1. Text Search Filter
    if (normalizedQuery.length > 0) {
      const titleMatch = property.title.toLowerCase().includes(normalizedQuery);
      const localityMatch = property.locality.toLowerCase().includes(normalizedQuery);
      const cityMatch = property.city.toLowerCase().includes(normalizedQuery);
      const addressMatch = property.address.toLowerCase().includes(normalizedQuery);
      const subTypeMatch = property.subType.toLowerCase().includes(normalizedQuery);
      const typeMatch = property.propertyType.toLowerCase().includes(normalizedQuery);
      const bhkMatch = property.bedrooms ? property.bedrooms.toLowerCase().includes(normalizedQuery) : false;

      if (!titleMatch && !localityMatch && !cityMatch && !addressMatch && !subTypeMatch && !typeMatch && !bhkMatch) {
        return false;
      }
    }

    // 2. Transaction Mode Filter (Buy / Rent / Sell)
    if (filters.transaction !== 'all') {
      if (property.transaction !== filters.transaction) {
        return false;
      }
    }

    // 3. Property Asset Type Filter (Residential / Commercial / Plot)
    if (filters.propertyType !== 'all') {
      if (property.propertyType !== filters.propertyType) {
        return false;
      }
    }

    // 4. Budget Range (Min / Max)
    if (filters.minPrice !== null && filters.minPrice !== undefined) {
      if (property.price < filters.minPrice) {
        return false;
      }
    }
    if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
      if (property.price > filters.maxPrice) {
        return false;
      }
    }

    // 5. City Location Filter
    if (filters.city !== 'all' && filters.city !== 'All Cities' && filters.city !== '') {
      const targetCity = filters.city.toLowerCase();
      const propCity = property.city.toLowerCase();
      const propLocality = property.locality.toLowerCase();
      if (!propCity.includes(targetCity) && !propLocality.includes(targetCity)) {
        return false;
      }
    }

    // 6. Bedroom Count Filter (Residential Only)
    if (filters.bedrooms && filters.bedrooms.length > 0) {
      // If property does not have bedrooms (e.g. plot or commercial), it does not match
      if (!property.bedroomCount && !property.bedrooms) {
        return false;
      }

      const count = property.bedroomCount || 0;
      const matchesBedrooms = filters.bedrooms.some((opt) => {
        if (opt === '1') return count === 1 || property.bedrooms?.includes('1');
        if (opt === '2') return count === 2 || property.bedrooms?.includes('2');
        if (opt === '3') return count === 3 || property.bedrooms?.includes('3');
        if (opt === '4+') return count >= 4 || property.bedrooms?.includes('4');
        return false;
      });

      if (!matchesBedrooms) {
        return false;
      }
    }

    // 7. Property Availability Status
    if (filters.status !== 'all') {
      if (property.status !== filters.status) {
        return false;
      }
    }

    // 8. Geospatial Distance Filter (Near Me)
    if (filters.nearMeCoords && filters.maxDistanceKm) {
      if (typeof property.latitude !== 'number' || typeof property.longitude !== 'number') {
        return false;
      }
      const dist = calculateDistanceKm(
        filters.nearMeCoords.latitude,
        filters.nearMeCoords.longitude,
        property.latitude,
        property.longitude
      );
      if (dist > filters.maxDistanceKm) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort properties based on selected criteria
 */
export function sortProperties(
  properties: PropertyItem[],
  sortOption: PropertySortOption
): PropertyItem[] {
  const sorted = [...properties];

  switch (sortOption) {
    case 'distance':
      return sorted.sort((a, b) => {
        if (typeof a.distanceKm !== 'number') return 1;
        if (typeof b.distanceKm !== 'number') return -1;
        return a.distanceKm - b.distanceKm;
      });

    case 'price_asc':
      return sorted.sort((a, b) => a.price - b.price);

    case 'price_desc':
      return sorted.sort((a, b) => b.price - a.price);

    case 'newest':
    default:
      return sorted.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return timeB - timeA;
      });
  }
}

/**
 * Count active non-default filters
 */
export function getActiveFilterCount(filters: PropertyFilterState): number {
  let count = 0;

  if (filters.transaction !== 'all') count++;
  if (filters.propertyType !== 'all') count++;
  if (filters.minPrice !== null || filters.maxPrice !== null) count++;
  if (filters.city !== 'all' && filters.city !== 'All Cities' && filters.city !== '') count++;
  if (filters.bedrooms && filters.bedrooms.length > 0) count += filters.bedrooms.length;
  if (filters.status !== 'all') count++;
  if (filters.nearMeCoords) count++;

  return count;
}

/**
 * Generate readable chip models for currently applied filters
 */
export function getActiveFilterChips(filters: PropertyFilterState): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  if (filters.transaction !== 'all') {
    chips.push({
      id: 'transaction',
      label: `Mode: ${filters.transaction.toUpperCase()}`,
      category: 'transaction',
      value: filters.transaction,
    });
  }

  if (filters.propertyType !== 'all') {
    const formattedType =
      filters.propertyType === 'plot'
        ? 'Land / Plot'
        : filters.propertyType.charAt(0).toUpperCase() + filters.propertyType.slice(1);
    chips.push({
      id: 'propertyType',
      label: `Type: ${formattedType}`,
      category: 'propertyType',
      value: filters.propertyType,
    });
  }

  if (filters.minPrice !== null || filters.maxPrice !== null) {
    let budgetLabel = 'Budget: ';
    if (filters.minPrice !== null && filters.maxPrice !== null) {
      budgetLabel += `${formatIndianCurrency(filters.minPrice)} – ${formatIndianCurrency(filters.maxPrice)}`;
    } else if (filters.minPrice !== null) {
      budgetLabel += `${formatIndianCurrency(filters.minPrice)}+`;
    } else if (filters.maxPrice !== null) {
      budgetLabel += `Under ${formatIndianCurrency(filters.maxPrice)}`;
    }

    chips.push({
      id: 'budget',
      label: budgetLabel,
      category: 'minPrice',
      value: null,
    });
  }

  if (filters.city !== 'all' && filters.city !== 'All Cities' && filters.city !== '') {
    chips.push({
      id: 'city',
      label: `City: ${filters.city}`,
      category: 'city',
      value: filters.city,
    });
  }

  if (filters.bedrooms && filters.bedrooms.length > 0) {
    filters.bedrooms.forEach((bed) => {
      chips.push({
        id: `bedroom-${bed}`,
        label: `${bed} BHK`,
        category: 'bedrooms',
        value: bed,
      });
    });
  }

  if (filters.status !== 'all') {
    chips.push({
      id: 'status',
      label: `Status: ${filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}`,
      category: 'status',
      value: filters.status,
    });
  }

  if (filters.nearMeCoords) {
    chips.push({
      id: 'nearMeCoords',
      label: `Near Me${filters.maxDistanceKm ? ` (${filters.maxDistanceKm} km)` : ''}`,
      category: 'nearMeCoords',
      value: filters.nearMeCoords,
    });
  }

  return chips;
}

