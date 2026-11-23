/**
 * Compare Properties Context & Provider — src/context/CompareContext.tsx
 * Manages comparing 2-3 properties side-by-side across listings, cards, and details.
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
  getCompareProperties,
  saveCompareProperties,
  clearCompareProperties,
  MAX_COMPARE_LIMIT,
} from '../services/compareService';
import { analyticsService } from '../services/analyticsService';

export interface CompareResult {
  success: boolean;
  action?: 'added' | 'removed';
  reason?: 'max_limit' | 'already_added';
}

export interface CompareContextType {
  compareProperties: PropertyItem[];
  compareCount: number;
  isCompareFull: boolean;
  isInCompare: (id: string) => boolean;
  addToCompare: (property: PropertyItem) => CompareResult;
  removeFromCompare: (id: string) => void;
  toggleCompare: (property: PropertyItem) => CompareResult;
  clearCompare: () => void;
  isLoadingCompare: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareProperties, setCompareProperties] = useState<PropertyItem[]>([]);
  const [isLoadingCompare, setIsLoadingCompare] = useState(true);

  // Restore comparison list on app boot
  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const stored = await getCompareProperties();
        if (isMounted) {
          setCompareProperties(stored);
        }
      } catch (err) {
        if (__DEV__) {
          console.warn('[CompareContext] Failed to load compare properties:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoadingCompare(false);
        }
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const isInCompare = useCallback(
    (id: string) => {
      return compareProperties.some((p) => p.id === id);
    },
    [compareProperties]
  );

  const addToCompare = useCallback(
    (property: PropertyItem): CompareResult => {
      if (compareProperties.some((p) => p.id === property.id)) {
        return { success: false, reason: 'already_added' };
      }

      if (compareProperties.length >= MAX_COMPARE_LIMIT) {
        return { success: false, reason: 'max_limit' };
      }

      const updated = [...compareProperties, property];
      setCompareProperties(updated);
      saveCompareProperties(updated);
      analyticsService.trackPropertyCompared(updated.length, updated.map((p) => p.id));
      return { success: true, action: 'added' };
    },
    [compareProperties]
  );

  const removeFromCompare = useCallback(
    (id: string) => {
      const updated = compareProperties.filter((p) => p.id !== id);
      setCompareProperties(updated);
      saveCompareProperties(updated);
    },
    [compareProperties]
  );

  const toggleCompare = useCallback(
    (property: PropertyItem): CompareResult => {
      const exists = compareProperties.some((p) => p.id === property.id);
      if (exists) {
        removeFromCompare(property.id);
        return { success: true, action: 'removed' };
      } else {
        return addToCompare(property);
      }
    },
    [compareProperties, addToCompare, removeFromCompare]
  );

  const clearCompare = useCallback(() => {
    setCompareProperties([]);
    clearCompareProperties();
  }, []);

  const value = useMemo(
    () => ({
      compareProperties,
      compareCount: compareProperties.length,
      isCompareFull: compareProperties.length >= MAX_COMPARE_LIMIT,
      isInCompare,
      addToCompare,
      removeFromCompare,
      toggleCompare,
      clearCompare,
      isLoadingCompare,
    }),
    [
      compareProperties,
      isInCompare,
      addToCompare,
      removeFromCompare,
      toggleCompare,
      clearCompare,
      isLoadingCompare,
    ]
  );

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
