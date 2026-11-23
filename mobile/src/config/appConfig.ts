/**
 * MJ Estates Mobile Application Configuration — src/config/appConfig.ts
 * Centralized environment variable resolution, production endpoint bindings,
 * network timeout thresholds, and official brand contact coordinates.
 */

/**
 * Dynamically resolves the API Base URL:
 * 1. Honors EXPO_PUBLIC_API_URL environment variable if provided.
 * 2. In production, defaults strictly to https://api.masterjiestates.in/api.
 * 3. In development, defaults to 10.0.2.2 (Android Emulator host alias) or localhost.
 */
export function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    const trimmed = envUrl.trim();
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }

  if (!__DEV__) {
    return 'https://api.masterjiestates.in/api';
  }

  // Development fallback (10.0.2.2 reaches host workstation from Android emulators)
  return 'http://10.0.2.2:5000/api';
}

export const APP_CONFIG = {
  appName: 'MJ Estates',
  slug: 'mj-estates',
  scheme: 'mjestates',
  version: '1.0.0',
  tagline: 'From Finding Your Property to Building Your Dream',

  // API Base URL & Timeout Thresholds
  api: {
    prodBaseUrl: 'https://api.masterjiestates.in/api',
    devBaseUrl: 'http://10.0.2.2:5000/api',
    timeoutMs: 15000,
    getBaseUrl: getApiBaseUrl,
  },

  // Official MasterJiEstates Contact Channels
  support: {
    phone: '+91 9990316186',
    whatsapp: '+91 7011202089',
    email: 'masterjiestates@gmail.com',
    website: 'https://www.masterjiestates.in',
    hours: 'Mon – Sat: 9:00 AM – 8:00 PM IST',
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
