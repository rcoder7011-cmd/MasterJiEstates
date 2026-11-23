/**
 * Founder Service — mobile/src/services/founderService.js / .ts
 *
 * Provides API communication with the protected /api/founder endpoints.
 */

import { apiGet } from './apiClient';
import {
  FounderDashboardData,
  FounderAccessVerification,
} from '../types/founder';

/**
 * Fetch verified real-time metrics, backlog, enquiries, and audit activity
 * for the Private Founder Dashboard.
 */
export async function fetchFounderOverview(): Promise<{
  success: boolean;
  data?: FounderDashboardData;
  error?: string;
  statusCode?: number;
}> {
  try {
    const response = await apiGet<FounderDashboardData>('/founder/overview');
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
      };
    }
    return {
      success: false,
      error: response.error || 'Failed to retrieve Founder overview.',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error fetching Founder overview.',
    };
  }
}

/**
 * Verify whether the current authenticated session holds verified Founder/CEO credentials.
 */
export async function verifyFounderAccess(): Promise<{
  authorized: boolean;
  role?: 'founder' | 'ceo';
  error?: string;
}> {
  try {
    const response = await apiGet<FounderAccessVerification>('/founder/verify-access');
    if (response.success && response.data?.authorized) {
      return {
        authorized: true,
        role: response.data.founderContext?.role || 'founder',
      };
    }
    return {
      authorized: false,
      error: response.error || 'Founder authorization failed.',
    };
  } catch (error: any) {
    return {
      authorized: false,
      error: error.message || 'Network error validating Founder authorization.',
    };
  }
}
