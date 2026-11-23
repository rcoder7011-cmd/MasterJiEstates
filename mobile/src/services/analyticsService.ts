/**
 * Privacy-Conscious Mobile Analytics Service — src/services/analyticsService.ts
 *
 * Provides a lightweight, decoupled analytics engine to understand MJ Estates app usage.
 *
 * Core Privacy & Security Rules:
 * - Strict Zero-PII Policy: Never collects passwords, OTPs, auth tokens, full names, or private messages.
 * - Deduplication: Prevents duplicate tracking of rapid property views or identical searches.
 * - Decoupled: Failures in analytics never crash or impede primary UI or business actions.
 * - User Consent: Respects user preference (can be enabled/disabled via App Preferences).
 * - In-Memory Audit Buffer: Maintains latest 100 events for diagnostic verification.
 */

import { Platform } from 'react-native';
import { APP_CONFIG } from '../config/appConfig';

export type AnalyticsEventName =
  | 'app_opened'
  | 'user_signed_up'
  | 'user_logged_in'
  | 'user_logged_out'
  | 'property_viewed'
  | 'property_searched'
  | 'filters_applied'
  | 'property_wishlist_toggled'
  | 'property_compared'
  | 'enquiry_submitted'
  | 'site_visit_requested'
  | 'listing_submitted'
  | 'notification_opened';

export interface AnalyticsEvent {
  id: string;
  name: AnalyticsEventName;
  properties: Record<string, any>;
  timestamp: string;
}

export type AnalyticsAdapter = (event: AnalyticsEvent) => void | Promise<void>;

class AnalyticsService {
  private enabled: boolean = true;
  private queue: AnalyticsEvent[] = [];
  private maxQueueSize: number = 100;
  private adapters: AnalyticsAdapter[] = [];
  private recentDedupeMap: Map<string, number> = new Map();
  private dedupeWindowMs: number = 4000; // 4 seconds deduplication window

  constructor() {
    // Default development adapter (non-blocking logger)
    if (__DEV__) {
      this.registerAdapter((event) => {
        // Safe logging without any sensitive details
        // console.log(`[MJ Analytics] ${event.name}`, event.properties);
      });
    }
  }

  /**
   * Enable or disable tracking based on user consent.
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Register an external provider adapter (e.g. Firebase, PostHog, backend telemetry).
   */
  public registerAdapter(adapter: AnalyticsAdapter): () => void {
    this.adapters.push(adapter);
    return () => {
      this.adapters = this.adapters.filter((a) => a !== adapter);
    };
  }

  /**
   * Retrieve recent in-memory event queue (useful for audits and tests).
   */
  public getEventQueue(): ReadonlyArray<AnalyticsEvent> {
    return [...this.queue];
  }

  /**
   * Clear in-memory event buffer.
   */
  public clearQueue(): void {
    this.queue = [];
    this.recentDedupeMap.clear();
  }

  /**
   * Base event tracking method with PII sanitization and deduplication.
   */
  public track(eventName: AnalyticsEventName, properties: Record<string, any> = {}): boolean {
    if (!this.enabled) return false;

    // Deduplication check for specific events (e.g. repeated views or identical searches)
    const dedupeKey = this.getDedupeKey(eventName, properties);
    if (dedupeKey) {
      const now = Date.now();
      const lastTracked = this.recentDedupeMap.get(dedupeKey);
      if (lastTracked && now - lastTracked < this.dedupeWindowMs) {
        return false; // Skip duplicate event
      }
      this.recentDedupeMap.set(dedupeKey, now);

      // Clean up stale entries periodically
      if (this.recentDedupeMap.size > 200) {
        for (const [k, time] of this.recentDedupeMap.entries()) {
          if (now - time > this.dedupeWindowMs * 2) {
            this.recentDedupeMap.delete(k);
          }
        }
      }
    }

    // Strip any accidental sensitive fields (Passwords, OTPs, Tokens, Emails, Phones)
    const sanitizedProps = this.sanitizeProperties(properties);

    const event: AnalyticsEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: eventName,
      properties: {
        ...sanitizedProps,
        appVersion: APP_CONFIG.version,
        platform: Platform.OS,
      },
      timestamp: new Date().toISOString(),
    };

    // Store in FIFO memory queue
    this.queue.push(event);
    if (this.queue.length > this.maxQueueSize) {
      this.queue.shift();
    }

    // Dispatch to registered adapters asynchronously
    for (const adapter of this.adapters) {
      try {
        const res = adapter(event);
        if (res && typeof (res as Promise<void>).catch === 'function') {
          (res as Promise<void>).catch(() => {});
        }
      } catch {
        // Silently isolate adapter failures
      }
    }

    return true;
  }

  private getDedupeKey(name: AnalyticsEventName, props: Record<string, any>): string | null {
    if (name === 'property_viewed' && props.propertyId) {
      return `view:${props.propertyId}`;
    }
    if (name === 'property_searched' && props.query) {
      return `search:${String(props.query).trim().toLowerCase()}`;
    }
    if (name === 'app_opened') {
      return 'app_opened';
    }
    return null;
  }

  private sanitizeProperties(props: Record<string, any>): Record<string, any> {
    const clean: Record<string, any> = {};
    const sensitiveKeys = new Set([
      'password',
      'confirmpassword',
      'otp',
      'code',
      'token',
      'jwt',
      'authorization',
      'email',
      'phone',
      'phonenumber',
      'name',
      'fullname',
    ]);

    for (const [key, value] of Object.entries(props)) {
      if (sensitiveKeys.has(key.toLowerCase())) {
        continue; // Omit sensitive data entirely
      }
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        clean[key] = this.sanitizeProperties(value);
      } else {
        clean[key] = value;
      }
    }

    return clean;
  }

  // ---------------------------------------------------------------------------
  // CONVENIENCE TYPED TRACKING HELPERS (13 REQUIRED ROADMAP EVENTS)
  // ---------------------------------------------------------------------------

  /** 1. App Opened */
  public trackAppOpened(): void {
    this.track('app_opened');
  }

  /** 2. User Signup */
  public trackUserSignedUp(method: 'phone' | 'email'): void {
    this.track('user_signed_up', { method });
  }

  /** 3. User Login */
  public trackUserLoggedIn(method: 'password' | 'otp', role: string = 'user'): void {
    this.track('user_logged_in', { method, role });
  }

  /** 4. User Logout */
  public trackUserLoggedOut(): void {
    this.track('user_logged_out');
  }

  /** 5. Property Viewed */
  public trackPropertyViewed(params: {
    propertyId: string;
    category?: string;
    transaction?: string;
    city?: string;
    price?: number;
  }): void {
    this.track('property_viewed', {
      propertyId: params.propertyId,
      category: params.category,
      transaction: params.transaction,
      city: params.city,
      priceBand: params.price ? this.classifyPriceBand(params.price) : undefined,
    });
  }

  /** 6. Property Searched */
  public trackPropertySearched(query: string, resultCount?: number): void {
    this.track('property_searched', {
      queryLength: query.trim().length,
      hasQuery: query.trim().length > 0,
      resultCount,
    });
  }

  /** 7. Filters Applied */
  public trackFiltersApplied(filterSummary: {
    transaction?: string;
    propertyType?: string;
    hasNearMe?: boolean;
    hasPriceRange?: boolean;
    activeCount: number;
  }): void {
    this.track('filters_applied', filterSummary);
  }

  /** 8. Property Wishlist Toggled */
  public trackWishlistToggled(propertyId: string, action: 'added' | 'removed'): void {
    this.track('property_wishlist_toggled', { propertyId, action });
  }

  /** 9. Property Compared */
  public trackPropertyCompared(propertyCount: number, propertyIds?: string[]): void {
    this.track('property_compared', {
      propertyCount,
      propertyIds: propertyIds?.slice(0, 4),
    });
  }

  /** 10. Enquiry Submitted */
  public trackEnquirySubmitted(params: {
    propertyId?: string;
    enquiryType?: string;
    source?: string;
  }): void {
    this.track('enquiry_submitted', params);
  }

  /** 11. Site Visit Requested */
  public trackSiteVisitRequested(params: {
    propertyId: string;
    preferredDate?: string;
    preferredSlot?: string;
  }): void {
    this.track('site_visit_requested', {
      propertyId: params.propertyId,
      preferredSlot: params.preferredSlot,
      hasPreferredDate: Boolean(params.preferredDate),
    });
  }

  /** 12. Listing Submitted */
  public trackListingSubmitted(params: {
    propertyType: string;
    transaction: string;
    city?: string;
    mediaCount?: number;
  }): void {
    this.track('listing_submitted', params);
  }

  /** 13. Notification Opened */
  public trackNotificationOpened(notificationId: string, notificationType?: string): void {
    this.track('notification_opened', {
      notificationId,
      notificationType,
    });
  }

  private classifyPriceBand(price: number): string {
    if (price < 2500000) return 'under_25l';
    if (price < 5000000) return '25l_50l';
    if (price < 10000000) return '50l_1cr';
    if (price < 25000000) return '1cr_2.5cr';
    if (price < 50000000) return '2.5cr_5cr';
    return 'above_5cr';
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
