/**
 * Moderation, Trust & Safety Type Definitions — mobile/src/types/moderation.ts
 */

export type ReportReason =
  | 'fake_suspicious'
  | 'incorrect_price'
  | 'incorrect_info'
  | 'duplicate_listing'
  | 'misleading_images'
  | 'unavailable'
  | 'other';

export type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type VerificationBadge =
  | 'none'
  | 'listing_approved'
  | 'details_reviewed'
  | 'documents_verified';

export interface PropertyVerificationInfo {
  status: VerificationStatus;
  badge: VerificationBadge;
  badgeLabel?: string;
  verifiedAt?: string | null;
  rejectionReason?: string;
}

export interface SuspiciousSignals {
  isFlagged: boolean;
  duplicateScore?: number;
  reasons: string[];
  potentialDuplicateIds: string[];
  flaggedAt?: string | null;
}

export interface PropertyReportItem {
  id: string;
  propertyIdString: string;
  propertyTitle: string;
  reason: ReportReason;
  reasonLabel: string;
  description?: string;
  status: ReportStatus;
  reporter?: {
    id: string | null;
    name: string;
    email?: string;
    phone?: string;
  };
  adminNotes?: string;
  actionTaken?: 'none' | 'listing_suspended' | 'details_corrected' | 'report_dismissed' | 'other';
  reviewedBy?: { id: string; name: string } | null;
  reviewedAt?: string | null;
  createdAt: string;
  duplicateSignals?: SuspiciousSignals | null;
  propertyDetails?: {
    id: string;
    title: string;
    price: number;
    priceFormatted: string;
    city: string;
    locality: string;
    availabilityStatus: string;
    verification?: PropertyVerificationInfo;
  } | null;
}

export interface SubmitReportInput {
  reason: ReportReason;
  description?: string;
}

export interface UpdateReportInput {
  status: ReportStatus;
  adminNotes?: string;
  actionTaken?: 'none' | 'listing_suspended' | 'details_corrected' | 'report_dismissed' | 'other';
}

export interface VerifyPropertyInput {
  status: VerificationStatus;
  badge: VerificationBadge;
  rejectionReason?: string;
  remarks?: string;
}
