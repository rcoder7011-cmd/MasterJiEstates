/**
 * User Profile Types — src/types/profile.ts
 */

export interface UserProfile {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  preferredLanguage: 'en' | 'hi' | 'hinglish';
  notificationsEnabled: boolean;
  savedPropertyIds: string[];
  createdAt: string;
}

export interface UpdateProfilePayload {
  name: string;
  avatarUrl?: string;
  phone?: string;
  email?: string;
}

export interface UserPreferences {
  language: 'en' | 'hi' | 'hinglish';
  priceDropAlerts: boolean;
  newListingsAlerts: boolean;
  whatsappUpdates: boolean;
}

