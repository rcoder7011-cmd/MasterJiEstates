import { validateAssetList } from '../services/cloudinaryService.js';

const PERMITTED_CATEGORIES = [
  'apartment',
  'villa',
  'residential_plot',
  'commercial_property',
  'independent_house',
  'commercial_building',
  'other',
];

const CATEGORY_LABELS = {
  apartment: 'Apartments & Flats',
  villa: 'Villas',
  residential_plot: 'Residential Plots',
  commercial_property: 'Commercial Properties',
  independent_house: 'Independent Houses',
  commercial_building: 'Commercial Buildings',
  other: 'Other Real Estate',
};

/**
 * Validate draft creation or partial draft update.
 * Allows partial data, but enforces business rules and rejects privilege/listingType tampering.
 */
export function validateDraftInput(data = {}) {
  const errors = [];

  // Security: public users can NEVER create company-owned inventory
  if (data.listingType === 'company_owned') {
    errors.push({
      field: 'listingType',
      message: 'External sellers cannot create company-owned inventory. Listing type is restricted to brokerage or owner.',
    });
  }

  // Security: client cannot tamper with moderation or approval status
  if (
    data.availabilityStatus &&
    !['draft', 'pending_review', 'withdrawn'].includes(data.availabilityStatus)
  ) {
    errors.push({
      field: 'availabilityStatus',
      message: 'Client cannot self-assign active or approved availability statuses.',
    });
  }

  // Title: optional in draft; if provided, validate length limit
  if (
    data.title !== undefined &&
    data.title !== null &&
    typeof data.title === 'string' &&
    data.title.trim().length > 0
  ) {
    if (data.title.trim().length > 200) {
      errors.push({ field: 'title', message: 'Title cannot exceed 200 characters.' });
    }
  }

  // Category: optional in draft; if provided and non-empty, must be valid
  if (data.category !== undefined && data.category !== '' && data.category !== null) {
    if (!PERMITTED_CATEGORIES.includes(data.category)) {
      errors.push({
        field: 'category',
        message: `Invalid category. Allowed: ${PERMITTED_CATEGORIES.join(', ')}`,
      });
    }
  }

  // Price: optional in draft; if provided, must be valid non-negative number
  if (data.price !== undefined && data.price !== null && data.price !== '') {
    const num = Number(data.price);
    if (isNaN(num) || num < 0) {
      errors.push({ field: 'price', message: 'Price must be a valid positive number.' });
    }
  }

  // Area: optional in draft; if provided, must be valid non-negative number
  if (data.area !== undefined && data.area !== null && data.area !== '') {
    const num = Number(data.area);
    if (isNaN(num) || num < 0) {
      errors.push({ field: 'area', message: 'Area must be a valid positive number.' });
    }
  }

  // Cloudinary Assets: validate assets if provided
  let validatedAssets = [];
  if (data.cloudinaryAssets !== undefined) {
    try {
      validatedAssets = validateAssetList(data.cloudinaryAssets);
    } catch (err) {
      errors.push({ field: 'cloudinaryAssets', message: err.message });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    validatedAssets,
  };
}

/**
 * Strict validator before submitting a listing for admin review.
 * All Step 1-6 required fields must be complete.
 */
export function validateSubmissionInput(data = {}) {
  const errors = [];

  // Security check: reject company_owned
  if (data.listingType === 'company_owned') {
    errors.push({
      field: 'listingType',
      message: 'Public sellers can only submit brokerage or owner listings.',
    });
  }

  // Step 1: Basic Information
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 5) {
    errors.push({ field: 'title', message: 'Property title must be at least 5 characters long.' });
  } else if (data.title.trim().length > 200) {
    errors.push({ field: 'title', message: 'Property title cannot exceed 200 characters.' });
  }

  if (!data.category || !PERMITTED_CATEGORIES.includes(data.category)) {
    errors.push({
      field: 'category',
      message: `Please select a valid property category (${PERMITTED_CATEGORIES.join(', ')}).`,
    });
  }

  if (
    !data.description ||
    typeof data.description !== 'string' ||
    data.description.trim().length < 20
  ) {
    errors.push({
      field: 'description',
      message: 'Property description must be at least 20 characters long.',
    });
  }

  // Step 2: Location
  if (!data.city || typeof data.city !== 'string' || data.city.trim().length < 2) {
    errors.push({ field: 'city', message: 'City is required.' });
  }

  if (!data.locality || typeof data.locality !== 'string' || data.locality.trim().length < 2) {
    errors.push({ field: 'locality', message: 'Locality / Sector / Neighborhood is required.' });
  }

  // Step 3: Specifications
  const areaNum = Number(data.area);
  if (isNaN(areaNum) || areaNum <= 0) {
    errors.push({ field: 'area', message: 'Property area must be greater than 0.' });
  }

  // Step 4: Pricing
  const priceNum = Number(data.price);
  if (isNaN(priceNum) || priceNum <= 0) {
    errors.push({ field: 'price', message: 'Expected price must be a positive number.' });
  }

  // Step 5: Photos
  const assets = data.cloudinaryAssets || [];
  if (!Array.isArray(assets) || assets.length === 0) {
    // Also check if legacy images array has items
    if (!Array.isArray(data.images) || data.images.length === 0) {
      errors.push({
        field: 'photos',
        message: 'At least one property photograph is required before submitting.',
      });
    }
  }

  let validatedAssets = [];
  if (Array.isArray(assets) && assets.length > 0) {
    try {
      validatedAssets = validateAssetList(assets);
    } catch (err) {
      errors.push({ field: 'cloudinaryAssets', message: err.message });
    }
  }

  // Step 6: Seller Contact Details (if provided)
  if (data.ownerPhone !== undefined && data.ownerPhone !== null && data.ownerPhone !== '') {
    const cleanPhone = data.ownerPhone.toString().trim().replace(/[\s-]/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.push({
        field: 'ownerPhone',
        message: 'Please provide a valid 10-digit Indian mobile number for seller contact.',
      });
    }
  }

  if (data.ownerEmail !== undefined && data.ownerEmail !== null && data.ownerEmail !== '') {
    const cleanEmail = data.ownerEmail.toString().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.push({ field: 'ownerEmail', message: 'Please provide a valid seller email address.' });
    }
  }

  if (data.agreedToDeclaration !== undefined && !data.agreedToDeclaration) {
    errors.push({
      field: 'declaration',
      message: 'You must confirm the accuracy declaration before submitting for review.',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    validatedAssets,
  };
}

export { PERMITTED_CATEGORIES, CATEGORY_LABELS };

