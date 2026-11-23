/**
 * Notification Type Definitions — mobile/src/types/notification.ts
 */

export type NotificationType =
  | 'enquiry_update'
  | 'site_visit_update'
  | 'new_matching_property'
  | 'system_announcement'
  | 'saved_property_update';

export interface NotificationData {
  propertyId?: string;
  propertyTitle?: string;
  enquiryId?: string;
  siteVisitId?: string;
  savedSearchId?: string;
  route?: string;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  readAt?: string | null;
  data?: NotificationData;
  createdAt: string;
}

export interface NotificationPreferences {
  enquiryUpdates: boolean;
  siteVisitUpdates: boolean;
  newListingsAlerts: boolean;
  priceDropAlerts: boolean;
  whatsappAlerts: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enquiryUpdates: true,
  siteVisitUpdates: true,
  newListingsAlerts: true,
  priceDropAlerts: true,
  whatsappAlerts: true,
};
