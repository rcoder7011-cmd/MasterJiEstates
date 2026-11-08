import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import { useFavourites } from '../../context/FavouritesContext.jsx';

export default function PropertyOverview({ property, onRequestSiteVisit }) {
  const navigate = useNavigate();
  const { isFavourite, toggleFavourite } = useFavourites();
  const propertyKey = property.id || property.demoId || property.slug;
  const isFavorited = isFavourite(propertyKey);
  const [shareToast, setShareToast] = useState(false);

  const pricePerSqFt = property.area && property.price
    ? Math.round(property.price / property.area)
    : null;

  const handleToggleFavorite = async () => {
    const res = await toggleFavourite(propertyKey);
    if (res?.requiresAuth) {
      navigate('/login');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${property.title} | MasterJiEstates`,
      text: `Explore this verified property in ${property.locality}, ${property.city}: ${property.priceFormatted}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-6">
      {/* Top Meta Line: Category, City, & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">
            {property.categoryLabel}
          </span>
          <span className="text-slate-300">&bull;</span>
          <span className="text-xs font-semibold text-slate-500">
            {property.city}
          </span>
        </div>

        {/* Favorite & Share Buttons */}
        <div className="flex items-center gap-2">
          {/* Share Button with Fallback */}
          <div className="relative">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
              aria-label="Share this property"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Share</span>
            </button>

            {/* Share Confirmation Toast */}
            {shareToast && (
              <div className="absolute right-0 top-full mt-2 z-20 px-3 py-1.5 bg-brand-navy text-white text-xs rounded-lg shadow-lg whitespace-nowrap animate-fade-in flex items-center gap-1.5 border border-white/20">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Link copied to clipboard!</span>
              </div>
            )}
          </div>

          {/* Favorite Heart Button */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-xs ${
              isFavorited
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
          >
            <svg
              className={`w-4 h-4 ${isFavorited ? 'fill-current' : 'fill-none stroke-current stroke-2'}`}
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>{isFavorited ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Property Title & Public Address */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading text-brand-navy leading-tight tracking-tight">
          {property.title}
        </h1>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
          <svg className="w-4 h-4 text-brand-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-medium text-slate-700">{property.addressDisplay || `${property.locality}, ${property.city}`}</span>
        </div>
      </div>

      {/* Pricing Strip & Quick Actions */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        {/* Price & Unit Rate */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            Listed Price
          </span>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-bold font-heading text-brand-navy">
              {property.priceFormatted}
            </span>
            {pricePerSqFt && (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                ≈ ₹{pricePerSqFt.toLocaleString('en-IN')}/sq ft
              </span>
            )}
          </div>
        </div>

        {/* Request Site Visit Button */}
        <div>
          <Button
            variant="gold"
            size="md"
            className="shadow-gold font-semibold"
            onClick={onRequestSiteVisit}
          >
            <span className="mr-1.5">📅</span>
            <span>Request a Site Visit</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

