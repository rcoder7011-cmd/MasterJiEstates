/**
 * Secure Cookie Configuration for MasterJiEstates
 *
 * Configures HTTP-only session cookies and CSRF tokens with strict environment
 * segregation between local development and production HTTPS subdomains.
 */

const isProduction = process.env.NODE_ENV === 'production';

export const AUTH_COOKIE_NAME = 'mj_auth_token';
export const CSRF_COOKIE_NAME = 'mj_csrf_token';

/**
 * Generate cookie options for user session authentication.
 *
 * @param {boolean} [rememberMe=false] - Whether to extend expiry to 7 days
 * @returns {import('express').CookieOptions}
 */
export function getAuthCookieOptions(rememberMe = false) {
  const maxAge = rememberMe
    ? 7 * 24 * 60 * 60 * 1000 // 7 days
    : 24 * 60 * 60 * 1000;    // 1 day

  const options = {
    httpOnly: true,                                       // Prevent XSS access via document.cookie
    secure: isProduction,                                 // Exclusively transmitted over HTTPS in production
    sameSite: 'lax',                                      // Defend against CSRF on cross-site navigations
    path: '/',
    maxAge,
  };

  // Only assign domain if explicitly configured in environment (e.g., .masterjiestates.in in production)
  // Never assign domain on localhost to prevent browser cookie rejection
  if (isProduction && process.env.COOKIE_DOMAIN) {
    options.domain = process.env.COOKIE_DOMAIN;
  }

  return options;
}

/**
 * Generate cookie options for CSRF protection token.
 *
 * @returns {import('express').CookieOptions}
 */
export function getCsrfCookieOptions() {
  const options = {
    httpOnly: false,                                      // Allow client-side reader if necessary
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,                          // 24 hours
  };

  if (isProduction && process.env.COOKIE_DOMAIN) {
    options.domain = process.env.COOKIE_DOMAIN;
  }

  return options;
}

/**
 * Options used to clear cookies upon logout.
 * Must match the path and domain used during issuance.
 *
 * @returns {import('express').CookieOptions}
 */
export function getClearCookieOptions() {
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  };

  if (isProduction && process.env.COOKIE_DOMAIN) {
    options.domain = process.env.COOKIE_DOMAIN;
  }

  return options;
}

