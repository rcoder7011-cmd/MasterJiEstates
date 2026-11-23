/**
 * OpenFreeMap & MapLibre GL JS Configuration — mobile/src/constants/mapConfig.ts
 *
 * Official OpenFreeMap public instance: https://openfreemap.org
 * Free vector map tiles & styles with no API key requirement.
 */

export const MAP_CONFIG = {
  // Configurable OpenFreeMap vector styles (liberty, bright, positron)
  DEFAULT_STYLE_URL: 'https://tiles.openfreemap.org/styles/liberty',
  BRIGHT_STYLE_URL: 'https://tiles.openfreemap.org/styles/bright',
  POSITRON_STYLE_URL: 'https://tiles.openfreemap.org/styles/positron',

  // Required attribution for OpenFreeMap, OpenMapTiles & OpenStreetMap
  ATTRIBUTION: '© OpenFreeMap © OpenStreetMap contributors © MapLibre',

  // MasterJiEstates Default Regional Center (Noida / Delhi-NCR)
  DEFAULT_CENTER: {
    latitude: 28.5355,
    longitude: 77.3910,
    zoom: 12,
  },

  // Distance presets in kilometers for "Near Me" filtering
  DISTANCE_PRESETS: [5, 10, 25, 50] as const,

  // MapLibre CDN URLs
  MAPLIBRE_JS_URL: 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js',
  MAPLIBRE_CSS_URL: 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css',
};

export type DistancePresetKm = typeof MAP_CONFIG.DISTANCE_PRESETS[number];

