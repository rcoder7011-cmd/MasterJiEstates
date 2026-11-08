import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import {
  fetchUserFavourites,
  addFavouriteProperty,
  removeFavouriteProperty,
  recordRecentlyViewed,
} from '../services/api.js';

const FavouritesContext = createContext(null);

export function FavouritesProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [favouriteIds, setFavouriteIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Load favourites when user logs in
  const refreshFavourites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavouriteIds(new Set());
      return;
    }

    try {
      setIsLoading(true);
      const favs = await fetchUserFavourites();
      const ids = new Set(favs.map((p) => p.id || p.demoId || p.slug));
      setFavouriteIds(ids);
    } catch (err) {
      console.warn('[FavouritesContext] Could not load favourites:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshFavourites();
  }, [refreshFavourites]);

  const isFavourite = useCallback(
    (propertyId) => {
      if (!propertyId) return false;
      return favouriteIds.has(propertyId);
    },
    [favouriteIds]
  );

  const toggleFavourite = useCallback(
    async (propertyId) => {
      if (!propertyId) return false;

      if (!isAuthenticated) {
        // Return false to indicate user needs to sign in
        return { success: false, requiresAuth: true };
      }

      const alreadyFav = favouriteIds.has(propertyId);

      // Optimistic update
      setFavouriteIds((prev) => {
        const next = new Set(prev);
        if (alreadyFav) {
          next.delete(propertyId);
        } else {
          next.add(propertyId);
        }
        return next;
      });

      try {
        if (alreadyFav) {
          await removeFavouriteProperty(propertyId);
        } else {
          await addFavouriteProperty(propertyId);
        }
        return { success: true, isFavourite: !alreadyFav };
      } catch (err) {
        // Rollback optimistic update on error
        setFavouriteIds((prev) => {
          const next = new Set(prev);
          if (alreadyFav) {
            next.add(propertyId);
          } else {
            next.delete(propertyId);
          }
          return next;
        });
        throw err;
      }
    },
    [isAuthenticated, favouriteIds]
  );

  const trackView = useCallback(
    async (propertyId) => {
      if (!isAuthenticated || !propertyId) return;
      try {
        await recordRecentlyViewed(propertyId);
      } catch {
        // Non-critical tracking
      }
    },
    [isAuthenticated]
  );

  const value = {
    favouriteIds,
    favouritesCount: favouriteIds.size,
    isLoading,
    isFavourite,
    toggleFavourite,
    refreshFavourites,
    trackView,
  };

  return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>;
}

export function useFavourites() {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
}

export default FavouritesContext;

