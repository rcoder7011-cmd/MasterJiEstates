import crypto from 'crypto';
import { CSRF_COOKIE_NAME, getCsrfCookieOptions } from '../config/cookieOptions.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Generate a cryptographically secure CSRF token.
 * @returns {string} 64-character hex string
 */
export function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Express middleware to issue or refresh CSRF tokens.
 * Sets the CSRF cookie and makes the token available on req.csrfToken.
 */
export function csrfProvider(req, res, next) {
  let token = req.cookies?.[CSRF_COOKIE_NAME];
  if (!token) {
    token = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, token, getCsrfCookieOptions());
  }
  req.csrfToken = token;
  next();
}

/**
 * Middleware to enforce CSRF validation on mutating HTTP requests.
 * Checks for `x-csrf-token` header against the issued cookie token.
 *
 * For public unauthenticated endpoints (login, register, enquiries),
 * validation is enforced if the CSRF cookie is present.
 */
export function verifyCsrfToken(req, res, next) {
  // Safe HTTP methods do not mutate state
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  const expectedToken = req.cookies?.[CSRF_COOKIE_NAME];
  const clientToken = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'] || req.body?._csrf;

  // If no session exists and no CSRF cookie has been issued, allow public initial entry
  if (!expectedToken && !req.cookies?.mj_auth_token) {
    return next();
  }

  if (!expectedToken || !clientToken || expectedToken !== clientToken) {
    return errorResponse(
      res,
      'Invalid or missing CSRF security token. Please refresh your session.',
      403,
      [{ field: 'csrf', message: 'Cross-Site Request Forgery validation failed' }]
    );
  }

  next();
}

