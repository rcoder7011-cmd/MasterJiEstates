import { Router } from 'express';
import {
  getOverview,
  getEnquiries,
  getSiteVisits,
  cancelSiteVisit,
  getFavourites,
  addFavouriteProperty,
  removeFavouriteProperty,
  getRecentlyViewed,
  recordPropertyView,
  getListings,
  updateProfile,
} from '../controllers/dashboardController.js';
import {
  getUploadSignature,
  createDraft,
  updateDraft,
  getListingById,
  submitListing,
  withdrawListing,
  getSellerListings,
} from '../controllers/propertySubmissionController.js';
import { authenticate } from '../middleware/auth.js';
import { csrfProvider, verifyCsrfToken } from '../middleware/csrf.js';

const router = Router();

// Ensure CSRF token cookie is provided
router.use(csrfProvider);

// All dashboard endpoints require strict authentication
router.use(authenticate);

// GET /api/dashboard/overview — Summary metrics and activity feed
router.get('/overview', getOverview);

// GET /api/dashboard/enquiries — User's submitted property inquiries
router.get('/enquiries', getEnquiries);

// GET /api/dashboard/site-visits — User's scheduled property visits
router.get('/site-visits', getSiteVisits);

// PATCH /api/dashboard/site-visits/:id/cancel — Cancel user's scheduled visit
router.patch('/site-visits/:id/cancel', verifyCsrfToken, cancelSiteVisit);

// GET /api/dashboard/favourites — User's saved properties
router.get('/favourites', getFavourites);

// POST /api/dashboard/favourites/:propertyId — Add property to favourites
router.post('/favourites/:propertyId', verifyCsrfToken, addFavouriteProperty);

// DELETE /api/dashboard/favourites/:propertyId — Remove property from favourites
router.delete('/favourites/:propertyId', verifyCsrfToken, removeFavouriteProperty);

// GET /api/dashboard/recently-viewed — User's recently viewed properties
router.get('/recently-viewed', getRecentlyViewed);

// POST /api/dashboard/recently-viewed/:propertyId — Record property view
router.post('/recently-viewed/:propertyId', verifyCsrfToken, recordPropertyView);

// --- SELLER PROPERTY SUBMISSION & INVENTORY ROUTES (Part 11) ---

// POST /api/dashboard/listings/upload-signature — Signed Cloudinary upload authorization
router.post('/listings/upload-signature', verifyCsrfToken, getUploadSignature);

// POST /api/dashboard/listings/draft — Create a new property draft
router.post('/listings/draft', verifyCsrfToken, createDraft);

// PATCH /api/dashboard/listings/draft/:id — Update existing property draft
router.patch('/listings/draft/:id', verifyCsrfToken, updateDraft);

// GET /api/dashboard/listings — Fetch all seller listings and drafts owned by user
router.get('/listings', getSellerListings);

// GET /api/dashboard/listings/:id — Fetch single owned listing or draft
router.get('/listings/:id', getListingById);

// POST /api/dashboard/listings/:id/submit — Submit draft for admin review
router.post('/listings/:id/submit', verifyCsrfToken, submitListing);

// PATCH /api/dashboard/listings/:id/withdraw — Withdraw listing from directory
router.patch('/listings/:id/withdraw', verifyCsrfToken, withdrawListing);

// PATCH /api/dashboard/profile — Update contact info (name, phone)
router.patch('/profile', verifyCsrfToken, updateProfile);

export default router;

