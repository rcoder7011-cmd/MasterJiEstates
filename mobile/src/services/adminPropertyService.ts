/**
 * Admin Property Service — src/services/adminPropertyService.ts
 * Manages administrative inventory operations (Create, Read, Update, Delete, Status Toggle),
 * with backend API synchronization (/api/admin/...) and SecureStore fallback.
 */

import * as SecureStore from 'expo-secure-store';
import {
  PropertyItem,
  PropertyStatus,
  CreatePropertyInput,
} from '../types/property';
import { SAMPLE_PROPERTIES } from '../constants/sampleProperties';
import { mapBackendPropertyToPropertyItem } from './propertyService';
import { apiGet, apiPost, apiPatch, apiDelete } from './apiClient';

const ADMIN_PROPERTIES_KEY = 'mj_admin_properties_v1';

/**
 * Fetch all properties for admin inventory management
 */
export async function getAdminProperties(): Promise<PropertyItem[]> {
  try {
    const response = await apiGet<any>('/admin/properties');
    if (response.success && response.data) {
      const rawList = Array.isArray(response.data)
        ? response.data
        : response.data.items || response.data.properties || [];

      if (rawList.length > 0) {
        const mapped = rawList.map(mapBackendPropertyToPropertyItem);
        await SecureStore.setItemAsync(ADMIN_PROPERTIES_KEY, JSON.stringify(mapped));
        return mapped;
      }
    }
  } catch {
    // Offline fallback
  }

  try {
    const raw = await SecureStore.getItemAsync(ADMIN_PROPERTIES_KEY);
    if (!raw) {
      await SecureStore.setItemAsync(
        ADMIN_PROPERTIES_KEY,
        JSON.stringify(SAMPLE_PROPERTIES)
      );
      return SAMPLE_PROPERTIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_PROPERTIES;
  } catch (err) {
    if (__DEV__) {
      console.warn('[adminPropertyService] Failed to load properties, falling back to sample:', err);
    }
    return SAMPLE_PROPERTIES;
  }
}

/**
 * Fetch a single property by its unique ID
 */
export async function getAdminPropertyById(id: string): Promise<PropertyItem | null> {
  try {
    const response = await apiGet<any>(`/admin/properties/${id}`);
    if (response.success && response.data) {
      return mapBackendPropertyToPropertyItem(response.data);
    }
  } catch {
    // Offline fallback
  }

  const properties = await getAdminProperties();
  const match = properties.find((item) => item.id === id);
  return match || null;
}

/**
 * Create a new property listing
 */
export async function createProperty(
  input: CreatePropertyInput
): Promise<PropertyItem> {
  const current = await getAdminProperties();
  const newId = input.id || `prop-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();

  const newProperty: PropertyItem = {
    ...input,
    id: newId,
    createdAt: now,
    isSampleData: true,
    status: input.status || 'available',
  };

  // Attempt backend company property creation
  try {
    const backendPayload = {
      title: input.title,
      description: input.description,
      category: input.propertyType === 'plot' ? 'residential_plot' : input.propertyType === 'commercial' ? 'commercial_property' : 'apartment',
      price: input.price,
      city: input.city,
      locality: input.locality,
      addressDisplay: input.address,
      area: parseInt(input.area, 10) || 1850,
      bedrooms: input.bedroomCount || (input.bedrooms ? parseInt(input.bedrooms, 10) || 3 : 3),
      bathrooms: input.bathrooms || 2,
      imageUrl: input.images?.[0] || '',
      images: input.images || [],
      videoUrl: input.videoUrl || '',
      videoThumbnail: input.videoThumbnail || '',
      availabilityStatus: input.status || 'available',
    };

    const res = await apiPost<any>('/admin/properties/company', backendPayload);
    if (res.success && res.data) {
      const createdItem = mapBackendPropertyToPropertyItem(res.data);
      const updated = [createdItem, ...current];
      await SecureStore.setItemAsync(ADMIN_PROPERTIES_KEY, JSON.stringify(updated));
      return createdItem;
    }
  } catch {
    // Offline fallback
  }

  const updated = [newProperty, ...current];
  try {
    await SecureStore.setItemAsync(ADMIN_PROPERTIES_KEY, JSON.stringify(updated));
  } catch (err) {
    if (__DEV__) {
      console.warn('[adminPropertyService] Failed to save new property:', err);
    }
  }

  return newProperty;
}

/**
 * Update an existing property listing
 */
export async function updateProperty(
  id: string,
  updates: Partial<PropertyItem>
): Promise<PropertyItem | null> {
  const current = await getAdminProperties();
  const index = current.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }

  const existing = current[index];
  const updatedItem: PropertyItem = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
  };

  // Synchronize with backend
  try {
    const backendUpdates: any = {};
    if (updates.title) backendUpdates.title = updates.title;
    if (updates.description) backendUpdates.description = updates.description;
    if (updates.price) backendUpdates.price = updates.price;
    if (updates.status) backendUpdates.availabilityStatus = updates.status;
    if (updates.images) backendUpdates.images = updates.images;
    if (updates.videoUrl !== undefined) backendUpdates.videoUrl = updates.videoUrl;

    await apiPatch(`/admin/properties/company/${id}`, backendUpdates);
  } catch {
    // Offline fallback
  }

  const updatedList = [...current];
  updatedList[index] = updatedItem;

  try {
    await SecureStore.setItemAsync(ADMIN_PROPERTIES_KEY, JSON.stringify(updatedList));
  } catch (err) {
    if (__DEV__) {
      console.warn('[adminPropertyService] Failed to persist property update:', err);
    }
  }

  return updatedItem;
}

/**
 * Delete a property listing
 */
export async function deleteProperty(id: string): Promise<boolean> {
  const current = await getAdminProperties();
  const filtered = current.filter((item) => item.id !== id);
  if (filtered.length === current.length) {
    return false;
  }

  // Synchronize with backend
  try {
    await apiDelete(`/admin/properties/${id}`);
  } catch {
    // Offline fallback
  }

  try {
    await SecureStore.setItemAsync(ADMIN_PROPERTIES_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    if (__DEV__) {
      console.warn('[adminPropertyService] Failed to delete property:', err);
    }
    return false;
  }
}

/**
 * Change property listing status (Available, Sold, Rented)
 */
export async function updatePropertyStatus(
  id: string,
  status: PropertyStatus
): Promise<PropertyItem | null> {
  try {
    await apiPatch(`/admin/properties/${id}/status`, { status });
  } catch {
    // Offline fallback
  }
  return updateProperty(id, { status });
}

/**
 * Compute inventory metrics for the admin dashboard
 */
export async function getDashboardMetrics(): Promise<{
  total: number;
  available: number;
  sold: number;
  rented: number;
}> {
  try {
    const res = await apiGet<any>('/admin/overview');
    if (res.success && res.data?.metrics) {
      const m = res.data.metrics;
      return {
        total: m.totalProperties || 0,
        available: m.publishedProperties || 0,
        sold: m.rejectedProperties || 0,
        rented: m.withdrawnProperties || 0,
      };
    }
  } catch {
    // Offline fallback
  }

  const properties = await getAdminProperties();
  return {
    total: properties.length,
    available: properties.filter((p) => p.status === 'available').length,
    sold: properties.filter((p) => p.status === 'sold').length,
    rented: properties.filter((p) => p.status === 'rented').length,
  };
}

/**
 * Reset local admin inventory back to clean initial SAMPLE_PROPERTIES
 */
export async function resetToSampleProperties(): Promise<void> {
  try {
    await SecureStore.setItemAsync(
      ADMIN_PROPERTIES_KEY,
      JSON.stringify(SAMPLE_PROPERTIES)
    );
  } catch (err) {
    if (__DEV__) {
      console.warn('[adminPropertyService] Failed to reset properties:', err);
    }
  }
}
