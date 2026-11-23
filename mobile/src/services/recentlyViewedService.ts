/**
 * Recently Viewed Service — src/services/recentlyViewedService.ts
 * Manages customer recently viewed properties history with local SecureStore persistence.
 * Enforces newest-first ordering, duplicate deduplication, and max 20 items limit.
 */

import * as SecureStore from 'expo-secure-store';
import { PropertyItem } from '../types/property';

const RECENTLY_VIEWED_KEY = 'mj_recently_viewed';
export const MAX_RECENTLY_VIEWED_LIMIT = 20;

/**
 * Retrieve recently viewed properties from SecureStore
 */
export async function getRecentlyViewed(): Promise<PropertyItem[]> {
  try {
    const raw = await SecureStore.getItemAsync(RECENTLY_VIEWED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (__DEV__) {
      console.warn('[recentlyViewedService] Failed to read recently viewed properties:', error);
    }
    return [];
  }
}

/**
 * Record a property view:
 * 1. Deduplicates (removes any earlier occurrence of this property).
 * 2. Unshifts property to index 0 (newest-first).
 * 3. Caps list at 20 entries.
 * 4. Persists to SecureStore.
 */
export async function recordPropertyView(property: PropertyItem): Promise<PropertyItem[]> {
  if (!property || !property.id) return [];

  try {
    const current = await getRecentlyViewed();
    // Filter out previous occurrence if present
    const filtered = current.filter((item) => item.id !== property.id);
    // Add to front
    const updated = [property, ...filtered].slice(0, MAX_RECENTLY_VIEWED_LIMIT);

    await SecureStore.setItemAsync(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    if (__DEV__) {
      console.warn('[recentlyViewedService] Failed to record property view:', error);
    }
    return [];
  }
}

/**
 * Remove an individual property from recently viewed history
 */
export async function removeRecentlyViewed(id: string): Promise<PropertyItem[]> {
  try {
    const current = await getRecentlyViewed();
    const updated = current.filter((item) => item.id !== id);
    await SecureStore.setItemAsync(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    if (__DEV__) {
      console.warn('[recentlyViewedService] Failed to remove viewed property:', error);
    }
    return [];
  }
}

/**
 * Clear all recently viewed history
 */
export async function clearRecentlyViewed(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(RECENTLY_VIEWED_KEY);
  } catch (error) {
    if (__DEV__) {
      console.warn('[recentlyViewedService] Failed to clear recently viewed properties:', error);
    }
  }
}
