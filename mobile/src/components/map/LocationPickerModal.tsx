/* eslint-disable react-hooks/set-state-in-effect */
/**
 * Property Location Picker Modal — mobile/src/components/map/LocationPickerModal.tsx
 *
 * Implements:
 * 1. Address search bar with 500ms debouncing (Geoapify Autocomplete)
 * 2. Interactive MapLibre GL JS OpenFreeMap with draggable pin and click-to-reposition
 * 3. Reverse geocoding on pin reposition
 * 4. Optional "Use Current Location" button (explicit user request only)
 * 5. Editable address preview fields (Locality, City, State, Pincode, Address)
 * 6. Returns validated latitude, longitude, and structured address
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { AppButton } from '../ui/AppButton';
import { AppInput } from '../ui/AppInput';
import { AppCard } from '../ui/AppCard';
import { AppHeader } from '../ui/AppHeader';
import { AppDivider } from '../ui/AppDivider';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { MapLibreWebView } from './MapLibreWebView';
import {
  searchAddressSuggestions,
  reverseGeocodeCoordinates,
  getCurrentUserLocation,
  validateCoordinates,
  LocationSuggestion,
} from '../../services/locationService';
import { MAP_CONFIG } from '../../constants/mapConfig';

export interface LocationPickerResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  locality: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation?: (result: LocationPickerResult) => void;
  onConfirm?: (result: LocationPickerResult) => void;
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  initialLocality?: string;
  initialCity?: string;
  initialAddress?: string;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  onClose,
  onSelectLocation,
  onConfirm,
  initialLatitude,
  initialLongitude,
  initialLocality = '',
  initialCity = 'Noida',
  initialAddress = '',
}) => {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>(() => ({
    latitude: initialLatitude || MAP_CONFIG.DEFAULT_CENTER.latitude,
    longitude: initialLongitude || MAP_CONFIG.DEFAULT_CENTER.longitude,
  }));

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Editable Form fields
  const [locality, setLocality] = useState(initialLocality);
  const [area, setArea] = useState(initialLocality);
  const [city, setCity] = useState(initialCity);
  const [state, setState] = useState('Uttar Pradesh');
  const [pincode, setPincode] = useState('201310');
  const [formattedAddress, setFormattedAddress] = useState(initialAddress);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync initial state if modal reopens
  useEffect(() => {
    if (visible) {
      if (initialLatitude && initialLongitude) {
        setCoords({ latitude: initialLatitude, longitude: initialLongitude });
      }
      if (initialLocality) setLocality(initialLocality);
      if (initialCity) setCity(initialCity);
      if (initialAddress) setFormattedAddress(initialAddress);
    }
  }, [visible, initialLatitude, initialLongitude, initialLocality, initialCity, initialAddress]);

  // Debounced address search (500ms debounce, min 3 chars)
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = text.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchAddressSuggestions(trimmed, 5);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };


  // Handle map pin drag or click reposition
  const handlePinMoved = async (newCoords: { latitude: number; longitude: number }) => {
    setCoords(newCoords);
    setIsReverseGeocoding(true);
    try {
      const geo = await reverseGeocodeCoordinates(newCoords.latitude, newCoords.longitude);
      if (geo) {
        if (geo.locality) setLocality(geo.locality);
        if (geo.area) setArea(geo.area);
        if (geo.city) setCity(geo.city);
        if (geo.state) setState(geo.state);
        if (geo.pincode) setPincode(geo.pincode);
        if (geo.formattedAddress) setFormattedAddress(geo.formattedAddress);
      }
    } catch {
      // Retain existing fields
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (item: LocationSuggestion) => {
    setSearchQuery('');
    setSuggestions([]);
    setCoords({ latitude: item.latitude, longitude: item.longitude });
    setLocality(item.locality || item.area || locality);
    setArea(item.area || locality);
    setCity(item.city || city);
    setState(item.state || state);
    setPincode(item.pincode || pincode);
    setFormattedAddress(item.formattedAddress || formattedAddress);
  };

  // Handle Current Location button (optional, explicitly selected)
  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const userLoc = await getCurrentUserLocation();
      if (userLoc) {
        await handlePinMoved(userLoc);
      }
    } finally {
      setIsLocating(false);
    }
  };

  const handleConfirm = () => {
    if (!validateCoordinates(coords.latitude, coords.longitude)) {
      return;
    }

    const result: LocationPickerResult = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      formattedAddress: formattedAddress.trim() || `${locality}, ${city}, ${state} ${pincode}`,
      locality: locality.trim(),
      area: area.trim() || locality.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      country: 'India',
    };

    if (onSelectLocation) onSelectLocation(result);
    if (onConfirm) onConfirm(result);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <AppHeader
          title="Select Property Location"
          subtitle="MapLibre & OpenFreeMap GPS System"
          showBack
          onBackPress={onClose}
        />

        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Search Input Box */}
            <View style={styles.searchBlock}>
              <AppInput
                label="Search Address or Locality"
                placeholder="e.g. Sector 152 Noida or DLF Phase 5"
                value={searchQuery}
                onChangeText={handleSearchChange}
                leftIcon={<AppIcon name="Search" size="sm" color="textSecondary" />}
                rightIcon={
                  isSearching ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : searchQuery ? (
                    <Pressable onPress={() => handleSearchChange('')} hitSlop={8}>
                      <AppIcon name="X" size="sm" color="textMuted" />
                    </Pressable>
                  ) : undefined
                }
                helperText="Type at least 3 characters for address suggestions"
              />

              {/* Suggestions List */}
              {suggestions.length > 0 && (
                <AppCard style={styles.suggestionsCard}>
                  {suggestions.map((s, idx) => (
                    <React.Fragment key={s.placeId || `${s.latitude}-${idx}`}>
                      <Pressable
                        onPress={() => handleSelectSuggestion(s)}
                        style={styles.suggestionItem}
                      >
                        <AppIcon name="MapPin" size="xs" color="secondaryDark" />
                        <View style={styles.suggestionTextCol}>
                          <AppText variant="bodySmall" weight="700" color="primary">
                            {s.locality || s.city}
                          </AppText>
                          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                            {s.formattedAddress}
                          </AppText>
                        </View>
                      </Pressable>
                      {idx < suggestions.length - 1 && <AppDivider spacing="xs" />}
                    </React.Fragment>
                  ))}
                </AppCard>
              )}
            </View>

            {/* Quick Actions Row */}
            <View style={styles.actionsRow}>
              <Pressable
                onPress={handleUseCurrentLocation}
                disabled={isLocating}
                style={styles.locationPill}
              >
                {isLocating ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <AppIcon name="Compass" size="xs" color="primary" />
                )}
                <AppText variant="caption" color="primary" weight="700">
                  {isLocating ? 'Detecting Location...' : 'Use My Current Location'}
                </AppText>
              </Pressable>

              <View style={styles.coordsBadge}>
                <AppText variant="caption" color="textSecondary">
                  Pin: {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
                </AppText>
              </View>
            </View>

            {/* Interactive Map */}
            <View style={styles.mapContainer}>
              <MapLibreWebView
                mode="picker"
                latitude={coords.latitude}
                longitude={coords.longitude}
                zoom={14}
                height={260}
                onLocationSelect={handlePinMoved}
              />
              <View style={styles.mapTipBadge}>
                <AppIcon name="Info" size="xs" color="primary" />
                <AppText variant="caption" color="primary" weight="600">
                  Drag pin or tap map to adjust exact spot
                </AppText>
              </View>
            </View>

            {/* Reverse Geocoding Status */}
            {isReverseGeocoding && (
              <View style={styles.geocodingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <AppText variant="caption" color="textSecondary">
                  Resolving address for selected coordinates...
                </AppText>
              </View>
            )}

            {/* Editable Address Details Section */}
            <AppCard style={styles.detailsCard}>
              <AppText variant="h3" color="primary" style={styles.sectionTitle}>
                Property Address Details
              </AppText>

              <AppInput
                label="Full Formatted Address *"
                value={formattedAddress}
                onChangeText={setFormattedAddress}
                placeholder="Street address, building, or landmark"
              />

              <View style={styles.twoCol}>
                <View style={styles.col}>
                  <AppInput
                    label="Locality / Sector *"
                    value={locality}
                    onChangeText={setLocality}
                    placeholder="e.g. Sector 152"
                  />
                </View>
                <View style={styles.col}>
                  <AppInput
                    label="City *"
                    value={city}
                    onChangeText={setCity}
                    placeholder="e.g. Noida"
                  />
                </View>
              </View>

              <View style={styles.twoCol}>
                <View style={styles.col}>
                  <AppInput
                    label="State"
                    value={state}
                    onChangeText={setState}
                    placeholder="Uttar Pradesh"
                  />
                </View>
                <View style={styles.col}>
                  <AppInput
                    label="Pincode"
                    value={pincode}
                    onChangeText={setPincode}
                    keyboardType="number-pad"
                    maxLength={6}
                    placeholder="201310"
                  />
                </View>
              </View>
            </AppCard>

            {/* Confirm Action Button */}
            <AppButton
              title="Confirm Property Location"
              variant="primary"
              size="lg"
              leftIcon={<AppIcon name="Check" size="sm" color="textInverse" />}
              onPress={handleConfirm}
              style={styles.confirmBtn}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  searchBlock: {
    position: 'relative',
    zIndex: 10,
    marginBottom: spacing.xs,
  },
  suggestionsCard: {
    position: 'absolute',
    top: 66,
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 8,
    backgroundColor: colors.surface,
    padding: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    gap: 8,
  },
  suggestionTextCol: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  coordsBadge: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  mapContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  mapTipBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  geocodingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  detailsCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  twoCol: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  col: {
    flex: 1,
  },
  confirmBtn: {
    marginTop: spacing.xs,
  },
});

