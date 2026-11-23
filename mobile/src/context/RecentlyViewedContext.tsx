/**
 * Recently Viewed Properties Context & Provider — src/context/RecentlyViewedContext.tsx
 * Records and manages customer viewing history with instant reactive updates.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { PropertyItem } from '../types/property';
import {
  getRecentlyViewed,
  recordPropertyView as serviceRecordView,
  removeRecentlyViewed as serviceRemoveViewed,
  clearRecentlyViewed as serviceClearViewed,
} from '../services/recentlyViewedService';

export interface RecentlyViewedContextType {
  recentlyViewed: PropertyItem[];
  recentlyViewedCount: number;
  recordView: (property: PropertyItem) => Promise<void>;
  removeViewed: (id: string) => Promise<void>;
  clearRecentlyViewed: () => Promise<void>;
  isLoadingRecentlyViewed: boolean;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [recentlyViewed, setRecentlyViewed] = useState<PropertyItem[]>([]);
  const [isLoadingRecentlyViewed, setIsLoadingRecentlyViewed] = useState(true);

  // Restore history on boot
  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const stored = await getRecentlyViewed();
        if (isMounted) {
          setRecentlyViewed(stored);
        }
      } catch (err) {
        if (__DEV__) {
          console.warn('[RecentlyViewedContext] Failed to load history:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoadingRecentlyViewed(false);
        }
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const recordView = useCallback(async (property: PropertyItem) => {
    if (!property || !property.id) return;
    try {
      const updated = await serviceRecordView(property);
      setRecentlyViewed(updated);
    } catch (err) {
      if (__DEV__) {
        console.warn('[RecentlyViewedContext] Failed to record view:', err);
      }
    }
  }, []);

  const removeViewed = useCallback(async (id: string) => {
    try {
      const updated = await serviceRemoveViewed(id);
      setRecentlyViewed(updated);
    } catch (err) {
      if (__DEV__) {
        console.warn('[RecentlyViewedContext] Failed to remove viewed item:', err);
      }
    }
  }, []);

  const clearRecentlyViewed = useCallback(async () => {
    try {
      await serviceClearViewed();
      setRecentlyViewed([]);
    } catch (err) {
      if (__DEV__) {
        console.warn('[RecentlyViewedContext] Failed to clear viewed items:', err);
      }
    }
  }, []);

  const value = useMemo(
    () => ({
      recentlyViewed,
      recentlyViewedCount: recentlyViewed.length,
      recordView,
      removeViewed,
      clearRecentlyViewed,
      isLoadingRecentlyViewed,
    }),
    [
      recentlyViewed,
      recordView,
      removeViewed,
      clearRecentlyViewed,
      isLoadingRecentlyViewed,
    ]
  );

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
}
