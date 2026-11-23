/**
 * Moderation & Safety Client Service — mobile/src/services/moderationService.ts
 *
 * Provides API communications for property reporting, admin report review,
 * property verification, and listing suspension/restoration.
 */

import { apiGet, apiPost, apiPatch } from './apiClient';
import {
  PropertyReportItem,
  SubmitReportInput,
  UpdateReportInput,
  VerifyPropertyInput,
} from '../types/moderation';

export interface AdminReportsResponse {
  reports: PropertyReportItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Submit a report on a suspect, inaccurate, or unavailable property.
 */
export async function submitPropertyReport(
  propertyId: string,
  input: SubmitReportInput
): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
  try {
    const response = await apiPost<{ success: boolean; data: any; message?: string }>(
      `/properties/${propertyId}/report`,
      input
    );
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Report submitted successfully.',
      };
    }
    return {
      success: false,
      error: response.error || 'Failed to submit report.',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error submitting property report.',
    };
  }
}

/**
 * Fetch reports submitted by the logged-in customer.
 */
export async function fetchMyReports(): Promise<{
  success: boolean;
  data?: PropertyReportItem[];
  error?: string;
}> {
  try {
    const response = await apiGet<PropertyReportItem[]>('/properties/reports/my-reports');
    if (response.success && Array.isArray(response.data)) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      error: response.error || 'Failed to load reports.',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error loading user reports.',
    };
  }
}

/**
 * Admin: Fetch moderation reports queue with filters and pagination.
 */
export async function fetchAdminReports(params: {
  status?: string;
  reason?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{
  success: boolean;
  data?: AdminReportsResponse;
  error?: string;
}> {
  try {
    const queryParts: string[] = [];
    if (params.status) queryParts.push(`status=${encodeURIComponent(params.status)}`);
    if (params.reason) queryParts.push(`reason=${encodeURIComponent(params.reason)}`);
    if (params.page) queryParts.push(`page=${params.page}`);
    if (params.limit) queryParts.push(`limit=${params.limit}`);

    const queryStr = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const response = await apiGet<AdminReportsResponse>(`/admin/reports${queryStr}`);

    if (response.success && response.data) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      error: response.error || 'Failed to load moderation reports.',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error loading admin reports.',
    };
  }
}

/**
 * Admin: Fetch single report detail.
 */
export async function fetchAdminReportById(id: string): Promise<{
  success: boolean;
  data?: PropertyReportItem;
  error?: string;
}> {
  try {
    const response = await apiGet<PropertyReportItem>(`/admin/reports/${id}`);
    if (response.success && response.data) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      error: response.error || 'Failed to load report detail.',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error loading report detail.',
    };
  }
}

/**
 * Admin: Update moderation report status and notes.
 */
export async function updateAdminReport(
  id: string,
  input: UpdateReportInput
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await apiPatch(`/admin/reports/${id}`, input);
    return { success: response.success, data: response.data, error: response.error };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Admin: Suspend listing from public view.
 */
export async function suspendPropertyListing(
  id: string,
  reason = ''
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await apiPost(`/admin/properties/${id}/suspend`, { reason });
    return { success: response.success, data: response.data, error: response.error };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Admin: Restore suspended listing back to active catalogue.
 */
export async function restorePropertyListing(
  id: string,
  notes = ''
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await apiPost(`/admin/properties/${id}/restore`, { notes });
    return { success: response.success, data: response.data, error: response.error };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Admin: Update property verification status and assign trust badge.
 */
export async function verifyPropertyListing(
  id: string,
  input: VerifyPropertyInput
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await apiPatch(`/admin/properties/${id}/verify`, input);
    return { success: response.success, data: response.data, error: response.error };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export const moderationService = {
  submitPropertyReport,
  fetchMyReports,
  fetchAdminReports,
  fetchAdminReportById,
  updateAdminReport,
  suspendPropertyListing,
  restorePropertyListing,
  verifyPropertyListing,
};
