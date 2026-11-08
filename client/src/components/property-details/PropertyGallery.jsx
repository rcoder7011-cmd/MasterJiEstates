import React, { useState, useEffect, useCallback } from 'react';
import Badge from '../ui/Badge.jsx';

export default function PropertyGallery({ property }) {
  const images = property.images && property.images.length > 0
    ? property.images
    : [property.imageUrl];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const isDirect = property.listingType === 'company_owned';
  const isUnderNegotiation = property.availabilityStatus === 'under_negotiation';

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handlePrev, handleNext]);

  // Lock body scroll when Lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  return (
    <div className="space-y-3">
      {/* Primary Featured Image Display */}
      <div className="relative h-72 sm:h-96 md:h-[460px] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-card group">
        <img
          src={images[activeIndex]}
          alt={`${property.title} - View ${activeIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 cursor-pointer"
          onClick={() => setIsLightboxOpen(true)}
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isDirect ? 'direct' : 'brokerage'} size="md" dot>
              {property.listingTypeLabel}
            </Badge>
            <Badge
              variant={isUnderNegotiation ? 'warning' : 'success'}
              size="md"
            >
              {property.availabilityLabel}
            </Badge>
          </div>

          <Badge
            variant="default"
            size="sm"
            className="bg-slate-900/80 text-white backdrop-blur-md border-0 text-[10px]"
          >
            Illustrative Listing
          </Badge>
        </div>

        {/* Counter Badge at Bottom Left */}
        <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur-xs font-medium z-10">
          {activeIndex + 1} / {images.length}
        </div>

        {/* Fullscreen Expand Action Button at Bottom Right */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 text-white text-xs px-3 py-1.5 rounded-xl backdrop-blur-xs font-semibold flex items-center gap-1.5 transition-colors z-10"
          aria-label="View Fullscreen Gallery"
        >
          <svg className="w-3.5 h-3.5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          <span className="hidden sm:inline">Fullscreen</span>
        </button>

        {/* Previous & Next Arrow Controls on Main Image */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 z-10"
              aria-label="Previous Image"
            >
              &larr;
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 z-10"
              aria-label="Next Image"
            >
              &rarr;
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Navigation Strip */}
      {images.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar select-none">
          {images.map((imgUrl, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative w-20 sm:w-24 h-14 sm:h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                  isActive
                    ? 'border-brand-gold ring-2 ring-brand-gold/30 scale-100'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
                aria-label={`View photo ${index + 1}`}
              >
                <img
                  src={imgUrl}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox / Fullscreen Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen Property Gallery"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6"
        >
          {/* Top Lightbox Header */}
          <div className="flex items-center justify-between text-white z-10 max-w-7xl mx-auto w-full">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-200 truncate max-w-sm sm:max-w-md">
                {property.title}
              </h3>
              <span className="text-xs text-brand-gold font-medium">
                Photo {activeIndex + 1} of {images.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg transition-colors focus:outline-none"
              aria-label="Close Lightbox (Esc)"
            >
              &times;
            </button>
          </div>

          {/* Central Fullscreen Image Stage */}
          <div className="relative flex-1 flex items-center justify-center max-w-6xl mx-auto w-full my-4">
            <img
              src={images[activeIndex]}
              alt={`${property.title} - Fullscreen ${activeIndex + 1}`}
              className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl transition-opacity duration-200"
            />

            {/* Left / Right Nav Arrows inside Lightbox */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center text-xl transition-all"
                  aria-label="Previous photo (Left arrow)"
                >
                  &larr;
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center text-xl transition-all"
                  aria-label="Next photo (Right arrow)"
                >
                  &rarr;
                </button>
              </>
            )}
          </div>

          {/* Lightbox Bottom Thumbnails */}
          <div className="max-w-3xl mx-auto w-full flex items-center justify-center gap-2 overflow-x-auto py-2">
            {images.map((imgUrl, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                  index === activeIndex
                    ? 'border-brand-gold opacity-100 scale-105'
                    : 'border-transparent opacity-40 hover:opacity-80'
                }`}
                aria-label={`Jump to photo ${index + 1}`}
              >
                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

