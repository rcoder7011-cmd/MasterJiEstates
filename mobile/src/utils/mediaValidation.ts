/**
 * Media Validation Utilities — src/utils/mediaValidation.ts
 * Enforces business rules, Cloudinary compatibility constraints, and strict video size boundaries.
 */

import { MediaAsset, MediaValidationResult } from '../types/media';

/** Maximum allowed images per property listing */
export const MAX_IMAGE_COUNT = 15;

/** Maximum allowed video tours per property listing */
export const MAX_VIDEO_COUNT = 1;

/**
 * Strict Maximum Video Size Boundary: STRICTLY LESS than 10 MB.
 * 10 MB = 10 * 1024 * 1024 = 10,485,760 bytes.
 * Any video file size >= 10,485,760 bytes MUST be rejected.
 */
export const MAX_VIDEO_SIZE_BYTES = 10 * 1024 * 1024; // 10,485,760 bytes

/** Maximum image size matching backend Cloudinary preset (10 MB) */
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10,485,760 bytes

/** Allowed image extensions */
export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;

/** Allowed video extensions */
export const ALLOWED_VIDEO_EXTENSIONS = ['mp4'] as const;

/**
 * Extracts file extension from URI or filename
 */
export function getFileExtension(uriOrName: string): string {
  if (!uriOrName) return '';
  const cleanPath = uriOrName.split('?')[0].split('#')[0];
  const parts = cleanPath.split('.');
  if (parts.length <= 1) return '';
  return parts[parts.length - 1].toLowerCase();
}

/**
 * Formats bytes into human-readable string (KB or MB)
 */
export function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null || isNaN(bytes) || bytes < 0) {
    return '0 KB';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    const kb = (bytes / 1024).toFixed(1);
    return `${kb} KB`;
  }
  const mb = (bytes / (1024 * 1024)).toFixed(1);
  return `${mb} MB`;
}

/**
 * Validates a single image asset
 */
export function validateImage(
  asset: Pick<MediaAsset, 'uri' | 'size' | 'mimeType' | 'name' | 'isRemote'>
): MediaValidationResult {
  // Remote URLs already hosted on CDN/sample data are trusted
  if (asset.isRemote) {
    return { valid: true };
  }

  const ext = getFileExtension(asset.name || asset.uri);
  const mime = asset.mimeType?.toLowerCase() || '';

  const isValidExtension = (ALLOWED_IMAGE_EXTENSIONS as readonly string[]).includes(ext);
  const isValidMime =
    mime === 'image/jpeg' ||
    mime === 'image/jpg' ||
    mime === 'image/png' ||
    mime === 'image/webp';

  if (!isValidExtension && !isValidMime && ext !== '') {
    return {
      valid: false,
      error: `Unsupported image format (.${ext || 'unknown'}). Allowed: JPG, JPEG, PNG, WEBP.`,
    };
  }

  if (asset.size !== undefined && asset.size !== null && asset.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Image exceeds maximum size of 10 MB (${formatFileSize(asset.size)}).`,
    };
  }

  return { valid: true };
}

/**
 * Validates an optional property video asset.
 * STRICT RULE: File size must be strictly LESS than 10 MB (size < 10 * 1024 * 1024).
 * Files equal to or greater than 10 MB, or missing size, fail validation.
 */
export function validateVideo(
  asset: Pick<MediaAsset, 'uri' | 'size' | 'mimeType' | 'name' | 'isRemote'>
): MediaValidationResult {
  // Remote URLs already hosted on CDN/sample data are trusted
  if (asset.isRemote) {
    return { valid: true };
  }

  const ext = getFileExtension(asset.name || asset.uri);
  const mime = asset.mimeType?.toLowerCase() || '';

  const isValidExtension = (ALLOWED_VIDEO_EXTENSIONS as readonly string[]).includes(ext);
  const isValidMime = mime === 'video/mp4';

  if (!isValidExtension && !isValidMime && ext !== '') {
    return {
      valid: false,
      error: `Unsupported video format (.${ext || 'unknown'}). Only MP4 videos are allowed.`,
    };
  }

  // Strict Size Validation: must be defined, positive, and STRICTLY LESS than 10 MB
  if (asset.size === undefined || asset.size === null || isNaN(asset.size) || asset.size <= 0) {
    return {
      valid: false,
      error: 'Unable to determine video file size. Please select a valid MP4 video.',
    };
  }

  if (asset.size >= MAX_VIDEO_SIZE_BYTES) {
    return {
      valid: false,
      error: `Video size (${formatFileSize(asset.size)}) must be strictly less than 10 MB. Please compress or trim the video.`,
    };
  }

  return { valid: true };
}

/**
 * Validates image selection counts against the maximum limit (15)
 */
export function validateImageCount(
  currentCount: number,
  addingCount: number
): { allowed: boolean; excessCount: number; maxAllowed: number } {
  const total = currentCount + addingCount;
  if (total <= MAX_IMAGE_COUNT) {
    return { allowed: true, excessCount: 0, maxAllowed: MAX_IMAGE_COUNT - currentCount };
  }
  return {
    allowed: false,
    excessCount: total - MAX_IMAGE_COUNT,
    maxAllowed: Math.max(0, MAX_IMAGE_COUNT - currentCount),
  };
}

