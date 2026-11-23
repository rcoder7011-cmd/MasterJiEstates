/**
 * Custom Hook: usePropertyFilters
 * Manages search, multi-criteria filtering, sorting, route param synchronization,
 * and filter chip removal for MJ Estates property catalog.
 */

import { useState, useMemo, useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  PropertyItem,
  PropertyFilterState,
  PropertySortOption,
  TransactionType,
  PropertyCategoryType,
  ActiveFilterChip,
} from '../types/property';
import { DEFAULT_FILTER_STATE } from '../constants/propertyFilters';
import { SAMPLE_PROPERTIES } from '../constants/sampleProperties';
import {
  filterProperties,
  sortProperties,
  getActiveFilterCount,
  getActiveFilterChips,
} from '../utils/propertyFiltering';

export interface UsePropertyFiltersProps {
  initialProperties?: PropertyItem[];
}

function initFiltersFromParams(params: {
  intent?: string;
  transaction?: string;
  type?: string;
  q?: string;
  city?: string;
}): PropertyFilterState {
  const initial = { ...DEFAULT_FILTER_STATE };
  const tx = (params.transaction || params.intent || '').toLowerCase();

  if (['buy', 'rent', 'sell'].includes(tx)) {
    initial.transaction = tx as TransactionType;
  }
  if (params.type && ['residential', 'commercial', 'plot'].includes(params.type.toLowerCase())) {
    initial.propertyType = params.type.toLowerCase() as PropertyCategoryType;
  }
  if (params.q && typeof params.q === 'string') {
    initial.searchQuery = params.q;
  }
  if (params.city && typeof params.city === 'string') {
    initial.city = params.city;
  }

  return initial;
}

export function usePropertyFilters({
  initialProperties = SAMPLE_PROPERTIES,
}: UsePropertyFiltersProps = {}) {
  // Navigation Params (from Home Screen or deep links)
  const params = useLocalSearchParams<{
    intent?: string;
    transaction?: string;
    type?: string;
    q?: string;
    city?: string;
  }>();

  // Route params key to track changes without useEffect
  const currentParamsKey = `${params.transaction || ''}-${params.intent || ''}-${params.type || ''}-${params.q || ''}-${params.city || ''}`;
  const [prevParamsKey, setPrevParamsKey] = useState(currentParamsKey);

  // Internal Filter & Sort State
  const [filters, setFiltersState] = useState<PropertyFilterState>(() =>
    initFiltersFromParams(params)
  );
  const [sortOption, setSortOption] = useState<PropertySortOption>('newest');

  // Modal Visibility State
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);

  // Synchronize route parameters when navigation parameters change
  if (currentParamsKey !== prevParamsKey) {
    setPrevParamsKey(currentParamsKey);
    setFiltersState((prev) => {
      const next = { ...prev };
      const tx = (params.transaction || params.intent || '').toLowerCase();
      if (['buy', 'rent', 'sell'].includes(tx)) {
        next.transaction = tx as TransactionType;
      }
      if (params.type && ['residential', 'commercial', 'plot'].includes(params.type.toLowerCase())) {
        next.propertyType = params.type.toLowerCase() as PropertyCategoryType;
      }
      if (params.q !== undefined && typeof params.q === 'string') {
        next.searchQuery = params.q;
      }
      if (params.city !== undefined && typeof params.city === 'string') {
        next.city = params.city;
      }
      return next;
    });
  }

  // Set Search Query
  const setSearchQuery = useCallback((query: string) => {
    setFiltersState((prev) => ({
      ...prev,
      searchQuery: query,
    }));
  }, []);

  // Quick Transaction Mode Switcher (e.g. from top tabs)
  const setTransaction = useCallback((transaction: TransactionType | 'all') => {
    setFiltersState((prev) => ({
      ...prev,
      transaction,
    }));
  }, []);

  // Quick Property Type Switcher (e.g. from top tabs)
  const setPropertyType = useCallback((propertyType: PropertyCategoryType | 'all') => {
    setFiltersState((prev) => ({
      ...prev,
      propertyType,
    }));
  }, []);

  // Update a single filter field
  const setFilter = useCallback(
    <K extends keyof PropertyFilterState>(key: K, value: PropertyFilterState[K]) => {
      setFiltersState((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  // Update multiple filters at once (e.g. from Apply in Modal)
  const setFilters = useCallback((newFilters: Partial<PropertyFilterState>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  // Reset all filters to default
  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTER_STATE);
  }, []);

  // Remove a single active filter chip
  const removeFilterChip = useCallback((chip: ActiveFilterChip) => {
    setFiltersState((prev) => {
      const next = { ...prev };
      switch (chip.category) {
        case 'transaction':
          next.transaction = 'all';
          break;
        case 'propertyType':
          next.propertyType = 'all';
          break;
        case 'minPrice':
        case 'maxPrice':
          next.minPrice = null;
          next.maxPrice = null;
          break;
        case 'city':
          next.city = 'all';
          break;
        case 'bedrooms':
          if (chip.value && typeof chip.value === 'string') {
            next.bedrooms = next.bedrooms.filter((b) => b !== chip.value);
          } else {
            next.bedrooms = [];
          }
          break;
        case 'status':
          next.status = 'all';
          break;
        case 'nearMeCoords':
        case 'maxDistanceKm':
          next.nearMeCoords = null;
          next.maxDistanceKm = null;
          break;
        case 'searchQuery':
          next.searchQuery = '';
          break;
      }
      return next;
    });
  }, []);

  // Modal open / close handlers
  const openFilterModal = useCallback(() => setIsFilterModalVisible(true), []);
  const closeFilterModal = useCallback(() => setIsFilterModalVisible(false), []);
  const openSortModal = useCallback(() => setIsSortModalVisible(true), []);
  const closeSortModal = useCallback(() => setIsSortModalVisible(false), []);

  // Filtered and Sorted Property Results (Memoized)
  const filteredProperties = useMemo(() => {
    const filtered = filterProperties(initialProperties, filters);
    return sortProperties(filtered, sortOption);
  }, [initialProperties, filters, sortOption]);

  // Derived counts and active chips
  const activeFilterCount = useMemo(() => getActiveFilterCount(filters), [filters]);
  const activeChips = useMemo(() => getActiveFilterChips(filters), [filters]);

  return {
    properties: filteredProperties,
    totalCount: initialProperties.length,
    filteredCount: filteredProperties.length,
    filters,
    sortOption,
    activeFilterCount,
    activeChips,
    isFilterModalVisible,
    isSortModalVisible,
    setSearchQuery,
    setTransaction,
    setPropertyType,
    setFilter,
    setFilters,
    resetFilters,
    removeFilterChip,
    setSortOption,
    openFilterModal,
    closeFilterModal,
    openSortModal,
    closeSortModal,
  };
}
