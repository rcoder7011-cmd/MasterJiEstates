/**
 * MapLibre GL JS & OpenFreeMap WebView Component — mobile/src/components/map/MapLibreWebView.tsx
 *
 * Implements:
 * 1. Free MapLibre GL JS vector rendering using OpenFreeMap tiles & styles
 * 2. Single property marker view (Property Details)
 * 3. Multi-marker catalog view with Buy/Rent color indicators (Explore Map View)
 * 4. Interactive Location Picker with draggable pin (Property Upload)
 * 5. Touch pan, pinch-to-zoom, and map navigation controls
 * 6. Mandatory OpenFreeMap, OpenMapTiles & OpenStreetMap attribution
 * 7. Cross-platform compatibility for Android, iOS, and Web
 */

import React, { useRef, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Pressable,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { MAP_CONFIG } from '../../constants/mapConfig';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { PropertyItem } from '../../types/property';

const RNWebView = WebView as any;

export type MapMode = 'view' | 'picker' | 'multi';

export interface MapMarkerData {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  price?: string;
  transaction?: 'buy' | 'rent' | 'sell';
  locality?: string;
}

export interface MapLibreWebViewProps {
  mode?: MapMode;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  markers?: (MapMarkerData | PropertyItem)[];
  styleUrl?: string;
  interactive?: boolean;
  onLocationSelect?: (coords: { latitude: number; longitude: number }) => void;
  onMarkerSelect?: (propertyId: string) => void;
  height?: number | string;
  style?: object;
  showUserLocation?: boolean;
  userCoords?: { latitude: number; longitude: number } | null;
}

export const MapLibreWebView: React.FC<MapLibreWebViewProps> = ({
  mode = 'view',
  latitude = MAP_CONFIG.DEFAULT_CENTER.latitude,
  longitude = MAP_CONFIG.DEFAULT_CENTER.longitude,
  zoom = MAP_CONFIG.DEFAULT_CENTER.zoom,
  markers = [],
  styleUrl = MAP_CONFIG.DEFAULT_STYLE_URL,
  interactive = true,
  onLocationSelect,
  onMarkerSelect,
  height = 240,
  style,
  showUserLocation = false,
  userCoords,
}) => {
  const webViewRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Normalize markers
  const normalizedMarkers: MapMarkerData[] = useMemo(() => {
    if (mode === 'picker') {
      return [
        {
          id: 'selected-pin',
          latitude,
          longitude,
          title: 'Selected Property Location',
        },
      ];
    }

    if (markers.length > 0) {
      return markers
        .filter((m) => typeof m.latitude === 'number' && typeof m.longitude === 'number')
        .map((m, idx) => {
          const item = m as any;
          return {
            id: item.id || `marker-${idx}`,
            latitude: item.latitude,
            longitude: item.longitude,
            title: item.title || 'Property',
            price: item.priceFormatted || (typeof item.price === 'number' ? `₹${item.price.toLocaleString('en-IN')}` : undefined),
            transaction: item.transaction,
            locality: item.locality,
          };
        });
    }

    if (typeof latitude === 'number' && typeof longitude === 'number') {
      return [
        {
          id: 'single-property',
          latitude,
          longitude,
          title: 'Property Location',
        },
      ];
    }

    return [];
  }, [mode, markers, latitude, longitude]);

  // Construct standalone HTML page for MapLibre GL JS
  const htmlContent = useMemo(() => {
    const isPicker = mode === 'picker';
    const markersJson = JSON.stringify(normalizedMarkers);
    const userLocationJson = userCoords ? JSON.stringify(userCoords) : 'null';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>MJ Estates Map</title>
  <link rel="stylesheet" href="${MAP_CONFIG.MAPLIBRE_CSS_URL}" />
  <script src="${MAP_CONFIG.MAPLIBRE_JS_URL}"></script>
  <style>
    html, body, #map {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background: #f4f6f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
    }
    .custom-marker {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .marker-pin {
      width: 28px;
      height: 38px;
      background: #142B4F;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }
    .marker-pin-rent {
      background: #C49A45;
    }
    .marker-pin-picker {
      background: #D9381E;
      width: 32px;
      height: 44px;
    }
    .marker-inner-dot {
      width: 10px;
      height: 10px;
      background: #ffffff;
      border-radius: 50%;
      transform: rotate(45deg);
    }
    .marker-badge {
      background: #ffffff;
      color: #142B4F;
      padding: 2px 6px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      margin-top: -6px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.25);
      white-space: nowrap;
      border: 1px solid #e0e0e0;
    }
    .user-pulse-dot {
      width: 16px;
      height: 16px;
      background: #007AFF;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(0,122,255,0.6);
    }
    .maplibregl-ctrl-attrib {
      font-size: 10px !important;
      background: rgba(255,255,255,0.85) !important;
      padding: 2px 6px !important;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var isPicker = ${isPicker};
    var markersData = ${markersJson};
    var userLocation = ${userLocationJson};

    var map = new maplibregl.Map({
      container: 'map',
      style: '${styleUrl}',
      center: [${longitude}, ${latitude}],
      zoom: ${zoom},
      interactive: ${interactive},
      attributionControl: true
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    function notifyNative(payload) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
    }

    map.on('load', function() {
      notifyNative({ type: 'MAP_LOADED' });

      // Add User Location indicator if active
      if (userLocation && typeof userLocation.latitude === 'number') {
        var userEl = document.createElement('div');
        userEl.className = 'user-pulse-dot';
        new maplibregl.Marker({ element: userEl })
          .setLngLat([userLocation.longitude, userLocation.latitude])
          .addTo(map);
      }

      // Add Markers
      if (isPicker) {
        var pickerEl = document.createElement('div');
        pickerEl.className = 'custom-marker';
        pickerEl.innerHTML = '<div class="marker-pin marker-pin-picker"><div class="marker-inner-dot"></div></div><div class="marker-badge">Drag Pin</div>';

        var pickerMarker = new maplibregl.Marker({
          element: pickerEl,
          draggable: true
        })
          .setLngLat([${longitude}, ${latitude}])
          .addTo(map);

        pickerMarker.on('dragend', function() {
          var lngLat = pickerMarker.getLngLat();
          notifyNative({
            type: 'LOCATION_CHANGED',
            latitude: lngLat.lat,
            longitude: lngLat.lng
          });
        });

        // Click anywhere on map to reposition pin
        map.on('click', function(e) {
          pickerMarker.setLngLat(e.lngLat);
          notifyNative({
            type: 'LOCATION_CHANGED',
            latitude: e.lngLat.lat,
            longitude: e.lngLat.lng
          });
        });
      } else {
        markersData.forEach(function(item) {
          var el = document.createElement('div');
          el.className = 'custom-marker';
          var pinClass = item.transaction === 'rent' ? 'marker-pin-rent' : '';
          var badgeText = item.price ? item.price : item.title;
          el.innerHTML = '<div class="marker-pin ' + pinClass + '"><div class="marker-inner-dot"></div></div>' +
            '<div class="marker-badge">' + badgeText + '</div>';

          var marker = new maplibregl.Marker({ element: el })
            .setLngLat([item.longitude, item.latitude])
            .addTo(map);

          el.addEventListener('click', function() {
            notifyNative({
              type: 'MARKER_CLICK',
              id: item.id
            });
          });
        });
      }
    });

    map.on('error', function(e) {
      notifyNative({ type: 'MAP_ERROR', error: String(e.error || 'Map tile error') });
    });
  </script>
</body>
</html>
    `;
  }, [mode, normalizedMarkers, userCoords, latitude, longitude, zoom, styleUrl, interactive]);

  // Handle messages from WebView
  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MAP_LOADED') {
        setIsLoading(false);
      } else if (data.type === 'LOCATION_CHANGED') {
        if (onLocationSelect) {
          onLocationSelect({
            latitude: data.latitude,
            longitude: data.longitude,
          });
        }
      } else if (data.type === 'MARKER_CLICK') {
        if (onMarkerSelect) {
          onMarkerSelect(data.id);
        }
      } else if (data.type === 'MAP_ERROR') {
        setIsLoading(false);
      }
    } catch {
      // Ignored
    }
  };

  if (hasError) {
    return (
      <View style={[styles.container, { height }, styles.errorContainer, style]}>
        <AppIcon name="MapPin" size="lg" color="textMuted" />
        <AppText variant="bodySmall" color="textSecondary" align="center" style={styles.errorText}>
          Map preview is currently offline or unreachable.
        </AppText>
        <Pressable
          onPress={() => setHasError(false)}
          style={styles.retryBtn}
        >
          <AppText variant="caption" color="secondaryDark" weight="700">
            Retry Map Loading
          </AppText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }, style]}>
      {Platform.OS === 'web' ? (
        // Web Platform direct iframe rendering
        <iframe
          srcDoc={htmlContent}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: radius.md,
          }}
          title="MasterJiEstates OpenFreeMap View"
        />
      ) : (
        // Android / iOS native WebView
        <RNWebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          onMessage={handleMessage}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          style={styles.webView}
          scalesPageToFit={false}
          mixedContentMode="always"
        />
      )}

      {isLoading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText variant="caption" color="textSecondary" style={styles.loadingText}>
            Loading OpenFreeMap...
          </AppText>
        </View>
      )}

      {/* Attribution Badge */}
      <View style={styles.attributionContainer} pointerEvents="none">
        <AppText variant="caption" color="textMuted" style={styles.attributionText}>
          {MAP_CONFIG.ATTRIBUTION}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  loadingText: {
    marginTop: 4,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 8,
  },
  retryBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  attributionContainer: {
    position: 'absolute',
    bottom: 2,
    left: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  attributionText: {
    fontSize: 9,
    lineHeight: 11,
  },
});

