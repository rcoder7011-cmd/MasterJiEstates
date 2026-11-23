/**
 * Saved Search Type Definitions — mobile/src/types/savedSearch.ts
 */

import { PropertyFilterState } from './property';

export type SavedSearchFilters = Partial<PropertyFilterState>;

export interface SavedSearchItem {
  id: string;
  name: string;
  filters: Partial<PropertyFilterState>;
  alertsEnabled: boolean;
  matchingCount: number;
  lastNotifiedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSavedSearchInput {
  name: string;
  filters: Partial<PropertyFilterState>;
  alertsEnabled?: boolean;
}

export interface UpdateSavedSearchInput {
  name?: string;
  alertsEnabled?: boolean;
  filters?: Partial<PropertyFilterState>;
}
