import {
  cloudinary,
  isCloudinaryConfigured,
  CLOUDINARY_FOLDER,
  MAX_IMAGE_COUNT_PER_PROPERTY,
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_IMAGE_FORMATS,
} from '../config/cloudinary.js';

/**
 * Generate a cryptographically signed parameters object for direct client-to-Cloudinary uploads.
 *
 * @param {string} userId - Authenticated user identifier
 * @returns {object} Signed upload credentials (API Secret is NEVER included)
 */
export function generateUploadSignature(userId) {
  if (!isCloudinaryConfigured()) {
    const error = new Error(
      'Cloudinary media infrastructure is not configured. Please configure server/.env with valid Cloudinary credentials.'
    );
    error.statusCode = 503;
    throw error;
  }

  // Cloudinary signatures require integer seconds timestamp
  const timestamp = Math.round(Date.now() / 1000);
  const folder = CLOUDINARY_FOLDER;

  // Parameters to sign
  const paramsToSign = {
    folder,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
    maxFileSizeBytes: MAX_IMAGE_SIZE_BYTES,
    allowedFormats: ALLOWED_IMAGE_FORMATS,
  };
}

/**
 * Strict validator for uploaded Cloudinary image assets.
 * Rejects Base64 strings, arbitrary external domains, invalid file types, and oversized assets.
 *
 * @param {object} asset - Raw image asset submitted by client
 * @returns {object} Clean, verified asset object
 */
export function validateUploadedAsset(asset) {
  if (!asset || typeof asset !== 'object') {
    const error = new Error('Invalid image asset payload.');
    error.statusCode = 400;
    throw error;
  }

  const { publicId, secureUrl, url, width, height, format, bytes, isCover } = asset;
  const targetUrl = secureUrl || url;

  if (!publicId || typeof publicId !== 'string') {
    const error = new Error('Image asset public_id is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!targetUrl || typeof targetUrl !== 'string') {
    const error = new Error('Image asset URL is required.');
    error.statusCode = 400;
    throw error;
  }

  // Strictly block Base64 data URLs
  if (targetUrl.startsWith('data:')) {
    const error = new Error('Base64 image uploads are not permitted. Direct Cloudinary upload required.');
    error.statusCode = 400;
    throw error;
  }

  // Strictly restrict to Cloudinary domains (allow sample/demo assets in non-production dev/testing)
  const isCloudinaryDomain =
    targetUrl.startsWith('https://res.cloudinary.com/') ||
    targetUrl.startsWith('http://res.cloudinary.com/');

  const isDevOrTest = process.env.NODE_ENV !== 'production';
  const isAllowedDemoAsset =
    isDevOrTest &&
    (targetUrl.startsWith('https://images.unsplash.com/') ||
      publicId.startsWith('sample_demo_'));

  if (!isCloudinaryDomain && !isAllowedDemoAsset) {
    const error = new Error(
      'Arbitrary external image URLs are rejected. Images must be hosted on Cloudinary.'
    );
    error.statusCode = 400;
    throw error;
  }

  // Validate format extension if provided
  if (format) {
    const fmt = format.toLowerCase().replace('.', '');
    if (!ALLOWED_IMAGE_FORMATS.includes(fmt)) {
      const error = new Error(
        `Unsupported image format "${format}". Permitted formats: ${ALLOWED_IMAGE_FORMATS.join(', ')}`
      );
      error.statusCode = 400;
      throw error;
    }
  }

  // Validate file size limit
  if (typeof bytes === 'number' && bytes > MAX_IMAGE_SIZE_BYTES) {
    const error = new Error(`Image size exceeds the maximum permitted limit of 10 MB.`);
    error.statusCode = 400;
    throw error;
  }

  // Enforce secure HTTPS URL
  const secureTargetUrl = targetUrl.trim().replace(/^http:\/\//i, 'https://');

  return {
    publicId: publicId.trim(),
    url: secureTargetUrl,
    secureUrl: secureTargetUrl,
    width: typeof width === 'number' ? width : 0,
    height: typeof height === 'number' ? height : 0,
    format: format ? format.toLowerCase() : '',
    bytes: typeof bytes === 'number' ? bytes : 0,
    isCover: Boolean(isCover),
  };
}

/**
 * Validate an array of image assets for a property submission.
 *
 * @param {Array} assetsList - Array of uploaded image asset objects
 * @returns {Array} Array of sanitized asset objects
 */
export function validateAssetList(assetsList) {
  if (!Array.isArray(assetsList)) {
    return [];
  }

  if (assetsList.length > MAX_IMAGE_COUNT_PER_PROPERTY) {
    const error = new Error(
      `Maximum ${MAX_IMAGE_COUNT_PER_PROPERTY} photos permitted per property listing.`
    );
    error.statusCode = 400;
    throw error;
  }

  const validated = assetsList.map(validateUploadedAsset);

  // If no cover is designated and assets exist, set first asset as cover
  if (validated.length > 0 && !validated.some((a) => a.isCover)) {
    validated[0].isCover = true;
  }

  return validated;
}

