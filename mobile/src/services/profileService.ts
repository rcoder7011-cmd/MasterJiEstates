/**
 * Profile Management Service — src/services/profileService.ts
 * Manages customer profile updates, field validation,
 * backend synchronization via /dashboard/profile, and local SecureStore persistence.
 */

import { AuthUser } from '../types/auth';
import { UpdateProfilePayload } from '../types/profile';
import { saveSession, restoreSession, mapBackendUserToAuthUser } from './authService';
import { apiPatch } from './apiClient';

/**
 * Validate customer profile update payload
 */
export function validateProfileUpdate(payload: UpdateProfilePayload): {
  isValid: boolean;
  error?: string;
} {
  const trimmed = payload.name.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Full name cannot be empty.' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Full name must be at least 2 characters long.' };
  }
  return { isValid: true };
}

/**
 * Update authenticated user profile details
 */
export async function updateUserProfile(
  currentUser: AuthUser,
  payload: UpdateProfilePayload
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const validation = validateProfileUpdate(payload);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  const existingSession = await restoreSession();
  const token = existingSession.token || 'mj_auth_token';

  try {
    const response = await apiPatch<any>('/dashboard/profile', {
      fullName: payload.name.trim(),
      phone: payload.phone || currentUser.phone,
    });

    if (response.success && response.data) {
      const updatedUser = mapBackendUserToAuthUser(response.data);
      await saveSession(updatedUser, token);

      return {
        success: true,
        user: updatedUser,
      };
    }

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }
  } catch {
    // If backend offline in dev mode, fallback to local update
  }

  if (__DEV__) {
    const updatedUser: AuthUser = {
      ...currentUser,
      name: payload.name.trim(),
      fullName: payload.name.trim(),
      phone: payload.phone || currentUser.phone,
    };

    await saveSession(updatedUser, token);

    return {
      success: true,
      user: updatedUser,
    };
  }

  return {
    success: false,
    error: 'Unable to update profile. Please verify your connection and try again.',
  };
}
