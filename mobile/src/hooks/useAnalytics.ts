/**
 * useAnalytics Hook — src/hooks/useAnalytics.ts
 * Provides reactive access to privacy-conscious event tracking throughout the app.
 */

import { useCallback } from 'react';
import { analyticsService, AnalyticsEventName } from '../services/analyticsService';

export function useAnalytics() {
  const track = useCallback(
    (eventName: AnalyticsEventName, properties?: Record<string, any>) => {
      return analyticsService.track(eventName, properties);
    },
    []
  );

  const trackAppOpened = useCallback(() => {
    analyticsService.trackAppOpened();
  }, []);

  const trackUserSignedUp = useCallback((method: 'phone' | 'email') => {
    analyticsService.trackUserSignedUp(method);
  }, []);

  const trackUserLoggedIn = useCallback((method: 'password' | 'otp', role?: string) => {
    analyticsService.trackUserLoggedIn(method, role);
  }, []);

  const trackUserLoggedOut = useCallback(() => {
    analyticsService.trackUserLoggedOut();
  }, []);

  const trackPropertyViewed = useCallback(
    (params: {
      propertyId: string;
      category?: string;
      transaction?: string;
      city?: string;
      price?: number;
    }) => {
      analyticsService.trackPropertyViewed(params);
    },
    []
  );

  const trackPropertySearched = useCallback((query: string, resultCount?: number) => {
    analyticsService.trackPropertySearched(query, resultCount);
  }, []);

  const trackFiltersApplied = useCallback(
    (summary: {
      transaction?: string;
      propertyType?: string;
      hasNearMe?: boolean;
      hasPriceRange?: boolean;
      activeCount: number;
    }) => {
      analyticsService.trackFiltersApplied(summary);
    },
    []
  );

  const trackWishlistToggled = useCallback((propertyId: string, action: 'added' | 'removed') => {
    analyticsService.trackWishlistToggled(propertyId, action);
  }, []);

  const trackPropertyCompared = useCallback((propertyCount: number, propertyIds?: string[]) => {
    analyticsService.trackPropertyCompared(propertyCount, propertyIds);
  }, []);

  const trackEnquirySubmitted = useCallback(
    (params: { propertyId?: string; enquiryType?: string; source?: string }) => {
      analyticsService.trackEnquirySubmitted(params);
    },
    []
  );

  const trackSiteVisitRequested = useCallback(
    (params: { propertyId: string; preferredDate?: string; preferredSlot?: string }) => {
      analyticsService.trackSiteVisitRequested(params);
    },
    []
  );

  const trackListingSubmitted = useCallback(
    (params: { propertyType: string; transaction: string; city?: string; mediaCount?: number }) => {
      analyticsService.trackListingSubmitted(params);
    },
    []
  );

  const trackNotificationOpened = useCallback(
    (notificationId: string, notificationType?: string) => {
      analyticsService.trackNotificationOpened(notificationId, notificationType);
    },
    []
  );

  return {
    track,
    trackAppOpened,
    trackUserSignedUp,
    trackUserLoggedIn,
    trackUserLoggedOut,
    trackPropertyViewed,
    trackPropertySearched,
    trackFiltersApplied,
    trackWishlistToggled,
    trackPropertyCompared,
    trackEnquirySubmitted,
    trackSiteVisitRequested,
    trackListingSubmitted,
    trackNotificationOpened,
    setEnabled: analyticsService.setEnabled.bind(analyticsService),
    isEnabled: analyticsService.isEnabled.bind(analyticsService),
    getEventQueue: analyticsService.getEventQueue.bind(analyticsService),
  };
}

export default useAnalytics;
