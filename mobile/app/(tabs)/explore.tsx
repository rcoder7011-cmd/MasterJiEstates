/**
 * Explore Properties Screen — app/(tabs)/explore.tsx
 * Main discovery feed with real-time local search, multi-criteria filtering,
 * transaction & asset class category selectors, sorting, interactive OpenFreeMap
 * Map View, Near Me GPS distance filtering, and responsive empty states.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  AppHeader,
  AppText,
  AppIcon,
  PropertyCard,
  PropertySearchBar,
  PropertyFilterModal,
  PropertySortModal,
  ActiveFilterChips,
  PropertyEmptyState,
  MapLibreWebView,
  AppButton,
  FloatingCompareBar,
} from '../../src/components';
import { colors } from '../../src/theme/colors';
import { spacing, layout } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { usePropertyFilters } from '../../src/hooks/usePropertyFilters';
import {
  TRANSACTION_FILTER_OPTIONS,
  PROPERTY_TYPE_FILTER_OPTIONS,
  SORT_OPTIONS,
} from '../../src/constants/propertyFilters';
import { SAMPLE_PROPERTIES } from '../../src/constants/sampleProperties';
import { propertyService, savedSearchService, analyticsService } from '../../src/services';
import { PropertyItem } from '../../src/types/property';
import { useAuth } from '../../src/hooks/useAuth';
import { useTranslation } from '../../src/hooks/useTranslation';
import {
  searchAddressSuggestions,
  getCurrentUserLocation,
  calculateDistanceKm,
  LocationSuggestion,
} from '../../src/services/locationService';
import { MAP_CONFIG } from '../../src/constants/mapConfig';
import { formatIndianCurrency } from '../../src/utils/formatting';

export default function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string>>();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  // Catalog State
  const [catalog, setCatalog] = useState<PropertyItem[]>(() =>
    __DEV__ ? SAMPLE_PROPERTIES : []
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Save Search Modal State
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [saveSearchAlerts, setSaveSearchAlerts] = useState(true);
  const [isSavingSearch, setIsSavingSearch] = useState(false);

  // View Mode: List vs Map
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Selected Property for Map Preview Card
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Near Me GPS State
  const [isLocating, setIsLocating] = useState(false);

  // Address Suggestions Autocomplete State
  const [addressSuggestions, setAddressSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load Properties from backend or fallback to realistic samples
  useEffect(() => {
    let isMounted = true;
    async function initCatalog() {
      try {
        const items = await propertyService.fetchProperties();
        if (isMounted) {
          setCatalog(items);
          setLoadError(null);
        }
      } catch {
        if (isMounted) {
          setLoadError('Unable to connect to property service.');
        }
      }
    }
    initCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const items = await propertyService.fetchProperties();
      setCatalog(items);
      setLoadError(null);
    } catch {
      setLoadError('Unable to refresh property catalog.');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const {
    properties,
    totalCount,
    filteredCount,
    filters,
    sortOption,
    activeFilterCount,
    activeChips,
    isFilterModalVisible,
    isSortModalVisible,
    setSearchQuery,
    setTransaction,
    setPropertyType,
    setFilters,
    resetFilters,
    removeFilterChip,
    setSortOption,
    openFilterModal,
    closeFilterModal,
    openSortModal,
    closeSortModal,
  } = usePropertyFilters({ initialProperties: catalog });

  // Sync route search params when redirected from Saved Searches or Home
  const appliedParamsRef = useRef<string>('');
  useEffect(() => {
    if (params && Object.keys(params).length > 0) {
      const paramStr = JSON.stringify(params);
      if (paramStr !== appliedParamsRef.current) {
        appliedParamsRef.current = paramStr;
        const newFilters: Record<string, any> = {};
        if (params.transaction) newFilters.transaction = params.transaction;
        if (params.propertyType) newFilters.propertyType = params.propertyType;
        if (params.searchQuery) newFilters.searchQuery = params.searchQuery;
        if (params.city) newFilters.city = params.city;
        if (params.locality) newFilters.locality = params.locality;
        if (params.minPrice) newFilters.minPrice = Number(params.minPrice) || null;
        if (params.maxPrice) newFilters.maxPrice = Number(params.maxPrice) || null;
        if (params.bedrooms) newFilters.bedrooms = Number(params.bedrooms) || null;
        setFilters(newFilters);
      }
    }
  }, [params, setFilters]);

  // Open Save Search Modal
  const handleOpenSaveSearchModal = () => {
    if (!isAuthenticated) {
      Alert.alert(
        t('savedSearches.saveCurrentSearch', 'Save This Search'),
        t(
          'auth.guestSubtitle',
          'Sign in to save properties, receive alerts, and track your enquiries.'
        ),
        [
          { text: t('common.cancel', 'Cancel'), style: 'cancel' },
          {
            text: t('auth.signIn', 'Sign In'),
            onPress: () => router.push('/auth/login'),
          },
        ]
      );
      return;
    }

    const nameParts = [
      filters.transaction && filters.transaction !== 'all'
        ? filters.transaction.toUpperCase()
        : '',
      filters.bedrooms ? `${filters.bedrooms} BHK` : '',
      filters.propertyType && filters.propertyType !== 'all'
        ? filters.propertyType
        : '',
      filters.city || filters.locality || filters.searchQuery || 'Delhi NCR',
    ].filter(Boolean);

    setSaveSearchName(nameParts.join(' ') || 'Custom Search');
    setSaveSearchAlerts(true);
    setIsSaveModalVisible(true);
  };

  // Confirm and save search criteria to backend
  const handleConfirmSaveSearch = async () => {
    if (!saveSearchName.trim()) {
      Alert.alert('Required', 'Please enter a name for your saved search.');
      return;
    }
    setIsSavingSearch(true);
    try {
      const res = await savedSearchService.createSavedSearch({
        name: saveSearchName.trim(),
        filters: {
          transaction: filters.transaction,
          propertyType: filters.propertyType,
          city: filters.city || undefined,
          locality: filters.locality || undefined,
          minPrice: filters.minPrice || undefined,
          maxPrice: filters.maxPrice || undefined,
          bedrooms: filters.bedrooms || undefined,
          searchQuery: filters.searchQuery || undefined,
        },
        alertsEnabled: saveSearchAlerts,
      });

      setIsSavingSearch(false);
      setIsSaveModalVisible(false);

      if (res.success) {
        Alert.alert(
          t('savedSearches.saveSuccess', 'Search Saved Successfully'),
          t(
            'savedSearches.saveSuccessDesc',
            'You will receive notifications whenever a new property matching these criteria is published.'
          ),
          [
            { text: t('common.close', 'Close') },
            {
              text: t('savedSearches.title', 'Saved Searches'),
              onPress: () => router.push('/property/saved-searches'),
            },
          ]
        );
      } else {
        Alert.alert('Error', res.error || 'Failed to save search.');
      }
    } catch {
      setIsSavingSearch(false);
      Alert.alert('Error', 'Unable to connect to saved search service.');
    }
  };

  // Handle Search Input with Debounced Geoapify Address Autocomplete
  const handleSearchTextChange = (text: string) => {
    setSearchQuery(text);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (text.trim().length >= 3) {
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const suggestions = await searchAddressSuggestions(text.trim(), 4);
          setAddressSuggestions(suggestions);
          setShowSuggestions(suggestions.length > 0);
        } catch {
          setShowSuggestions(false);
        }
      }, 450);
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    setSearchQuery(suggestion.locality || suggestion.area || suggestion.city);
    if (suggestion.city) {
      setFilters({ city: suggestion.city });
    }
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  // Near Me GPS Handler (On-demand foreground only, never forced at launch)
  const handleToggleNearMe = async () => {
    if (filters.nearMeCoords) {
      // Turn off Near Me
      setFilters({
        nearMeCoords: null,
        maxDistanceKm: null,
      });
      return;
    }

    setIsLocating(true);
    try {
      const userLoc = await getCurrentUserLocation();
      if (!userLoc) {
        Alert.alert(
          'Location Access',
          'Could not retrieve your current GPS coordinates. You can search any city, sector or pincode manually.',
          [{ text: 'OK' }]
        );
        return;
      }

      const coords = { latitude: userLoc.latitude, longitude: userLoc.longitude };

      // Calculate distances for all catalog properties from current GPS location
      setCatalog((prev) =>
        prev.map((prop) => {
          if (
            typeof prop.latitude === 'number' &&
            !isNaN(prop.latitude) &&
            typeof prop.longitude === 'number' &&
            !isNaN(prop.longitude)
          ) {
            const dist = calculateDistanceKm(
              coords.latitude,
              coords.longitude,
              prop.latitude,
              prop.longitude
            );
            return { ...prop, distanceKm: dist };
          }
          return prop;
        })
      );

      setFilters({
        nearMeCoords: coords,
        maxDistanceKm: 25, // Default 25 km radius
      });
      setSortOption('distance');
    } catch {
      Alert.alert(
        'Location Access Notice',
        'Location permission is optional. You can explore all property listings manually without GPS.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLocating(false);
    }
  };

  // Find Selected Property for Preview Card
  const selectedProperty = selectedPropertyId
    ? properties.find((p) => p.id === selectedPropertyId) ||
      catalog.find((p) => p.id === selectedPropertyId)
    : null;

  const activeSortLabel =
    SORT_OPTIONS.find((s) => s.id === sortOption)?.label ||
    (sortOption === 'distance' ? 'Nearest First' : 'Newest First');

  const isNearMeActive = Boolean(filters.nearMeCoords);

  // Performance: Memoized FlatList card renderer to prevent child re-renders
  const renderPropertyCard = useCallback(
    ({ item }: { item: PropertyItem }) => <PropertyCard property={item} />,
    []
  );

  // Analytics: Track search queries (debounced)
  useEffect(() => {
    if (filters.searchQuery.trim().length >= 3) {
      const timer = setTimeout(() => {
        analyticsService.trackPropertySearched(filters.searchQuery, filteredCount);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [filters.searchQuery, filteredCount]);

  // Analytics: Track filter updates
  useEffect(() => {
    if (activeFilterCount > 0) {
      analyticsService.trackFiltersApplied({
        transaction: filters.transaction,
        propertyType: filters.propertyType,
        hasNearMe: isNearMeActive,
        hasPriceRange: Boolean(filters.minPrice || filters.maxPrice),
        activeCount: activeFilterCount,
      });
    }
  }, [
    activeFilterCount,
    filters.transaction,
    filters.propertyType,
    isNearMeActive,
    filters.minPrice,
    filters.maxPrice,
  ]);

  // Render Header Controls (Search, Filters, Distance Presets, Mode Switcher)
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Search Bar with Filter & Sort Triggers */}
      <View style={styles.searchWrapper}>
        <PropertySearchBar
          value={filters.searchQuery}
          onChangeText={handleSearchTextChange}
          onFilterPress={openFilterModal}
          onSortPress={openSortModal}
          activeFilterCount={activeFilterCount}
          placeholder="Search by sector, city, title..."
        />

        {/* Address Autocomplete Suggestions Dropdown */}
        {showSuggestions && addressSuggestions.length > 0 && (
          <View style={styles.suggestionsDropdown}>
            {addressSuggestions.map((item, index) => (
              <Pressable
                key={`${item.latitude}-${item.longitude}-${index}`}
                onPress={() => handleSelectSuggestion(item)}
                style={({ pressed }) => [
                  styles.suggestionRow,
                  pressed ? styles.suggestionRowPressed : null,
                  index < addressSuggestions.length - 1 ? styles.suggestionDivider : null,
                ]}
              >
                <AppIcon name="MapPin" size="xs" color="primary" />
                <View style={styles.suggestionTextCol}>
                  <AppText variant="bodySmall" color="textPrimary" weight="600" numberOfLines={1}>
                    {item.locality || item.city}
                  </AppText>
                  <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                    {item.formattedAddress}
                  </AppText>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Near Me & Mode Switcher Bar */}
      <View style={styles.utilityBar}>
        {/* Near Me GPS Button */}
        <Pressable
          onPress={handleToggleNearMe}
          disabled={isLocating}
          accessible
          accessibilityRole="button"
          accessibilityLabel={isNearMeActive ? 'Near Me active. Tap to turn off.' : 'Find properties near my current location'}
          style={({ pressed }) => [
            styles.nearMeBtn,
            isNearMeActive ? styles.nearMeBtnActive : null,
            pressed ? styles.btnPressed : null,
          ]}
        >
          {isLocating ? (
            <ActivityIndicator size="small" color={isNearMeActive ? colors.textInverse : colors.primary} />
          ) : (
            <AppIcon
              name="Compass"
              size="xs"
              color={isNearMeActive ? 'textInverse' : 'primary'}
            />
          )}
          <AppText
            variant="caption"
            color={isNearMeActive ? 'textInverse' : 'primary'}
            weight="700"
          >
            {isNearMeActive ? 'Near Me (Active)' : 'Near Me'}
          </AppText>
        </Pressable>

        {/* View Mode Toggle: List vs Map */}
        <View style={styles.viewToggleGroup}>
          <Pressable
            onPress={() => setViewMode('list')}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Switch to List View"
            style={[
              styles.viewToggleBtn,
              viewMode === 'list' ? styles.viewToggleBtnActive : null,
            ]}
          >
            <AppIcon
              name="Layers"
              size="xs"
              color={viewMode === 'list' ? 'textInverse' : 'textSecondary'}
            />
            <AppText
              variant="caption"
              color={viewMode === 'list' ? 'textInverse' : 'textSecondary'}
              weight={viewMode === 'list' ? '700' : '600'}
            >
              List
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => setViewMode('map')}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Switch to Map View"
            style={[
              styles.viewToggleBtn,
              viewMode === 'map' ? styles.viewToggleBtnActive : null,
            ]}
          >
            <AppIcon
              name="MapPin"
              size="xs"
              color={viewMode === 'map' ? 'textInverse' : 'textSecondary'}
            />
            <AppText
              variant="caption"
              color={viewMode === 'map' ? 'textInverse' : 'textSecondary'}
              weight={viewMode === 'map' ? '700' : '600'}
            >
              Map
            </AppText>
          </Pressable>
        </View>
      </View>

      {/* Near Me Distance Presets (Visible only when Near Me is active) */}
      {isNearMeActive && (
        <View style={styles.distancePresetsRow}>
          <AppText variant="caption" color="textSecondary" weight="600" style={styles.radiusLabel}>
            Radius:
          </AppText>
          {MAP_CONFIG.DISTANCE_PRESETS.map((km) => {
            const isSelected = filters.maxDistanceKm === km;
            return (
              <Pressable
                key={km}
                onPress={() => setFilters({ maxDistanceKm: km })}
                style={[
                  styles.distanceChip,
                  isSelected ? styles.distanceChipActive : null,
                ]}
              >
                <AppText
                  variant="caption"
                  color={isSelected ? 'textInverse' : 'primary'}
                  weight={isSelected ? '700' : '600'}
                >
                  {km} km
                </AppText>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => setFilters({ maxDistanceKm: null })}
            style={[
              styles.distanceChip,
              filters.maxDistanceKm === null ? styles.distanceChipActive : null,
            ]}
          >
            <AppText
              variant="caption"
              color={filters.maxDistanceKm === null ? 'textInverse' : 'primary'}
              weight={filters.maxDistanceKm === null ? '700' : '600'}
            >
              All
            </AppText>
          </Pressable>
        </View>
      )}

      {/* Transaction Mode Selector Pills (Buy / Rent / Sell) */}
      <View style={styles.selectorSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={TRANSACTION_FILTER_OPTIONS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.horizontalSelectorContent}
          renderItem={({ item }) => {
            const isSelected = filters.transaction === item.id;
            return (
              <Pressable
                onPress={() => setTransaction(item.id)}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Filter by transaction ${item.label}`}
                style={({ pressed }) => [
                  styles.pill,
                  isSelected ? styles.pillSelected : null,
                  pressed ? styles.pillPressed : null,
                ]}
              >
                <AppText
                  variant="caption"
                  color={isSelected ? 'textInverse' : 'textPrimary'}
                  weight={isSelected ? '700' : '500'}
                >
                  {item.label}
                </AppText>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Property Type Selector Pills (Residential / Commercial / Plot) */}
      <View style={styles.selectorSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={PROPERTY_TYPE_FILTER_OPTIONS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.horizontalSelectorContent}
          renderItem={({ item }) => {
            const isSelected = filters.propertyType === item.id;
            return (
              <Pressable
                onPress={() => setPropertyType(item.id)}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Filter by property type ${item.label}`}
                style={({ pressed }) => [
                  styles.subPill,
                  isSelected ? styles.subPillSelected : null,
                  pressed ? styles.pillPressed : null,
                ]}
              >
                <AppText
                  variant="caption"
                  color={isSelected ? 'primary' : 'textSecondary'}
                  weight={isSelected ? '700' : '500'}
                >
                  {item.label}
                </AppText>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Active Filter Chips with Quick Dismissal */}
      <ActiveFilterChips
        chips={activeChips}
        onRemoveChip={removeFilterChip}
        onClearAll={resetFilters}
      />

      {/* Results Count & Actions (Save Search + Sort) */}
      <View style={styles.metaRow}>
        <AppText variant="caption" color="textSecondary" weight="600">
          Showing {filteredCount} of {totalCount} Properties
        </AppText>

        <View style={styles.metaActionsGroup}>
          <Pressable
            onPress={handleOpenSaveSearchModal}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Save search criteria and enable alerts"
            style={({ pressed }) => [
              styles.saveSearchButton,
              pressed ? styles.btnPressed : null,
            ]}
          >
            <AppIcon name="Bookmark" size="xs" color="secondaryDark" />
            <AppText variant="caption" color="secondaryDark" weight="700">
              Save
            </AppText>
          </Pressable>

          <Pressable
            onPress={openSortModal}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Sorted by ${activeSortLabel}. Tap to change.`}
            style={styles.sortIndicator}
          >
            <AppText variant="caption" color="primary" weight="600">
              {activeSortLabel}
            </AppText>
            <AppIcon name="ChevronDown" size="xs" color="primary" />
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Screen Title Bar */}
      <AppHeader
        title="Explore Properties"
        subtitle="Search, Filter & Discover"
      />

      {viewMode === 'list' ? (
        /* List View (Virtualized FlatList with performance tuning) */
        <FlatList<PropertyItem>
          data={properties}
          keyExtractor={(item) => item.id}
          renderItem={renderPropertyCard}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <PropertyEmptyState
              onResetFilters={resetFilters}
              hasActiveFilters={activeFilterCount > 0 || filters.searchQuery.length > 0}
              isError={Boolean(loadError && properties.length === 0)}
              errorMessage={loadError || undefined}
              onRetry={handleRefresh}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews={Platform.OS === 'android'}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.secondary]}
              tintColor={colors.secondary}
            />
          }
        />
      ) : (
        /* Map View (MapLibre GL JS + OpenFreeMap interactive vectors) */
        <View style={styles.mapContainer}>
          {renderHeader()}

          <View style={styles.mapCanvasWrapper}>
            <MapLibreWebView
              mode="multi"
              markers={properties}
              height="100%"
              showUserLocation={isNearMeActive}
              userCoords={filters.nearMeCoords}
              onMarkerSelect={(id) => setSelectedPropertyId(id)}
              interactive
            />

            {/* Floating Property Preview Card when a map marker is clicked */}
            {selectedProperty && (
              <View style={styles.floatingPreviewCard}>
                <Pressable
                  onPress={() => setSelectedPropertyId(null)}
                  style={styles.previewCloseBtn}
                  hitSlop={8}
                  accessible
                  accessibilityLabel="Close property preview"
                >
                  <AppIcon name="X" size="xs" color="textMuted" />
                </Pressable>

                <View style={styles.previewContentRow}>
                  {selectedProperty.images && selectedProperty.images[0] ? (
                    <Image
                      source={{ uri: selectedProperty.images[0] }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                  ) : null}

                  <View style={styles.previewDetailsCol}>
                    <View style={styles.previewBadgeRow}>
                      <View style={styles.previewTxBadge}>
                        <AppText variant="caption" color="textInverse" weight="700">
                          {selectedProperty.transaction.toUpperCase()}
                        </AppText>
                      </View>
                      {typeof selectedProperty.distanceKm === 'number' && (
                        <View style={styles.previewDistanceBadge}>
                          <AppText variant="caption" color="primary" weight="700">
                            {selectedProperty.distanceKm} km away
                          </AppText>
                        </View>
                      )}
                    </View>

                    <AppText variant="bodySmall" color="textPrimary" weight="700" numberOfLines={1}>
                      {selectedProperty.title}
                    </AppText>

                    <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                      {selectedProperty.locality}, {selectedProperty.city}
                    </AppText>

                    <AppText variant="body" color="primary" weight="800">
                      {formatIndianCurrency(selectedProperty.price)}
                      {selectedProperty.transaction === 'rent' ? ' / mo' : ''}
                    </AppText>
                  </View>
                </View>

                <AppButton
                  title="View Complete Details"
                  variant="primary"
                  size="sm"
                  onPress={() =>
                    router.push({
                      pathname: '/property/[id]',
                      params: { id: selectedProperty.id },
                    })
                  }
                  style={styles.previewActionBtn}
                />
              </View>
            )}
          </View>
        </View>
      )}

      {/* Comprehensive Filter Modal */}
      <PropertyFilterModal
        visible={isFilterModalVisible}
        filters={filters}
        properties={catalog}
        onApply={(newFilters) => setFilters(newFilters)}
        onClose={closeFilterModal}
        onReset={resetFilters}
      />

      {/* Quick Sort Modal */}
      <PropertySortModal
        visible={isSortModalVisible}
        selectedSort={sortOption}
        onSelectSort={(option) => setSortOption(option)}
        onClose={closeSortModal}
      />

      {/* Save Search Modal */}
      <Modal
        visible={isSaveModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSaveModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleCol}>
                <AppText variant="h3" color="primary">
                  {t('savedSearches.saveCurrentSearch', 'Save This Search')}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  {t(
                    'savedSearches.saveSearchDesc',
                    'Get notified when new matching properties are posted.'
                  )}
                </AppText>
              </View>
              <Pressable
                onPress={() => setIsSaveModalVisible(false)}
                hitSlop={8}
                style={styles.modalCloseBtn}
                accessible
                accessibilityLabel="Close save search dialog"
              >
                <AppIcon name="X" size="sm" color="textMuted" />
              </Pressable>
            </View>

            {/* Criteria Preview Badges */}
            <View style={styles.criteriaBadgesWrap}>
              <View style={styles.badgePill}>
                <AppText variant="caption" color="textSecondary">
                  Type:{' '}
                  <AppText variant="caption" color="primary" weight="700">
                    {filters.transaction.toUpperCase()}
                  </AppText>
                </AppText>
              </View>
              {filters.propertyType !== 'all' && (
                <View style={styles.badgePill}>
                  <AppText variant="caption" color="textSecondary">
                    Category:{' '}
                    <AppText variant="caption" color="primary" weight="700">
                      {filters.propertyType}
                    </AppText>
                  </AppText>
                </View>
              )}
              {filters.city || filters.locality || filters.searchQuery ? (
                <View style={styles.badgePill}>
                  <AppText variant="caption" color="textSecondary">
                    Area:{' '}
                    <AppText variant="caption" color="primary" weight="700">
                      {filters.city || filters.locality || filters.searchQuery}
                    </AppText>
                  </AppText>
                </View>
              ) : null}
            </View>

            {/* Name Input */}
            <AppText
              variant="bodySmall"
              color="textPrimary"
              weight="600"
              style={styles.inputLabel}
            >
              Search Name
            </AppText>
            <TextInput
              value={saveSearchName}
              onChangeText={setSaveSearchName}
              placeholder={t(
                'savedSearches.searchNamePlaceholder',
                'e.g. 2 BHK in Indirapuram'
              )}
              placeholderTextColor={colors.textMuted}
              style={styles.nameTextInput}
              maxLength={60}
            />

            {/* Notification Toggle */}
            <View style={styles.alertToggleRow}>
              <View style={styles.toggleInfoCol}>
                <AppText variant="bodySmall" color="primary" weight="600">
                  Enable Property Alerts
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  Receive notifications when matching homes are listed
                </AppText>
              </View>
              <Switch
                value={saveSearchAlerts}
                onValueChange={setSaveSearchAlerts}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />
            </View>

            {/* Actions */}
            <View style={styles.modalActionsRow}>
              <AppButton
                title={t('common.cancel', 'Cancel')}
                variant="outline"
                size="md"
                onPress={() => setIsSaveModalVisible(false)}
                style={styles.modalBtnHalf}
              />
              <AppButton
                title={
                  isSavingSearch
                    ? 'Saving...'
                    : t('common.save', 'Save Search')
                }
                variant="primary"
                size="md"
                loading={isSavingSearch}
                onPress={handleConfirmSaveSearch}
                style={styles.modalBtnHalf}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Comparison Tray */}
      <FloatingCompareBar bottomOffset={16} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.sm,
    paddingBottom: spacing.huge + spacing.xl,
  },
  headerContainer: {
    marginBottom: spacing.xs,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  searchWrapper: {
    position: 'relative',
    zIndex: 10,
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 100,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  suggestionRowPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  suggestionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  suggestionTextCol: {
    flex: 1,
  },
  utilityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
    gap: spacing.sm,
  },
  nearMeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  nearMeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  viewToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  viewToggleBtnActive: {
    backgroundColor: colors.primary,
  },
  distancePresetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.xxs,
    marginBottom: spacing.xs,
  },
  radiusLabel: {
    marginRight: 2,
  },
  distanceChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    backgroundColor: colors.surface,
  },
  distanceChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectorSection: {
    marginBottom: spacing.xs,
  },
  horizontalSelectorContent: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: 2,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  subPill: {
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  subPillSelected: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primaryLight,
  },
  pillPressed: {
    opacity: 0.8,
  },
  btnPressed: {
    opacity: 0.7,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  metaActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  saveSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.secondarySubtle,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  sortIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  modalTitleCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  modalCloseBtn: {
    padding: 4,
  },
  criteriaBadgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  badgePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
  inputLabel: {
    marginBottom: 6,
  },
  nameTextInput: {
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  alertToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
  },
  toggleInfoCol: {
    flex: 1,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalBtnHalf: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  mapCanvasWrapper: {
    flex: 1,
    position: 'relative',
    marginBottom: spacing.huge, // Tab bar avoidance
  },
  floatingPreviewCard: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  previewCloseBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  previewContentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
  },
  previewDetailsCol: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 2,
  },
  previewBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewTxBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  previewDistanceBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  previewActionBtn: {
    marginTop: 4,
  },
});
