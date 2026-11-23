/**
 * Centralized Authentication Context & Provider — src/context/AuthContext.tsx
 * Manages user state, login lifecycle, secure session restoration,
 * and integrates with authService.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  AuthUser,
  AuthResponse,
  LoginCredentials,
  OtpRequestPayload,
  OtpVerificationPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from '../types/auth';
import {
  loginWithPassword as serviceLoginWithPassword,
  requestOtp as serviceRequestOtp,
  verifyOtp as serviceVerifyOtp,
  requestPasswordReset as serviceRequestPasswordReset,
  resetPassword as serviceResetPassword,
  restoreSession,
  logout as serviceLogout,
} from '../services/authService';
import { onAuthExpired } from '../services/apiClient';
import { analyticsService } from '../services/analyticsService';

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  requestOtp: (payload: OtpRequestPayload) => Promise<AuthResponse>;
  verifyOtp: (payload: OtpVerificationPayload) => Promise<AuthResponse>;
  requestPasswordReset: (payload: ForgotPasswordPayload) => Promise<AuthResponse>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<AuthResponse>;
  updateUser: (updatedUser: AuthUser) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from SecureStore on startup
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const session = await restoreSession();
        if (isMounted && session.user && session.token) {
          setUser(session.user);
          setToken(session.token);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    // Listen for HTTP 401 Unauthorized token expirations
    const unsubscribeExpiry = onAuthExpired(() => {
      if (isMounted) {
        setUser(null);
        setToken(null);
      }
    });

    return () => {
      isMounted = false;
      unsubscribeExpiry();
    };
  }, []);

  // Login with Password (Password only, NO OTP)
  const handleLogin = useCallback(
    async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const response = await serviceLoginWithPassword(credentials);
      if (response.success && response.user && response.token) {
        setUser(response.user);
        setToken(response.token);
        analyticsService.trackUserLoggedIn('password', response.user.role);
      }
      return response;
    },
    []
  );

  // Request OTP (Signup or Forgot Password)
  const handleRequestOtp = useCallback(
    async (payload: OtpRequestPayload): Promise<AuthResponse> => {
      return await serviceRequestOtp(payload);
    },
    []
  );

  // Verify OTP (Completes account creation for Signup)
  const handleVerifyOtp = useCallback(
    async (payload: OtpVerificationPayload): Promise<AuthResponse> => {
      const response = await serviceVerifyOtp(payload);
      if (response.success && response.user && response.token) {
        setUser(response.user);
        setToken(response.token);
        if (payload.mode === 'signup') {
          analyticsService.trackUserSignedUp(payload.method);
        }
        analyticsService.trackUserLoggedIn('otp', response.user.role);
      }
      return response;
    },
    []
  );

  // Request Password Reset
  const handleRequestPasswordReset = useCallback(
    async (payload: ForgotPasswordPayload): Promise<AuthResponse> => {
      return await serviceRequestPasswordReset(payload);
    },
    []
  );

  // Reset Password
  const handleResetPassword = useCallback(
    async (payload: ResetPasswordPayload): Promise<AuthResponse> => {
      return await serviceResetPassword(payload);
    },
    []
  );

  // Update user profile locally
  const handleUpdateUser = useCallback((updatedUser: AuthUser) => {
    setUser(updatedUser);
  }, []);

  // Logout
  const handleLogout = useCallback(async () => {
    analyticsService.trackUserLoggedOut();
    await serviceLogout();
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && token),
      isLoading,
      token,
      login: handleLogin,
      requestOtp: handleRequestOtp,
      verifyOtp: handleVerifyOtp,
      requestPasswordReset: handleRequestPasswordReset,
      resetPassword: handleResetPassword,
      updateUser: handleUpdateUser,
      logout: handleLogout,
    }),
    [
      user,
      token,
      isLoading,
      handleLogin,
      handleRequestOtp,
      handleVerifyOtp,
      handleRequestPasswordReset,
      handleResetPassword,
      handleUpdateUser,
      handleLogout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
