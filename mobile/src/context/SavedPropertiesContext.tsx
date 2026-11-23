/**
 * Saved Properties Context & Provider — src/context/SavedPropertiesContext.tsx
 * Provides reactive saved property state across all screens.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  getSavedPropertyIds,
  savePropertyId,
  removePropertyId,
} from '../services/savedPropertiesService';
import { analyticsService } from '../services/analyticsService';

export interface SavedPropertiesContextType {
  savedIds: string[];
  isSaved: (id: string) => boolean;
  toggleSave: (id: string) => Promise<boolean>;
  saveProperty: (id: string) => Promise<void>;
  removeProperty: (id: string) => Promise<void>;
  isLoadingSaved: boolean;
}

const SavedPropertiesContext = createContext<SavedPropertiesContextType | undefined>(undefined);

export function SavedPropertiesProvider({ children }: { children: React.ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);

  // Load saved IDs on startup
  useEffect(() => {
    let isMounted = true;

    async function loadSaved() {
      try {
        const ids = await getSavedPropertyIds();
        if (isMounted) {
          setSavedIds(ids);
        }
      } catch (err) {
        if (__DEV__) {
          console.warn('[SavedPropertiesContext] Error loading saved property IDs:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoadingSaved(false);
        }
      }
    }

    loadSaved();

    return () => {
      isMounted = false;
    };
  }, []);

  const isSaved = useCallback(
    (id: string) => {
      return savedIds.includes(id);
    },
    [savedIds]
  );

  const saveProperty = useCallback(async (id: string) => {
    const updated = await savePropertyId(id);
    setSavedIds(updated);
    analyticsService.trackWishlistToggled(id, 'added');
  }, []);

  const removeProperty = useCallback(async (id: string) => {
    const updated = await removePropertyId(id);
    setSavedIds(updated);
    analyticsService.trackWishlistToggled(id, 'removed');
  }, []);

  const toggleSave = useCallback(
    async (id: string): Promise<boolean> => {
      if (savedIds.includes(id)) {
        const updated = await removePropertyId(id);
        setSavedIds(updated);
        analyticsService.trackWishlistToggled(id, 'removed');
        return false;
      } else {
        const updated = await savePropertyId(id);
        setSavedIds(updated);
        analyticsService.trackWishlistToggled(id, 'added');
        return true;
      }
    },
    [savedIds]
  );

  const value = useMemo(
    () => ({
      savedIds,
      isSaved,
      toggleSave,
      saveProperty,
      removeProperty,
      isLoadingSaved,
    }),
    [savedIds, isSaved, toggleSave, saveProperty, removeProperty, isLoadingSaved]
  );

  return (
    <SavedPropertiesContext.Provider value={value}>
      {children}
    </SavedPropertiesContext.Provider>
  );
}

export function useSavedProperties() {
  const context = useContext(SavedPropertiesContext);
  if (!context) {
    throw new Error('useSavedProperties must be used within a SavedPropertiesProvider');
  }
  return context;
}

