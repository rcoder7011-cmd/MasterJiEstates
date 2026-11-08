import React, { useState, useRef } from 'react';
import {
  fetchUploadSignature,
  uploadImageToCloudinary,
} from '../../services/api';

const MAX_IMAGE_COUNT = 15;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function Step5Photos({ formData, updateFormData, onChange, errors = {} }) {
  const isDevOrTest = Boolean(import.meta.env.DEV || import.meta.env.MODE === 'development' || import.meta.env.MODE === 'test');
  const fileInputRef = useRef(null);
  const [uploadQueue, setUploadQueue] = useState([]); // [{ id, name, progress, status, error }]
  const [uploadError, setUploadError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const triggerChange = (patch) => {
    if (typeof updateFormData === 'function') updateFormData(patch);
    if (typeof onChange === 'function') onChange(patch);
  };

  // images is an array of objects:
  // { publicId, url, secureUrl, width, height, format, bytes, isCover, caption }
  const images = formData.images || [];

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Check capacity
    const availableSlots = MAX_IMAGE_COUNT - images.length;
    if (availableSlots <= 0) {
      setUploadError(`Maximum of ${MAX_IMAGE_COUNT} images reached.`);
      return;
    }

    const filesToUpload = files.slice(0, availableSlots);
    setUploadError(null);

    for (const file of filesToUpload) {
      // Validate type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setUploadError(`Unsupported format for ${file.name}. Only JPEG, PNG, and WebP are accepted.`);
        return;
      }
      // Validate size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setUploadError(`File ${file.name} exceeds the 10MB size limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
        return;
      }
    }

    // Process files sequentially or in parallel
    await uploadFiles(filesToUpload);
  };

  const uploadFiles = async (files) => {
    setIsProcessing(true);
    setUploadError(null);

    try {
      // 1. Fetch signed parameters from backend
      const signatureData = await fetchUploadSignature();
      if (!signatureData || !signatureData.signature) {
        throw new Error('Failed to retrieve upload authorization from server.');
      }

      const newImages = [...images];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const queueId = `${Date.now()}_${i}`;

        // Add to tracking state
        setUploadQueue((prev) => [
          ...prev,
          { id: queueId, name: file.name, progress: 10, status: 'uploading', error: null },
        ]);

        try {
          const uploadedAsset = await uploadImageToCloudinary({
            file,
            signatureData,
            onProgress: (percent) => {
              setUploadQueue((prev) =>
                prev.map((item) => (item.id === queueId ? { ...item, progress: percent } : item))
              );
            },
          });

          // Mark upload as complete in queue
          setUploadQueue((prev) =>
            prev.map((item) =>
              item.id === queueId ? { ...item, progress: 100, status: 'completed' } : item
            )
          );

          // If this is the very first image and no cover exists, designate as cover
          const isFirstCover = newImages.length === 0;

          newImages.push({
            publicId: uploadedAsset.publicId,
            url: uploadedAsset.url,
            secureUrl: uploadedAsset.secureUrl,
            width: uploadedAsset.width,
            height: uploadedAsset.height,
            format: uploadedAsset.format,
            bytes: uploadedAsset.bytes,
            isCover: isFirstCover,
          });

          // Propagate change
          triggerChange({ images: newImages });
        } catch (err) {
          const errMsg = err?.message || 'Upload failed.';
          setUploadQueue((prev) =>
            prev.map((item) =>
              item.id === queueId ? { ...item, status: 'failed', error: errMsg } : item
            )
          );
          setUploadError(
            `Cloudinary upload error: ${errMsg}. Note: If using demo Cloudinary credentials, replace them with valid credentials in server/.env.`
          );
        }
      }
    } catch (err) {
      setUploadError(
        err?.message ||
          'Failed to initialize secure upload. Ensure backend is running and Cloudinary credentials are set.'
      );
    } finally {
      setIsProcessing(false);
      // Clean completed items after 3 seconds
      setTimeout(() => {
        setUploadQueue((prev) => prev.filter((item) => item.status !== 'completed'));
      }, 3000);
    }
  };

  const handleSetCover = (index) => {
    const updated = images.map((img, i) => ({
      ...img,
      isCover: i === index,
    }));
    triggerChange({ images: updated });
  };

  const handleRemoveImage = (index) => {
    const removedWasCover = images[index]?.isCover;
    const updated = images.filter((_, i) => i !== index);

    // If removed image was cover and we still have images, make the first one cover
    if (removedWasCover && updated.length > 0) {
      updated[0].isCover = true;
    }

    triggerChange({ images: updated });
  };

  // Helper for local dev/testing only if live Cloudinary credentials are mock/unconfigured
  const handleAddSampleDemoPhoto = () => {
    if (!isDevOrTest) return; // Strict runtime guard: dev/test only
    const samplePhotos = [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
    ];

    const currentLen = images.length;
    if (currentLen >= MAX_IMAGE_COUNT) return;

    const sampleUrl = samplePhotos[currentLen % samplePhotos.length];
    const newAsset = {
      publicId: `sample_demo_${Date.now()}_${currentLen}`,
      url: sampleUrl,
      secureUrl: sampleUrl,
      width: 1200,
      height: 800,
      format: 'jpg',
      bytes: 245000,
      isCover: currentLen === 0,
    };

    triggerChange({ images: [...images, newAsset] });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-primary-100 pb-4">
        <h2 className="text-xl font-serif font-bold text-primary-900">
          Property Photos & Showcase
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          High-resolution photographs drastically enhance buyer response rate. You can upload up to{' '}
          {MAX_IMAGE_COUNT} images (JPEG, PNG, or WebP, max 10MB per image).
        </p>
      </div>

      {/* Cloudinary credentials notice / error */}
      {uploadError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <div className="flex items-start gap-2">
            <span className="text-base font-bold text-amber-600">⚠</span>
            <div className="flex-1">
              <p className="font-semibold">{uploadError}</p>
              <p className="mt-1 text-amber-700">
                You can configure valid Cloudinary credentials in <code className="bg-amber-100 px-1 py-0.5 rounded">server/.env</code>. For testing, you can also use the sample photos button below.
              </p>
            </div>
          </div>
        </div>
      )}

      {errors.images && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
          {errors.images}
        </div>
      )}

      {/* Upload Zone */}
      <div
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isProcessing
            ? 'border-neutral-300 bg-neutral-50 cursor-not-allowed opacity-70'
            : 'border-accent-300 hover:border-accent-500 bg-accent-50/20 hover:bg-accent-50/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={isProcessing}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-900/5 text-primary-900 flex items-center justify-center mb-3">
            <svg
              className="w-7 h-7 text-accent-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h3 className="font-semibold text-primary-900 text-sm">
            {isProcessing ? 'Uploading images to Cloudinary...' : 'Click to select photos'}
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Supports JPEG, PNG, WebP up to 10MB each. {MAX_IMAGE_COUNT - images.length} remaining slots.
          </p>
          <p className="text-[11px] text-accent-700 mt-2 font-medium">
            ✦ Direct secure Cloudinary upload via backend-signed authorization
          </p>
        </div>
      </div>

      {/* Selected images count and dev-only fallback */}
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>Currently selected: <strong className="text-primary-900">{images.length} / {MAX_IMAGE_COUNT}</strong> photos</span>
        {isDevOrTest && (
          <button
            type="button"
            onClick={handleAddSampleDemoPhoto}
            disabled={images.length >= MAX_IMAGE_COUNT}
            className="text-xs text-accent-700 hover:text-accent-800 underline font-medium"
            title="Available in development/testing mode only"
          >
            + Add Sample Photo (Dev/Test Only)
          </button>
        )}
      </div>

      {/* Upload Queue Progress Bars */}
      {uploadQueue.length > 0 && (
        <div className="space-y-2">
          {uploadQueue.map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-lg border border-neutral-200 bg-white text-xs flex items-center justify-between gap-3"
            >
              <div className="truncate flex-1">
                <span className="font-medium text-primary-900">{item.name}</span>
                {item.error && <p className="text-[10px] text-red-600 truncate">{item.error}</p>}
              </div>

              <div className="w-32 bg-neutral-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    item.status === 'failed'
                      ? 'bg-red-500'
                      : item.status === 'completed'
                      ? 'bg-emerald-500'
                      : 'bg-accent-500'
                  }`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>

              <span className="text-[10px] text-neutral-500 w-10 text-right">
                {item.status === 'failed' ? 'Failed' : `${item.progress}%`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Photos Gallery */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img, idx) => {
            const isCover = img.isCover || idx === 0;
            return (
              <div
                key={img.publicId || idx}
                className={`group relative rounded-xl overflow-hidden border-2 transition-all bg-neutral-100 ${
                  isCover ? 'border-accent-500 shadow-md ring-2 ring-accent-400/20' : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {/* Image element */}
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={img.secureUrl || img.url}
                    alt={`Property view ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Cover badge */}
                {isCover && (
                  <div className="absolute top-2 left-2 bg-accent-600 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow">
                    Cover Photo
                  </div>
                )}

                {/* Dimension / size tag */}
                <div className="absolute bottom-2 left-2 bg-primary-950/70 text-white text-[9px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                  {img.format?.toUpperCase() || 'IMG'}
                  {img.bytes ? ` • ${(img.bytes / 1024).toFixed(0)}KB` : ''}
                </div>

                {/* Action buttons overlay */}
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  {!isCover && (
                    <button
                      type="button"
                      onClick={() => handleSetCover(idx)}
                      title="Set as Cover Photo"
                      className="w-7 h-7 bg-white/90 hover:bg-white text-neutral-700 hover:text-accent-700 rounded-full flex items-center justify-center text-xs shadow transition-colors"
                    >
                      ★
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    title="Remove Image"
                    className="w-7 h-7 bg-white/90 hover:bg-red-50 text-neutral-700 hover:text-red-600 rounded-full flex items-center justify-center text-xs shadow transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-400 text-xs">
          No photos uploaded yet. Upload at least 1 photo (preferably 3 or more) to showcase your property effectively.
        </div>
      )}

      {/* Photo guidelines */}
      <div className="bg-primary-50/50 rounded-xl p-4 border border-primary-100 text-xs text-primary-800 space-y-1">
        <p className="font-semibold text-primary-900">Photography Best Practices:</p>
        <ul className="list-disc list-inside space-y-0.5 text-neutral-600">
          <li>Capture photos in bright, natural daylight with curtains opened.</li>
          <li>Include wide shots of living spaces, master bedrooms, kitchen, and balcony views.</li>
          <li>Avoid photos with visible residents, personal documents, or sensitive belongings.</li>
          <li>High-resolution landscape photos (16:9 or 4:3) render best across desktop and mobile screens.</li>
        </ul>
      </div>
    </div>
  );
}

