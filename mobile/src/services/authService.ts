/**
 * Authentication Service — src/services/authService.ts
 *
 * Requirements:
 * 1. Login: Mobile Number + Password OR Email + Password (Password ONLY, NO OTP).
 * 2. Signup: Mobile or Email + Password + OTP Verification.
 *    - Account is created only after successful OTP verification.
 * 3. Forgot Password: OTP verification to registered contact + password reset.
 * 4. Token & user persistence in Expo SecureStore.
 */

import * as SecureStore from 'expo-secure-store';
import {
  AuthUser,
  LoginCredentials,
  OtpRequestPayload,
  OtpVerificationPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  AuthResponse,
} from '../types/auth';
import { apiPost, apiGet } from './apiClient';

const TOKEN_KEY = 'mj_auth_token';
const USER_KEY = 'mj_auth_user';

// Mock OTP for offline development fallback
export const DEV_MOCK_OTP = '123456';

/**
 * Format raw backend user into mobile AuthUser model
 */
export function mapBackendUserToAuthUser(rawUser: any): AuthUser {
  const role = rawUser.role === 'admin' ? 'admin' : 'customer';
  return {
    id: rawUser.id || rawUser._id || `usr-${Date.now().toString(36)}`,
    name: rawUser.fullName || rawUser.name || 'MJ Customer',
    fullName: rawUser.fullName || rawUser.name,
    phone: rawUser.phone,
    email: rawUser.email,
    role,
    isFounder: Boolean(rawUser.isFounder),
    founderRole: rawUser.founderRole || null,
    createdAt: rawUser.createdAt || new Date().toISOString(),
  };
}

/**
 * Save user authentication token and profile to Expo SecureStore
 */
export async function saveSession(user: AuthUser, token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  } catch (err) {
    if (__DEV__) {
      console.warn('[authService] SecureStore write error:', err);
    }
  }
}

/**
 * Restore persisted session on app startup and verify with backend
 */
export async function restoreSession(): Promise<{
  user: AuthUser | null;
  token: string | null;
}> {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const userJson = await SecureStore.getItemAsync(USER_KEY);

    if (token && userJson) {
      const cachedUser = JSON.parse(userJson) as AuthUser;

      // Verify token with backend in background
      try {
        const response = await apiGet<any>('/auth/me');
        if (response.success && response.data) {
          const freshUser = mapBackendUserToAuthUser(response.data);
          await SecureStore.setItemAsync(USER_KEY, JSON.stringify(freshUser));
          return { user: freshUser, token };
        }
      } catch {
        // If backend is temporarily unreachable, rely on valid cached session
      }

      return { user: cachedUser, token };
    }
  } catch {
    // Fallback if read fails
  }

  return { user: null, token: null };
}

/**
 * Clear persisted session from Expo SecureStore on logout
 */
export async function clearSession(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch {
    // Safe fallback
  }
}

/**
 * Login with Password (Password ONLY, NO OTP).
 * Supports Mobile Number + Password OR Email + Password.
 */
export async function loginWithPassword(credentials: LoginCredentials): Promise<AuthResponse> {
  const { identifier, password, rememberMe = true } = credentials;

  try {
    const response = await apiPost<any>('/auth/login', {
      identifier,
      password,
      rememberMe,
    });

    if (response.success && response.data) {
      const { user: rawUser, token } = response.data;
      if (rawUser && token) {
        const authUser = mapBackendUserToAuthUser(rawUser);
        await saveSession(authUser, token);

        return {
          success: true,
          user: authUser,
          token,
          message: 'Signed in successfully',
        };
      }
    }

    // Handle endpoint not found on remote (e.g. pending deploy on live cloud server)
    if (response.statusCode === 404 && String(response.error).includes('Resource not found')) {
      if (__DEV__) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const cleanPhone = identifier.replace(/[\s-]/g, '');
        const isEmail = identifier.includes('@');

        if (password === 'Password123!' || password.length >= 8) {
          const mockUser: AuthUser = {
            id: `usr-dev-${Date.now()}`,
            name: isEmail ? identifier.split('@')[0] : `User +91 ${cleanPhone.slice(-4)}`,
            email: isEmail ? identifier : `${cleanPhone}@masterjiestates.in`,
            phone: !isEmail ? cleanPhone : '9876543210',
            role: 'customer',
            createdAt: new Date().toISOString(),
          };
          const mockToken = `dev-pass-token-${Date.now()}`;
          await saveSession(mockUser, mockToken);
          return {
            success: true,
            user: mockUser,
            token: mockToken,
            message: 'Signed in successfully',
          };
        }

        return {
          success: false,
          error: 'Invalid mobile number/email or password.',
        };
      }

      return {
        success: false,
        error: 'MasterJiEstates authentication service is currently updating. Please try again shortly.',
      };
    }

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }
  } catch {
    // Fallback for development if backend offline
  }

  if (__DEV__) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const cleanPhone = identifier.replace(/[\s-]/g, '');
    const isEmail = identifier.includes('@');

    if (password === 'Password123!' || (password && password.length >= 8)) {
      const mockUser: AuthUser = {
        id: `usr-dev-${Date.now()}`,
        name: isEmail ? identifier.split('@')[0] : `User +91 ${cleanPhone.slice(-4)}`,
        email: isEmail ? identifier : `${cleanPhone}@masterjiestates.in`,
        phone: !isEmail ? cleanPhone : '9876543210',
        role: 'customer',
        createdAt: new Date().toISOString(),
      };
      const mockToken = `dev-pass-token-${Date.now()}`;
      await saveSession(mockUser, mockToken);
      return {
        success: true,
        user: mockUser,
        token: mockToken,
        message: 'Signed in successfully',
      };
    }

    return {
      success: false,
      error: 'Invalid mobile number/email or password.',
    };
  }

  return {
    success: false,
    error: 'Unable to connect to MasterJiEstates server. Please check your internet connection.',
  };
}

/**
 * Request an OTP verification code for Signup or Forgot Password
 */
export async function requestOtp(payload: OtpRequestPayload): Promise<AuthResponse> {
  const { method, destination, fullName, mode = 'any', purpose = 'signup' } = payload;

  try {
    const response = await apiPost<any>('/auth/otp/send', {
      type: method,
      destination,
      fullName,
      mode,
      purpose,
    });

    if (response.success) {
      if (response.data?.devOtp && __DEV__) {
        console.log(`[authService] Dev OTP for ${destination}: ${response.data.devOtp}`);
      }
      return {
        success: true,
        message:
          response.message ||
          (method === 'phone'
            ? `Verification code sent to +91 ${destination}`
            : `Verification code sent to ${destination}`),
      };
    }

    // Handle endpoint not found on remote (e.g. pending deploy on live cloud server)
    if (response.statusCode === 404 && String(response.error).includes('Resource not found')) {
      if (__DEV__) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log(`[authService] Dev fallback OTP for ${destination}: ${DEV_MOCK_OTP}`);
        return {
          success: true,
          message:
            method === 'phone'
              ? `Verification code sent to +91 ${destination}`
              : `Verification code sent to ${destination}`,
        };
      }
      return {
        success: false,
        error: 'MasterJiEstates authentication service is currently updating. Please try again shortly.',
      };
    }

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }
  } catch {
    // Network fallback
  }

  if (__DEV__) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log(`[authService] Dev fallback OTP for ${destination}: ${DEV_MOCK_OTP}`);
    return {
      success: true,
      message:
        method === 'phone'
          ? `Verification code sent to +91 ${destination}`
          : `Verification code sent to ${destination}`,
    };
  }

  return {
    success: false,
    error: 'Unable to connect to MasterJiEstates authentication service. Please check your network connection.',
  };
}

/**
 * Verify OTP code and establish user session with backend.
 * For signup: passes password so account is created only after OTP confirmation.
 */
export async function verifyOtp(payload: OtpVerificationPayload): Promise<AuthResponse> {
  const { method, destination, code, fullName, password, mode = 'any', purpose = 'signup' } = payload;

  try {
    const response = await apiPost<any>('/auth/otp/verify', {
      type: method,
      destination,
      otp: code,
      fullName,
      password,
      mode,
      purpose,
    });

    if (response.success && response.data) {
      const { user: rawUser, token, verified } = response.data;

      if (purpose === 'forgot_password' || verified) {
        return {
          success: true,
          verified: true,
          message: 'Verification code verified successfully',
        };
      }

      if (rawUser && token) {
        const authUser = mapBackendUserToAuthUser(rawUser);
        await saveSession(authUser, token);

        return {
          success: true,
          user: authUser,
          token,
          message: 'Account verified and created successfully',
        };
      }
    }

    // Handle endpoint not found on remote (e.g. pending deploy on live cloud server)
    if (response.statusCode === 404 && String(response.error).includes('Resource not found')) {
      if (__DEV__) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (code !== DEV_MOCK_OTP) {
          return {
            success: false,
            error: 'Invalid verification code. Please check and try again.',
          };
        }

        if (purpose === 'forgot_password') {
          return {
            success: true,
            verified: true,
            message: 'Verification code verified successfully',
          };
        }

        const mockUser: AuthUser = {
          id: `usr-${Date.now().toString(36)}`,
          name: fullName || (method === 'phone' ? `User +91 ${destination.slice(-4)}` : destination.split('@')[0]),
          fullName: fullName,
          phone: method === 'phone' ? destination : undefined,
          email: method === 'email' ? destination : undefined,
          role: 'customer',
          createdAt: new Date().toISOString(),
        };
        const mockToken = `dev-token-${Date.now()}`;
        await saveSession(mockUser, mockToken);
        return {
          success: true,
          user: mockUser,
          token: mockToken,
          message: 'Account verified and created successfully',
        };
      }
      return {
        success: false,
        error: 'MasterJiEstates authentication service is currently updating. Please try again shortly.',
      };
    }

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }
  } catch {
    // Network fallback
  }

  if (__DEV__) {
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (code !== DEV_MOCK_OTP) {
      return {
        success: false,
        error: 'Invalid verification code. Please check and try again.',
      };
    }

    if (purpose === 'forgot_password') {
      return {
        success: true,
        verified: true,
        message: 'Verification code verified successfully',
      };
    }

    const mockUser: AuthUser = {
      id: `usr-${Date.now().toString(36)}`,
      name: fullName || (method === 'phone' ? `User +91 ${destination.slice(-4)}` : destination.split('@')[0]),
      fullName: fullName,
      phone: method === 'phone' ? destination : undefined,
      email: method === 'email' ? destination : undefined,
      role: 'customer',
      createdAt: new Date().toISOString(),
    };

    const mockToken = `dev-token-${Date.now()}`;
    await saveSession(mockUser, mockToken);

    return {
      success: true,
      user: mockUser,
      token: mockToken,
      message: 'Account verified and created successfully',
    };
  }

  return {
    success: false,
    error: 'Unable to verify code with MasterJiEstates server. Please try again.',
  };
}

/**
 * Request password recovery instructions/OTP
 */
export async function requestPasswordReset(payload: ForgotPasswordPayload): Promise<AuthResponse> {
  const { identifier, type } = payload;
  try {
    const response = await apiPost<any>('/auth/forgot-password', {
      identifier,
      type,
    });
    if (response.success) {
      return {
        success: true,
        message: response.message || 'Recovery instructions sent.',
      };
    }
    if (response.error) {
      return { success: false, error: response.error };
    }
  } catch {
    // Dev fallback
  }

  if (__DEV__) {
    console.log(`[authService] Dev recovery code for ${identifier}: ${DEV_MOCK_OTP}`);
    return {
      success: true,
      message: `Recovery code dispatched to ${identifier}.`,
    };
  }

  return {
    success: false,
    error: 'Unable to send recovery code. Please check your connection.',
  };
}

/**
 * Reset password using OTP or reset token
 */
export async function resetPassword(payload: ResetPasswordPayload): Promise<AuthResponse> {
  const { identifier, type, otp, newPassword } = payload;
  try {
    const response = await apiPost<any>('/auth/reset-password', {
      identifier,
      type,
      otp,
      newPassword,
    });
    if (response.success) {
      return {
        success: true,
        message: response.message || 'Password has been reset successfully.',
      };
    }
    if (response.error) {
      return { success: false, error: response.error };
    }
  } catch {
    // Dev fallback
  }

  if (__DEV__) {
    return {
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.',
    };
  }

  return {
    success: false,
    error: 'Unable to reset password. Please try again.',
  };
}

/**
 * Perform logout and session wipe
 */
export async function logout(): Promise<void> {
  try {
    await apiPost('/auth/logout');
  } catch {
    // Ignore network failure on logout
  }
  await clearSession();
}
