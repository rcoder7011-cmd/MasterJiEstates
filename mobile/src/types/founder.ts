/**
 * Founder Types — mobile/src/types/founder.ts
 */

export interface FounderMetrics {
  totalProperties: number;
  activeProperties: number;
  pendingApprovals: number;
  rejectedProperties: number;
  totalEnquiries: number;
  pendingEnquiries: number;
  confirmedSiteVisits: number;
  totalUsers: number;
}

export interface FounderActivityItem {
  id: string;
  action: string;
  targetType: string;
  targetTitle: string;
  adminName: string;
  createdAt: string;
}

export interface FounderEnquirySummary {
  id: string;
  name: string;
  phone: string;
  enquiryType: string;
  status: string;
  propertyTitle: string;
  propertyId: string;
  createdAt: string;
}

export interface FounderSiteVisitSummary {
  id: string;
  userName: string;
  userPhone: string;
  preferredDate: string;
  timeSlot: string;
  status: string;
  propertyTitle: string;
  propertyId: string;
  createdAt: string;
}

export interface FounderDashboardData {
  databaseConnected: boolean;
  lastUpdated: string;
  leadership: {
    founder: {
      name: string;
      designation: string;
    };
    ceo: {
      name: string;
      designation: string;
    };
  };
  metrics: FounderMetrics;
  recentActivities: FounderActivityItem[];
  recentEnquiries: FounderEnquirySummary[];
  recentSiteVisits: FounderSiteVisitSummary[];
}

export interface FounderAccessVerification {
  authorized: boolean;
  founderContext?: {
    isAuthorized: boolean;
    role: 'founder' | 'ceo';
    verifiedAt: string;
  };
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    founderRole: 'founder' | 'ceo';
  };
}
