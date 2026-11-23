/**
 * Media Types — src/types/media.ts
 * Type definitions for property images, video tours, upload progress, and Cloudinary media assets.
 */

export type MediaType = 'image' | 'video';

export type MediaUploadStatus = 'pending' | 'uploading' | 'completed' | 'failed';

export interface MediaAsset {
  id: string;
  uri: string;
  name?: string;
  type: MediaType;
  size?: number; // File size in bytes
  mimeType?: string;
  width?: number;
  height?: number;
  duration?: number; // Video duration in seconds
  isCover?: boolean; // True for primary/cover image
  isRemote?: boolean; // True for pre-existing remote URLs, false for newly picked local assets
}

export interface MediaUploadProgress {
  assetId: string;
  progress: number; // 0 - 100
  status: MediaUploadStatus;
  bytesUploaded?: number;
  totalBytes?: number;
  error?: string;
}

export interface MediaUploadResult {
  publicId?: string;
  url: string;
  secureUrl?: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  duration?: number;
  resourceType?: 'image' | 'video';
}

export interface MediaValidationResult {
  valid: boolean;
  error?: string;
}

