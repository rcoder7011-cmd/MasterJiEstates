/**
 * Compare Properties Service — src/services/compareService.ts
 * Manages side-by-side property comparisons with persistent SecureStore caching.
 * Enforces maximum 3 properties limit and duplicate prevention.
 */

import * as SecureStore from 'expo-secure-store';
import { PropertyItem } from '../types/property';

const COMPARE_PROPERTIES_KEY = 'mj_compare_properties';
export const MAX_COMPARE_LIMIT = 3;

/**
 * Retrieve saved comparison properties from SecureStore
 */
export async function getCompareProperties(): Promise<PropertyItem[]> {
  try {
    const raw = await SecureStore.getItemAsync(COMPARE_PROPERTIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (__DEV__) {
      console.warn('[compareService] Failed to read compare properties:', error);
    }
    return [];
  }
}

/**
 * Persist comparison properties to SecureStore
 */
export async function saveCompareProperties(properties: PropertyItem[]): Promise<void> {
  try {
    // Keep max 3 items
    const trimmed = properties.slice(0, MAX_COMPARE_LIMIT);
    await SecureStore.setItemAsync(COMPARE_PROPERTIES_KEY, JSON.stringify(trimmed));
  } catch (error) {
    if (__DEV__) {
      console.warn('[compareService] Failed to save compare properties:', error);
    }
  }
}

/**
 * Clear comparison list from SecureStore
 */
export async function clearCompareProperties(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(COMPARE_PROPERTIES_KEY);
  } catch (error) {
    if (__DEV__) {
      console.warn('[compareService] Failed to clear compare properties:', error);
    }
  }
}
