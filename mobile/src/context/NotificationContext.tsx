/**
 * Notification Context — mobile/src/context/NotificationContext.tsx
 *
 * Provides reactive in-app notification state, real unread counts,
 * and optimistic read/deletion mutations.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { NotificationItem } from '../types/notification';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification as apiDeleteNotification,
} from '../services/notificationService';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from '../hooks/useAuth';

export interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const [notifsRes, count] = await Promise.all([
        fetchNotifications(1, 30),
        fetchUnreadCount(),
      ]);

      if (notifsRes.success && notifsRes.data) {
        setNotifications(notifsRes.data.notifications);
        setUnreadCount(notifsRes.data.unreadCount);
      } else {
        setUnreadCount(count);
      }
    } catch {
      // Ignore background refresh errors
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      Promise.resolve().then(async () => {
        if (isMounted) setIsLoading(true);
        await refreshNotifications();
        if (isMounted) setIsLoading(false);
      });
    } else {
      Promise.resolve().then(() => {
        if (isMounted) {
          setNotifications([]);
          setUnreadCount(0);
          setIsLoading(false);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, refreshNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    analyticsService.trackNotificationOpened(id, target?.type);

    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await markNotificationRead(id);
    } catch {
      // Revert if error
      refreshNotifications();
    }
  }, [notifications, refreshNotifications]);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
    );
    setUnreadCount(0);

    try {
      await markAllNotificationsRead();
    } catch {
      refreshNotifications();
    }
  }, [refreshNotifications]);

  const deleteNotification = useCallback(async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    const wasUnread = target && !target.read;

    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await apiDeleteNotification(id);
    } catch {
      refreshNotifications();
    }
  }, [notifications, refreshNotifications]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
    }),
    [
      notifications,
      unreadCount,
      isLoading,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
