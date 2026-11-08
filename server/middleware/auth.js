import { verifyToken } from '../utils/jwt.js';
import { AUTH_COOKIE_NAME } from '../config/cookieOptions.js';
import User from '../models/User.js';
import { isDatabaseConnected } from '../config/database.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Authentication Middleware: Enforces that requests carry a valid, signed JWT
 * in an HTTP-only cookie or Bearer header, and verifies active session validity.
 */
export async function authenticate(req, res, next) {
  try {
    const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
    const headerToken = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;

    const token = cookieToken || headerToken;

    if (!token) {
      return errorResponse(res, 'Authentication required. Please sign in to continue.', 401);
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (tokenError) {
      if (tokenError.name === 'TokenExpiredError') {
        return errorResponse(res, 'Your session has expired. Please sign in again.', 401);
      }
      return errorResponse(res, 'Invalid authentication session token.', 401);
    }

    if (!payload || !payload.id) {
      return errorResponse(res, 'Malformed authentication token.', 401);
    }

    if (isDatabaseConnected()) {
      const user = await User.findById(payload.id).select('+tokenVersion +accountStatus');

      if (!user) {
        return errorResponse(res, 'User account no longer exists.', 401);
      }

      if (user.accountStatus === 'suspended') {
        return errorResponse(
          res,
          'Your account has been suspended. Please contact MasterJiEstates support.',
          403
        );
      }

      // Check session version to enforce instant cross-device invalidation
      if (user.tokenVersion !== payload.tokenVersion) {
        return errorResponse(
          res,
          'Your session has been invalidated due to a password or security update. Please sign in again.',
          401
        );
      }

      req.user = user.toSafeObject();
      req.userDocument = user;
    } else {
      // Offline fallback token evaluation for testing when database is disconnected
      req.user = {
        id: payload.id,
        role: payload.role || 'user',
        accountStatus: 'active',
      };
    }

    next();
  } catch (error) {
    return next(error);
  }
}

/**
 * Optional Authentication: Attaches req.user if a valid token is provided,
 * but allows unauthenticated guest requests to proceed without error.
 */
export async function optionalAuthenticate(req, res, next) {
  const token = req.cookies?.[AUTH_COOKIE_NAME] || (
    req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null
  );

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const payload = verifyToken(token);
    if (isDatabaseConnected() && payload?.id) {
      const user = await User.findById(payload.id).select('+tokenVersion +accountStatus');
      if (user && user.accountStatus !== 'suspended' && user.tokenVersion === payload.tokenVersion) {
        req.user = user.toSafeObject();
        req.userDocument = user;
      } else {
        req.user = null;
      }
    } else if (payload?.id) {
      req.user = { id: payload.id, role: payload.role || 'user' };
    }
  } catch {
    req.user = null;
  }

  next();
}

/**
 * Role-Based Access Control (RBAC) Guard Middleware.
 * Rejects requests with 403 Forbidden if user role is not among authorized roles.
 *
 * @param {...string} allowedRoles - E.g. 'admin', 'staff'
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required before verifying role permissions.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access forbidden. This action requires one of the following roles: [${allowedRoles.join(', ')}].`,
        403
      );
    }

    next();
  };
}

/**
 * Attribute-Based Access Control (ABAC) Helper for resource ownership.
 *
 * @param {Function} getOwnerIdFn - Function (req) => string (ownerId)
 */
export function verifyOwnership(getOwnerIdFn) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required to verify resource ownership.', 401);
    }

    // Admins bypass resource ownership checks
    if (req.user.role === 'admin') {
      return next();
    }

    const ownerId = getOwnerIdFn(req);
    if (!ownerId || ownerId.toString() !== req.user.id.toString()) {
      return errorResponse(
        res,
        'Forbidden: You do not have permission to modify or access this resource.',
        403
      );
    }

    next();
  };
}

