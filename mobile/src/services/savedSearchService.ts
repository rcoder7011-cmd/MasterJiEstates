/**
 * Saved Search Client Service — mobile/src/services/savedSearchService.ts
 *
 * Provides API communication for saving, loading, editing,
 * and deleting user search criteria.
 */

import { apiGet, apiPost, apiPatch, apiDelete } from './apiClient';
import {
  SavedSearchItem,
  CreateSavedSearchInput,
  UpdateSavedSearchInput,
} from '../types/savedSearch';

/**
 * Fetch all saved searches for the authenticated user
 */
export async function fetchSavedSearches(): Promise<{
  success: boolean;
  data?: SavedSearchItem[];
  error?: string;
}> {
  try {
    const response = await apiGet<SavedSearchItem[]>('/saved-searches');
    if (response.success && Array.isArray(response.data)) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      error: response.error || 'Failed to retrieve saved searches.',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error retrieving saved searches.',
    };
  }
}

/**
 * Create a new saved search
 */
export async function createSavedSearch(
  input: CreateSavedSearchInput
): Promise<{ success: boolean; data?: SavedSearchItem; error?: string }> {
  try {
    const response = await apiPost<SavedSearchItem>('/saved-searches', input);
    if (response.success && response.data) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      error: response.error || 'Failed to save search.',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error saving search.',
    };
  }
}

/**
 * Update an existing saved search (rename, update filters, or toggle alerts)
 */
export async function updateSavedSearch(
  id: string,
  input: UpdateSavedSearchInput
): Promise<{ success: boolean; data?: SavedSearchItem; error?: string }> {
  try {
    const response = await apiPatch<SavedSearchItem>(`/saved-searches/${id}`, input);
    if (response.success && response.data) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      error: response.error || 'Failed to update saved search.',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error updating saved search.',
    };
  }
}

/**
 * Delete a saved search
 */
export async function deleteSavedSearch(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiDelete(`/saved-searches/${id}`);
    return { success: response.success, error: response.error };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error deleting saved search.',
    };
  }
}

export const savedSearchService = {
  fetchSavedSearches,
  createSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
};

