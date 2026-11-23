/**
 * Application Route Paths
 * Type-safe route identifiers for Expo Router
 */

export const ROUTES = {
  // Root & Tabs
  ROOT: '/',
  TABS: '/(tabs)',
  HOME: '/(tabs)',
  EXPLORE: '/(tabs)/explore',
  SAVED: '/(tabs)/saved',
  PROFILE: '/(tabs)/profile',

  // Property Flow
  PROPERTY_DETAILS: (id: string = ':id') => `/property/${id}` as const,

  // Auth Flow
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  VERIFY_OTP: '/auth/verify-otp',
  VERIFY_EMAIL_OTP: '/auth/verify-email-otp',
  FORGOT_PASSWORD: '/auth/forgot-password',

  // Customer Profile Flow
  EDIT_PROFILE: '/profile/edit',
  LANGUAGE_SETTINGS: '/profile/language',
  MY_ENQUIRIES: '/profile/enquiries',
  APP_PREFERENCES: '/profile/preferences',
  ABOUT: '/profile/about',

  // Admin Portal (Role Protected)
  ADMIN_DASHBOARD: '/admin',
  ADMIN_PROPERTIES: '/admin/properties',
  ADMIN_ADD_PROPERTY: '/admin/add-property',
  ADMIN_EDIT_PROPERTY: (id: string = ':id') => `/admin/edit-property/${id}` as const,

  // Development Only
  DEV_SHOWCASE: '/dev-showcase',
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];
