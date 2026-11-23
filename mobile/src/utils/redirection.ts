/**
 * Smart Redirection & Navigation Utilities — src/utils/redirection.ts
 *
 * Ensures:
 * 1. Safe local route preservation across Login, Signup, and OTP verification.
 * 2. Complete prevention of external redirect attacks (open redirects).
 * 3. Prevention of redirect loops (e.g. redirecting to /auth/login or /auth/signup).
 * 4. Fallback to Home (/(tabs)) when no valid target exists.
 */

import type { useRouter } from 'expo-router';

export type AppRouter = ReturnType<typeof useRouter>;

const FORBIDDEN_REDIRECT_PREFIXES = [
  'http:',
  'https:',
  '//',
  'javascript:',
  'mailto:',
  'tel:',
];

const AUTH_ROUTES = [
  '/auth/login',
  '/auth/signup',
  '/auth/verify-otp',
  '/auth/verify-email-otp',
  '/auth/forgot-password',
];

/**
 * Validate and sanitize a redirect target candidate.
 * Returns the safe path string or null if invalid or unsafe.
 */
export function sanitizeRedirectTarget(target?: string | string[]): string | null {
  if (!target) return null;
  const raw = Array.isArray(target) ? target[0] : target;
  if (typeof raw !== 'string') return null;

  const trimmed = raw.trim();
  if (!trimmed || !trimmed.startsWith('/')) return null;

  // Prevent external schemes or double-slash open redirects
  const lower = trimmed.toLowerCase();
  for (const forbidden of FORBIDDEN_REDIRECT_PREFIXES) {
    if (lower.startsWith(forbidden) || lower.includes(`/${forbidden}`)) {
      return null;
    }
  }

  // Prevent redirect loops back to auth screens
  for (const authRoute of AUTH_ROUTES) {
    if (lower === authRoute || lower.startsWith(`${authRoute}?`)) {
      return null;
    }
  }

  return trimmed;
}

/**
 * Construct URL parameters object preserving safe redirect target
 */
export function getRedirectParams(redirectTarget?: string | string[]): Record<string, string> {
  const safe = sanitizeRedirectTarget(redirectTarget);
  return safe ? { redirect: safe } : {};
}

/**
 * Navigate to the intended destination post-authentication with safe fallback
 */
export function navigateAfterAuth(router: AppRouter, redirectTarget?: string | string[]): void {
  const safe = sanitizeRedirectTarget(redirectTarget);
  if (safe) {
    router.replace(safe as any);
  } else {
    router.replace('/(tabs)');
  }
}
