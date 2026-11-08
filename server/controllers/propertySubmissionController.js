import {
  generateUploadSignature,
} from '../services/cloudinaryService.js';
import {
  createPropertyDraft,
  updatePropertyDraft,
  getOwnedPropertyById,
  submitDraftForReview,
  withdrawUserListing,
  getUserListingsAndDrafts,
} from '../services/propertySubmissionService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * POST /api/dashboard/listings/upload-signature
 * Generate secure signed upload authorization for client-side direct Cloudinary uploads.
 */
export async function getUploadSignature(req, res, next) {
  try {
    const signatureData = generateUploadSignature(req.user.id);
    return successResponse(
      res,
      signatureData,
      'Upload signature authorization generated successfully'
    );
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/dashboard/listings/draft
 * Create a new property draft.
 */
export async function createDraft(req, res, next) {
  try {
    const draft = await createPropertyDraft(req.user, req.body);
    return successResponse(res, draft, 'Property draft initialized successfully', 201);
  } catch (err) {
    return next(err);
  }
}

/**
 * PATCH /api/dashboard/listings/draft/:id
 * Update an existing property draft owned by the authenticated user.
 */
export async function updateDraft(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await updatePropertyDraft(req.user, id, req.body);
    return successResponse(res, updated, 'Property draft updated successfully');
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/dashboard/listings/:id
 * Fetch a single property listing or draft owned by the authenticated user.
 */
export async function getListingById(req, res, next) {
  try {
    const { id } = req.params;
    const listing = await getOwnedPropertyById(req.user, id);
    return successResponse(res, listing, 'Property listing retrieved successfully');
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/dashboard/listings/:id/submit
 * Submit a complete property draft for admin verification.
 */
export async function submitListing(req, res, next) {
  try {
    const { id } = req.params;
    const result = await submitDraftForReview(req.user, id, req.body);
    return successResponse(res, result.property, result.message);
  } catch (err) {
    return next(err);
  }
}

/**
 * PATCH /api/dashboard/listings/:id/withdraw
 * Withdraw an owned listing from the portal.
 */
export async function withdrawListing(req, res, next) {
  try {
    const { id } = req.params;
    const result = await withdrawUserListing(req.user, id);
    return successResponse(res, result.property, result.message);
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/dashboard/listings
 * Fetch all seller listings and drafts owned by the authenticated user.
 */
export async function getSellerListings(req, res, next) {
  try {
    const listings = await getUserListingsAndDrafts(req.user);
    return successResponse(res, listings, 'Seller listings retrieved successfully');
  } catch (err) {
    return next(err);
  }
}

