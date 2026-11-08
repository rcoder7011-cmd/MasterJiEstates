import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure environment variables are loaded
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

/**
 * Check if Cloudinary media credentials are fully configured.
 * @returns {boolean}
 */
export function isCloudinaryConfigured() {
  return Boolean(
    cloudName &&
      cloudName !== 'your_cloudinary_cloud_name' &&
      apiKey &&
      apiKey !== 'your_cloudinary_api_key' &&
      apiSecret &&
      apiSecret !== 'your_cloudinary_api_secret'
  );
}

// Configure Cloudinary SDK singleton
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'masterji_estates/properties';
export const MAX_IMAGE_COUNT_PER_PROPERTY = 15;
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];

export { cloudinary };
export default cloudinary;

