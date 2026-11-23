/**
 * Notification Client Service — mobile/src/services/notificationService.ts
 *
 * Coordinates API communications for in-app notification inbox,
 * unread badges, push token registration, and notification preferences.
 */

import { apiGet, apiPatch, apiPost, apiDelete } from './apiClient';
import {
  NotificationItem,
  NotificationPreferences,
} from '../types/notification';

export interface NotificationsResponse {
  notifications: NotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

/**
 * Fetch user notifications list from backend
 */
export async function fetchNotifications(
  page = 1,
  limit = 30
): Promise<{ success: boolean; data?: NotificationsResponse; error?: string }> {
  try {
    const response = await apiGet<NotificationsResponse>(
      `/notifications?page=${page}&limit=${limit}`
    );
    if (response.success && response.data) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      error: response.error || 'Failed to retrieve notifications.',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error retrieving notifications.',
    };
  }
}

/**
 * Fetch genuine unread notification count
 */
export async function fetchUnreadCount(): Promise<number> {
  try {
    const response = await apiGet<{ unreadCount: number }>('/notifications/unread-count');
    if (response.success && typeof response.data?.unreadCount === 'number') {
      return response.data.unreadCount;
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiPatch(`/notifications/${notificationId}/read`, {});
    return { success: response.success, error: response.error };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Mark all user notifications as read
 */
export async function markAllNotificationsRead(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiPatch('/notifications/read-all', {});
    return { success: response.success, error: response.error };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete an individual notification
 */
export async function deleteNotification(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiDelete(`/notifications/${notificationId}`);
    return { success: response.success, error: response.error };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Register device push token securely on backend
 */
export async function registerDevicePushToken(
  token: string,
  platform = 'expo'
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiPost('/notifications/register-token', { token, platform });
    return { success: response.success, error: response.error };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Unregister device push token
 */
export async function unregisterDevicePushToken(
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiPost('/notifications/unregister-token', { token });
    return { success: response.success, error: response.error };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update user notification preferences
 */
export async function saveNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiPatch('/dashboard/profile', {
      notificationPreferences: preferences,
    });
    return { success: response.success, error: response.error };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export const notificationService = {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  registerDevicePushToken,
  unregisterDevicePushToken,
  saveNotificationPreferences,
};
