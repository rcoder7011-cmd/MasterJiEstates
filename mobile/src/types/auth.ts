/**
 * Authentication Type Definitions — src/types/auth.ts
 *
 * Requirements:
 * - Signup: Mobile / Email + Password + OTP Verification.
 * - Login: Mobile Number + Password OR Email + Password (Password ONLY, NO OTP).
 * - Forgot Password: OTP verification to registered contact + password reset.
 */

export type AuthMethod = 'phone' | 'email';

export interface AuthUser {
  id: string;
  name: string;
  fullName?: string;
  phone?: string;
  email?: string;
  role: 'customer' | 'admin' | 'staff' | 'user';
  isFounder?: boolean;
  founderRole?: 'founder' | 'ceo' | null;
  createdAt: string;
  notificationPreferences?: {
    enquiryUpdates?: boolean;
    siteVisitUpdates?: boolean;
    newListingsAlerts?: boolean;
    priceDropAlerts?: boolean;
    whatsappAlerts?: boolean;
  };
}

export interface LoginCredentials {
  identifier: string; // 10-digit Indian Mobile or Email Address
  password: string;
  rememberMe?: boolean;
}

export interface OtpRequestPayload {
  method: AuthMethod;
  destination: string; // Phone number or Email address
  fullName?: string;
  mode?: 'login' | 'signup' | 'any';
  purpose?: 'signup' | 'forgot_password' | 'any';
}

export interface OtpVerificationPayload {
  method: AuthMethod;
  destination: string;
  code: string;
  fullName?: string;
  password?: string;
  mode?: 'login' | 'signup' | 'any';
  purpose?: 'signup' | 'forgot_password' | 'any';
}

export interface ForgotPasswordPayload {
  identifier: string; // Phone or Email
  type: AuthMethod;
}

export interface ResetPasswordPayload {
  identifier: string;
  type: AuthMethod;
  otp: string; // 6-digit recovery OTP
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  message?: string;
  error?: string;
  verified?: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authMethod: AuthMethod | null;
}
