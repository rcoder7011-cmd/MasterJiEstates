/**
 * MasterJiEstates — Location & Map Service (mobile/src/services/locationService.ts)
 *
 * Provides:
 * 1. Geoapify Autocomplete & Reverse Geocoding via Backend API with local fallback
 * 2. On-demand Foreground GPS location via expo-location
 * 3. Distance calculation using the Haversine formula
 * 4. External Google Maps turn-by-turn directions without proprietary SDK
 * 5. Coordinate validation
 */

import { Linking, Alert } from 'react-native';
import * as Location from 'expo-location';
import { apiGet } from './apiClient';

export interface LocationSuggestion {
  formattedAddress: string;
  locality: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude: number;
  longitude: number;
  placeId?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// In-memory client cache for suggestions
const clientCache = new Map<string, LocationSuggestion[]>();

/**
 * Offline Curated Delhi-NCR Fallback Suggestions when backend is offline or unconfigured
 */
const FALLBACK_NCR_SUGGESTIONS: LocationSuggestion[] = [
  {
    formattedAddress: 'Sector 152, Noida Expressway, Uttar Pradesh 201310',
    locality: 'Sector 152',
    area: 'Noida Expressway',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201310',
    country: 'India',
    latitude: 28.4682,
    longitude: 77.4728,
  },
  {
    formattedAddress: 'Sector 128, Wish Town, Noida Expressway, Uttar Pradesh 201304',
    locality: 'Sector 128',
    area: 'Wish Town',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201304',
    country: 'India',
    latitude: 28.5208,
    longitude: 77.3689,
  },
  {
    formattedAddress: 'Sector 124, Noida Expressway, Uttar Pradesh 201301',
    locality: 'Sector 124',
    area: 'Noida Expressway',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201301',
    country: 'India',
    latitude: 28.5484,
    longitude: 77.3341,
  },
  {
    formattedAddress: 'Sector 43, Central Noida, Uttar Pradesh 201303',
    locality: 'Sector 43',
    area: 'Golf Course',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201303',
    country: 'India',
    latitude: 28.5630,
    longitude: 77.3551,
  },
  {
    formattedAddress: 'Sector 144, Noida Expressway, Uttar Pradesh 201306',
    locality: 'Sector 144',
    area: 'Noida Expressway',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201306',
    country: 'India',
    latitude: 28.4876,
    longitude: 77.4410,
  },
  {
    formattedAddress: 'Sector 78, Central Noida, Uttar Pradesh 201305',
    locality: 'Sector 78',
    area: 'Central Corridor',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201305',
    country: 'India',
    latitude: 28.5710,
    longitude: 77.3870,
  },
  {
    formattedAddress: 'Golf Course Extension Road, Sector 65, Gurugram, Haryana 122018',
    locality: 'Sector 65',
    area: 'Golf Course Ext Rd',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122018',
    country: 'India',
    latitude: 28.4010,
    longitude: 77.0680,
  },
  {
    formattedAddress: 'DLF Phase 5, Golf Course Road, Gurugram, Haryana 122002',
    locality: 'DLF Phase 5',
    area: 'Golf Course Road',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122002',
    country: 'India',
    latitude: 28.4595,
    longitude: 77.0988,
  },
  {
    formattedAddress: 'Jaypee Greens, Greater Noida, Uttar Pradesh 201308',
    locality: 'Jaypee Greens',
    area: 'Pari Chowk Vicinity',
    city: 'Greater Noida',
    state: 'Uttar Pradesh',
    pincode: '201308',
    country: 'India',
    latitude: 28.4744,
    longitude: 77.5040,
  },
  {
    formattedAddress: 'Connaught Place, New Delhi, Delhi 110001',
    locality: 'Connaught Place',
    area: 'Central Delhi',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
    country: 'India',
    latitude: 28.6315,
    longitude: 77.2167,
  },
];

/**
 * Validate coordinates range
 */
export function validateCoordinates(latitude?: number | null, longitude?: number | null): boolean {
  if (typeof latitude !== 'number' || isNaN(latitude)) return false;
  if (typeof longitude !== 'number' || isNaN(longitude)) return false;
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

/**
 * Calculate geographical distance in kilometers using the Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Search address autocomplete with minimum 3 characters
 */
export async function searchAddressSuggestions(
  query: string,
  limit = 5
): Promise<LocationSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const cacheKey = trimmed.toLowerCase();
  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey)!;
  }

  try {
    const response = await apiGet<LocationSuggestion[]>(
      `/location/autocomplete?q=${encodeURIComponent(trimmed)}&limit=${limit}`
    );

    if (response.success && Array.isArray(response.data) && response.data.length > 0) {
      clientCache.set(cacheKey, response.data);
      return response.data;
    }
  } catch {
    // Offline or server unreachable
  }

  // Fallback to local NCR dataset
  const q = trimmed.toLowerCase();
  const matched = FALLBACK_NCR_SUGGESTIONS.filter(
    (item) =>
      item.formattedAddress.toLowerCase().includes(q) ||
      item.locality.toLowerCase().includes(q) ||
      item.city.toLowerCase().includes(q) ||
      item.pincode.includes(q)
  ).slice(0, limit);

  clientCache.set(cacheKey, matched);
  return matched;
}

/**
 * Reverse geocode latitude and longitude to get human-readable address
 */
export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<LocationSuggestion | null> {
  if (!validateCoordinates(latitude, longitude)) {
    return null;
  }

  try {
    const response = await apiGet<LocationSuggestion>(
      `/location/reverse?lat=${latitude}&lon=${longitude}`
    );

    if (response.success && response.data) {
      return response.data;
    }
  } catch {
    // Fallback
  }

  // Local fallback: nearest known NCR locality
  let nearest = FALLBACK_NCR_SUGGESTIONS[0];
  let minD = Infinity;

  for (const s of FALLBACK_NCR_SUGGESTIONS) {
    const dist = calculateDistanceKm(latitude, longitude, s.latitude, s.longitude);
    if (dist < minD) {
      minD = dist;
      nearest = s;
    }
  }

  return {
    ...nearest,
    latitude,
    longitude,
  };
}

/**
 * On-demand device current location acquisition
 * Strict requirement: ONLY requested when user explicitly taps "Near Me" or "Use Current Location"
 */
export async function getCurrentUserLocation(): Promise<Coordinates | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Location Permission Needed',
        'MJ Estates uses your location only to find nearby verified properties and calculate distance. You can still search for any locality manually without sharing your location.',
        [{ text: 'OK' }]
      );
      return null;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    Alert.alert(
      'Location Unavailable',
      'Unable to detect your current location. Please ensure location services / GPS are enabled on your device.',
      [{ text: 'OK' }]
    );
    return null;
  }
}

/**
 * Open Google Maps turn-by-turn directions using official universal URL
 * Pattern: https://www.google.com/maps/dir/?api=1&destination=LATITUDE,LONGITUDE
 * No Google Maps API key or SDK required!
 */
export async function openGoogleMapsDirections(
  latitude: number,
  longitude: number,
  label?: string
): Promise<void> {
  if (!validateCoordinates(latitude, longitude)) {
    Alert.alert('Directions Unavailable', 'Accurate coordinates are not available for this listing.');
    return;
  }

  const encodedLabel = label ? ` (${encodeURIComponent(label)})` : '';
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}${encodedLabel}`;
  try {
    const supported = await Linking.canOpenURL(directionsUrl);
    if (supported) {
      await Linking.openURL(directionsUrl);
    } else {
      await Linking.openURL(`https://maps.google.com/?q=${latitude},${longitude}`);
    }
  } catch {
    Alert.alert('Navigation Error', 'Unable to launch Google Maps application.');
  }
}

