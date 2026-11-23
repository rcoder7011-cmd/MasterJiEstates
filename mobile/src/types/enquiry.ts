/**
 * Enquiry & Site Visit Types — src/types/enquiry.ts
 * Type definitions for customer enquiries, callback requests, and escorted site visits.
 */

export type EnquiryType = 'general' | 'callback' | 'price_discussion' | 'legal_docs';

export type EnquiryStatus =
  | 'new'
  | 'submitted'
  | 'under_review'
  | 'contacted'
  | 'completed'
  | 'closed';

export type SiteVisitStatus =
  | 'requested'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

export interface EnquiryRecord {
  id: string;
  referenceCode?: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation?: string;
  propertyPrice?: number;
  propertyImage?: string;
  customerName: string;
  customerContact: string;
  enquiryType?: EnquiryType;
  date: string;
  createdAt?: string;
  status: EnquiryStatus;
  message?: string;
}

export interface SiteVisitRecord {
  id: string;
  bookingReference: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation?: string;
  propertyPrice?: number;
  propertyImage?: string;
  customerName: string;
  customerContact: string;
  preferredDate: string;
  preferredTimeSlot: string;
  notes?: string;
  status: SiteVisitStatus;
  date: string;
  createdAt?: string;
}

export interface SubmitEnquiryInput {
  propertyId: string;
  propertyTitle?: string;
  name: string;
  email: string;
  phone: string;
  enquiryType?: EnquiryType;
  message?: string;
}

export interface ScheduleVisitInput {
  propertyId: string;
  propertyTitle?: string;
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTimeSlot: string;
  notes?: string;
}
