/**
 * Saved Properties Service — src/services/savedPropertiesService.ts
 * Manages customer shortlisted properties with bi-directional synchronization:
 * Remote backend persistence via /dashboard/favourites and instant offline SecureStore caching.
 */

import * as SecureStore from 'expo-secure-store';
import { apiGet, apiPost, apiDelete } from './apiClient';

const SAVED_PROPERTIES_KEY = 'mj_saved_properties';

/**
 * Fetch all saved property IDs from backend with SecureStore cache fallback
 */
export async function getSavedPropertyIds(): Promise<string[]> {
  try {
    const response = await apiGet<any[]>('/dashboard/favourites');
    if (response.success && Array.isArray(response.data)) {
      const remoteIds: string[] = response.data
        .map((item: any) => (typeof item === 'string' ? item : item.id || item._id))
        .filter(Boolean);

      // Refresh local cache
      await SecureStore.setItemAsync(SAVED_PROPERTIES_KEY, JSON.stringify(remoteIds));
      return remoteIds;
    }
  } catch {
    // Unauthenticated or offline: fallback to local SecureStore cache
  }

  try {
    const raw = await SecureStore.getItemAsync(SAVED_PROPERTIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Save a property ID to shortlist (idempotent / duplicate safe)
 */
export async function savePropertyId(id: string): Promise<string[]> {
  const current = await getSavedPropertyIds();
  if (current.includes(id)) {
    return current;
  }
  const updated = [id, ...current];

  // Update local cache immediately
  try {
    await SecureStore.setItemAsync(SAVED_PROPERTIES_KEY, JSON.stringify(updated));
  } catch {
    // Safe fallback
  }

  // Synchronize with backend
  try {
    await apiPost(`/dashboard/favourites/${id}`);
  } catch {
    // Graceful offline fallback
  }

  return updated;
}

/**
 * Remove a property ID from shortlist
 */
export async function removePropertyId(id: string): Promise<string[]> {
  const current = await getSavedPropertyIds();
  const updated = current.filter((item) => item !== id);

  // Update local cache immediately
  try {
    await SecureStore.setItemAsync(SAVED_PROPERTIES_KEY, JSON.stringify(updated));
  } catch {
    // Safe fallback
  }

  // Synchronize with backend
  try {
    await apiDelete(`/dashboard/favourites/${id}`);
  } catch {
    // Graceful offline fallback
  }

  return updated;
}

/**
 * Check whether a property ID is currently shortlisted
 */
export async function isPropertySaved(id: string): Promise<boolean> {
  const current = await getSavedPropertyIds();
  return current.includes(id);
}
