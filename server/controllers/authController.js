import {
  validateRegisterInput,
  validateLoginInput,
  validateChangePasswordInput,
  validateForgotPasswordInput,
  validateResetPasswordInput,
} from '../validators/authValidator.js';
import {
  registerUser,
  loginUser,
  changeUserPassword,
  requestPasswordReset,
  resetPasswordWithToken,
} from '../services/authService.js';
import {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
  getClearCookieOptions,
} from '../config/cookieOptions.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Controller: Register a new user account.
 * POST /api/auth/register
 */
export async function register(req, res, next) {
  try {
    const validation = validateRegisterInput(req.body);
    if (!validation.isValid) {
      return errorResponse(res, 'Validation failed for registration', 400, validation.errors);
    }

    const result = await registerUser(req.body);

    // Set secure HTTP-only session cookie
    res.cookie(AUTH_COOKIE_NAME, result.token, getAuthCookieOptions(false));

    return successResponse(
      res,
      result.user,
      'Registration successful. Welcome to MasterJiEstates.',
      201
    );
  } catch (error) {
    if (error.statusCode === 409) {
      return errorResponse(res, error.message, 409, error.errors);
    }
    return next(error);
  }
}

/**
 * Controller: Authenticate user credentials.
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const validation = validateLoginInput(req.body);
    if (!validation.isValid) {
      return errorResponse(res, 'Validation failed for login', 400, validation.errors);
    }

    const rememberMe = Boolean(req.body.rememberMe);
    const result = await loginUser(req.body.email, req.body.password, rememberMe);

    // Issue secure HTTP-only session cookie
    res.cookie(AUTH_COOKIE_NAME, result.token, getAuthCookieOptions(rememberMe));

    return successResponse(res, result.user, 'Signed in successfully.', 200);
  } catch (error) {
    if (error.statusCode === 401 || error.statusCode === 403) {
      return errorResponse(res, error.message, error.statusCode);
    }
    return next(error);
  }
}

/**
 * Controller: Terminate authenticated session.
 * POST /api/auth/logout
 */
export async function logout(req, res) {
  res.clearCookie(AUTH_COOKIE_NAME, getClearCookieOptions());
  return successResponse(res, null, 'Logged out successfully.', 200);
}

/**
 * Controller: Return current authenticated user profile.
 * GET /api/auth/me
 */
export async function getMe(req, res) {
  return successResponse(res, req.user, 'Current user profile retrieved.', 200);
}

/**
 * Controller: Issue CSRF synchronizer token.
 * GET /api/auth/csrf
 */
export async function getCsrf(req, res) {
  return successResponse(
    res,
    { csrfToken: req.csrfToken },
    'CSRF security token issued.',
    200
  );
}

/**
 * Controller: Change authenticated user's password.
 * PATCH /api/auth/change-password
 */
export async function changePassword(req, res, next) {
  try {
    const validation = validateChangePasswordInput(req.body);
    if (!validation.isValid) {
      return errorResponse(res, 'Validation failed for password change', 400, validation.errors);
    }

    const result = await changeUserPassword(
      req.user.id,
      req.body.currentPassword,
      req.body.newPassword
    );

    // Invalidate session cookie so user signs in afresh
    res.clearCookie(AUTH_COOKIE_NAME, getClearCookieOptions());

    return successResponse(res, null, result.message, 200);
  } catch (error) {
    if (error.statusCode === 400 || error.statusCode === 404) {
      return errorResponse(res, error.message, error.statusCode, error.errors);
    }
    return next(error);
  }
}

/**
 * Controller: Request password reset instructions.
 * POST /api/auth/forgot-password
 */
export async function forgotPassword(req, res, next) {
  try {
    const validation = validateForgotPasswordInput(req.body);
    if (!validation.isValid) {
      return errorResponse(res, 'Validation failed for password reset', 400, validation.errors);
    }

    const result = await requestPasswordReset(req.body.email);

    return successResponse(res, null, result.message, 200);
  } catch (error) {
    return next(error);
  }
}

/**
 * Controller: Reset password with a valid reset token.
 * POST /api/auth/reset-password
 */
export async function resetPassword(req, res, next) {
  try {
    const validation = validateResetPasswordInput(req.body);
    if (!validation.isValid) {
      return errorResponse(res, 'Validation failed for password reset', 400, validation.errors);
    }

    const result = await resetPasswordWithToken(req.body.token, req.body.newPassword);

    // Clear session cookies if any
    res.clearCookie(AUTH_COOKIE_NAME, getClearCookieOptions());

    return successResponse(res, null, result.message, 200);
  } catch (error) {
    if (error.statusCode === 400) {
      return errorResponse(res, error.message, 400, error.errors);
    }
    return next(error);
  }
}

