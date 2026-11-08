import {
  getUserOverview,
  getUserEnquiries,
  getUserSiteVisits,
  cancelUserSiteVisit,
  getUserFavourites,
  addFavourite,
  removeFavourite,
  getUserRecentlyViewed,
  recordRecentlyViewed,
  getUserListings,
  updateUserProfile,
} from '../services/dashboardService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * GET /api/dashboard/overview
 */
export async function getOverview(req, res, next) {
  try {
    const data = await getUserOverview(req.user.id, req.user.email);
    return successResponse(res, data, 'Dashboard overview retrieved successfully');
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/dashboard/enquiries
 */
export async function getEnquiries(req, res, next) {
  try {
    const { status } = req.query;
    const data = await getUserEnquiries(req.user.id, req.user.email, { status });
    return successResponse(res, data, 'User enquiries retrieved successfully');
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/dashboard/site-visits
 */
export async function getSiteVisits(req, res, next) {
  try {
    const { status } = req.query;
    const data = await getUserSiteVisits(req.user.id, req.user.email, { status });
    return successResponse(res, data, 'User site visits retrieved successfully');
  } catch (err) {
    return next(err);
  }
}

/**
 * PATCH /api/dashboard/site-visits/:id/cancel
 */
export async function cancelSiteVisit(req, res, next) {
  try {
    const { id } = req.params;
    const result = await cancelUserSiteVisit(req.user.id, req.user.email, id);
    return successResponse(res, result, result.message);
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/dashboard/favourites
 */
export async function getFavourites(req, res, next) {
  try {
    const data = await getUserFavourites(req.user.id);
    return successResponse(res, data, 'Saved properties retrieved successfully');
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/dashboard/favourites/:propertyId
 */
export async function addFavouriteProperty(req, res, next) {
  try {
    const { propertyId } = req.params;
    const result = await addFavourite(req.user.id, propertyId);
    return successResponse(res, result, result.message, 201);
  } catch (err) {
    return next(err);
  }
}

/**
 * DELETE /api/dashboard/favourites/:propertyId
 */
export async function removeFavouriteProperty(req, res, next) {
  try {
    const { propertyId } = req.params;
    const result = await removeFavourite(req.user.id, propertyId);
    return successResponse(res, result, result.message);
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/dashboard/recently-viewed
 */
export async function getRecentlyViewed(req, res, next) {
  try {
    const data = await getUserRecentlyViewed(req.user.id);
    return successResponse(res, data, 'Recently viewed properties retrieved successfully');
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/dashboard/recently-viewed/:propertyId
 */
export async function recordPropertyView(req, res, next) {
  try {
    const { propertyId } = req.params;
    const result = await recordRecentlyViewed(req.user.id, propertyId);
    return successResponse(res, result, 'Property view recorded');
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/dashboard/listings
 */
export async function getListings(req, res, next) {
  try {
    const data = await getUserListings(req.user.id, req.user.email);
    return successResponse(res, data, 'User submitted listings retrieved successfully');
  } catch (err) {
    return next(err);
  }
}

/**
 * PATCH /api/dashboard/profile
 */
export async function updateProfile(req, res, next) {
  try {
    const { fullName, phone } = req.body;

    // Security: reject any attempts to tamper with protected fields
    if (req.body.role || req.body.accountStatus || req.body.passwordHash || req.body.email) {
      if (req.body.role && req.body.role !== req.user.role) {
        return errorResponse(res, 'Modifying user role is not permitted.', 403);
      }
    }

    const updatedUser = await updateUserProfile(req.user.id, { fullName, phone });
    return successResponse(res, updatedUser, 'Your profile details have been updated successfully');
  } catch (err) {
    return next(err);
  }
}

