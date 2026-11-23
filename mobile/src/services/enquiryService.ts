/**
 * Customer Enquiry & Site Visit Service — src/services/enquiryService.ts
 * Manages customer property enquiries, callback requests, site visit scheduling,
 * and retrieval of authenticated customer consultations.
 */

import {
  EnquiryRecord,
  EnquiryStatus,
  SiteVisitRecord,
  SiteVisitStatus,
  SubmitEnquiryInput,
  ScheduleVisitInput,
} from '../types/enquiry';
import { apiGet, apiPost, apiPatch } from './apiClient';
import { analyticsService } from './analyticsService';

/**
 * Normalizes raw backend enquiry status into mobile EnquiryStatus
 */
export function normalizeEnquiryStatus(status?: string): EnquiryStatus {
  const s = (status || '').toLowerCase();
  if (s === 'contacted') return 'contacted';
  if (s === 'follow_up' || s === 'under_review') return 'under_review';
  if (s === 'converted' || s === 'completed') return 'completed';
  if (s === 'closed') return 'closed';
  return 'new';
}

/**
 * Maps raw backend enquiry document to EnquiryRecord interface
 */
export function mapBackendEnquiryToRecord(raw: any): EnquiryRecord {
  const propertySnippet = raw.property || {};
  return {
    id: raw.id || raw._id || `enq-${Date.now()}`,
    referenceCode: raw.referenceCode,
    propertyId: raw.propertyId || propertySnippet.id || 'prop-default',
    propertyTitle: raw.propertyTitle || propertySnippet.title || 'MasterJi Estates Property',
    propertyLocation: propertySnippet.locality
      ? `${propertySnippet.locality}, ${propertySnippet.city || 'Delhi NCR'}`
      : raw.propertyLocation || 'Delhi NCR',
    propertyPrice:
      typeof propertySnippet.price === 'number'
        ? propertySnippet.price
        : typeof raw.propertyPrice === 'number'
        ? raw.propertyPrice
        : 0,
    propertyImage:
      propertySnippet.coverImage ||
      (Array.isArray(propertySnippet.images) && propertySnippet.images[0]) ||
      undefined,
    customerName: raw.name || raw.fullName || 'Valued Customer',
    customerContact: raw.phone || raw.email || '',
    enquiryType: raw.enquiryType || 'general',
    date: raw.createdAt
      ? new Date(raw.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'Recent',
    createdAt: raw.createdAt,
    status: normalizeEnquiryStatus(raw.status),
    message: raw.message,
  };
}

/**
 * Maps raw backend site visit document to SiteVisitRecord interface
 */
export function mapBackendSiteVisitToRecord(raw: any): SiteVisitRecord {
  const propertySnippet = raw.property || {};
  return {
    id: raw.id || raw._id || `visit-${Date.now()}`,
    bookingReference: raw.bookingReference || raw.referenceCode || 'VISIT',
    propertyId: raw.propertyId || propertySnippet.id || 'prop-default',
    propertyTitle: raw.propertyTitle || propertySnippet.title || 'MasterJi Estates Property',
    propertyLocation: propertySnippet.locality
      ? `${propertySnippet.locality}, ${propertySnippet.city || 'Delhi NCR'}`
      : raw.propertyLocation || 'Delhi NCR',
    propertyPrice:
      typeof propertySnippet.price === 'number'
        ? propertySnippet.price
        : typeof raw.propertyPrice === 'number'
        ? raw.propertyPrice
        : 0,
    propertyImage:
      propertySnippet.coverImage ||
      (Array.isArray(propertySnippet.images) && propertySnippet.images[0]) ||
      undefined,
    customerName: raw.name || raw.fullName || 'Valued Customer',
    customerContact: raw.phone || raw.email || '',
    preferredDate: raw.preferredDate
      ? new Date(raw.preferredDate).toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'Date Pending',
    preferredTimeSlot: raw.preferredTimeSlot || 'Morning (10:00 AM - 01:00 PM)',
    notes: raw.notes || '',
    status: (raw.status || 'requested').toLowerCase() as SiteVisitStatus,
    date: raw.createdAt
      ? new Date(raw.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'Recent',
    createdAt: raw.createdAt,
  };
}

/**
 * Fetch authenticated customer enquiry history from backend
 */
export async function fetchUserEnquiries(): Promise<EnquiryRecord[]> {
  try {
    const response = await apiGet<any[]>('/dashboard/enquiries');
    if (response.success && Array.isArray(response.data) && response.data.length > 0) {
      return response.data.map(mapBackendEnquiryToRecord);
    }
  } catch {
    // Graceful offline fallback
  }

  return [];
}

/**
 * Fetch authenticated customer site visit requests from backend
 */
export async function fetchUserSiteVisits(): Promise<SiteVisitRecord[]> {
  try {
    const response = await apiGet<any[]>('/dashboard/site-visits');
    if (response.success && Array.isArray(response.data) && response.data.length > 0) {
      return response.data.map(mapBackendSiteVisitToRecord);
    }
  } catch {
    // Graceful offline fallback
  }

  return [];
}

/**
 * Submit a customer property enquiry or callback request to the backend
 */
export async function submitPropertyEnquiry(input: SubmitEnquiryInput): Promise<{
  success: boolean;
  referenceCode?: string;
  message?: string;
  error?: string;
}> {
  try {
    const cleanPhone = (input.phone || '').replace(/[\s-]/g, '');
    let finalMessage = (input.message || '').trim();
    if (!finalMessage || finalMessage.length < 10) {
      if (input.enquiryType === 'callback') {
        finalMessage = 'Customer requested a direct phone callback from a MasterJi Estates advisor.';
      } else if (input.enquiryType === 'price_discussion') {
        finalMessage = 'Customer requested consultation regarding property pricing and negotiation options.';
      } else if (input.enquiryType === 'legal_docs') {
        finalMessage = 'Customer requested verification of property title deeds, layout approvals, and RERA status.';
      } else {
        finalMessage = 'Customer expressed interest and requested detailed property information and next steps.';
      }
    }

    const payload = {
      propertyId: input.propertyId,
      propertyTitle: input.propertyTitle,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: cleanPhone,
      enquiryType: input.enquiryType || 'general',
      message: finalMessage,
    };

    const response = await apiPost<{ referenceCode?: string }>('/enquiries', payload);
    if (response.success) {
      analyticsService.trackEnquirySubmitted({
        propertyId: input.propertyId,
        enquiryType: input.enquiryType,
        source: 'mobile_app',
      });
      return {
        success: true,
        referenceCode: response.data?.referenceCode,
        message:
          response.message ||
          'Your enquiry has been received successfully. A MasterJi Estates advisor will contact you within 24 hours.',
      };
    }
    return {
      success: false,
      error: response.error || 'Unable to submit enquiry. Please try again.',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network error while submitting enquiry.',
    };
  }
}

/**
 * Submit an escorted site visit request to the backend
 */
export async function schedulePropertyVisit(input: ScheduleVisitInput): Promise<{
  success: boolean;
  bookingReference?: string;
  message?: string;
  error?: string;
}> {
  try {
    const cleanPhone = (input.phone || '').replace(/[\s-]/g, '');
    const payload = {
      propertyId: input.propertyId,
      propertyTitle: input.propertyTitle,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: cleanPhone,
      preferredDate: input.preferredDate,
      preferredTimeSlot: input.preferredTimeSlot,
      notes: (input.notes || '').trim(),
    };

    const response = await apiPost<{ bookingReference?: string }>('/site-visits', payload);
    if (response.success) {
      analyticsService.trackSiteVisitRequested({
        propertyId: input.propertyId,
        preferredDate: input.preferredDate,
        preferredSlot: input.preferredTimeSlot,
      });
      return {
        success: true,
        bookingReference: response.data?.bookingReference,
        message:
          response.message ||
          'Your site visit request has been received. Our team will contact you to confirm the appointment and arrange the escorted visit.',
      };
    }
    return {
      success: false,
      error: response.error || 'Unable to schedule site visit. Please try again.',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network error while scheduling site visit.',
    };
  }
}

/**
 * Cancel a pending customer site visit request
 */
export async function cancelUserSiteVisit(idOrRef: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const response = await apiPatch(`/dashboard/site-visits/${idOrRef}/cancel`);
    if (response.success) {
      return {
        success: true,
        message: response.message || 'Your site visit request has been successfully cancelled.',
      };
    }
    return {
      success: false,
      error: response.error || 'Unable to cancel site visit.',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network error while cancelling site visit.',
    };
  }
}
