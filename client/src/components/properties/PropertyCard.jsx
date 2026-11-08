import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import WhatsAppButton from '../common/WhatsAppButton.jsx';
import { useFavourites } from '../../context/FavouritesContext.jsx';

export default function PropertyCard({
  property,
  onViewDetails,
  view = 'grid',
}) {
  const navigate = useNavigate();
  const { isFavourite, toggleFavourite } = useFavourites();
  const propertyKey = property.id || property.demoId || property.slug;
  const isFavorited = isFavourite(propertyKey);

  const isDirect = property.listingType === 'company_owned';
  const isUnderNegotiation = property.availabilityStatus === 'under_negotiation';

  // Calculate price per square foot if area is available
  const pricePerSqFt = property.area && property.price
    ? Math.round(property.price / property.area)
    : null;

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggleFavourite(propertyKey);
    if (result?.requiresAuth) {
      navigate('/login');
    }
  };

  // --- LIST VIEW LAYOUT ---
  if (view === 'list') {
    return (
      <article className="flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-subtle hover:shadow-card hover:-translate-y-0.5 transition-all duration-300">
        {/* Imagery Section */}
        <div className="relative md:w-80 h-56 md:h-auto flex-shrink-0 overflow-hidden bg-slate-100">
          <Link to={`/properties/${property.id}`} className="block w-full h-full">
            <img
              src={property.imageUrl}
              alt={property.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </Link>

          {/* Badges on Image */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 pointer-events-none">
            <Badge variant={isDirect ? 'direct' : 'brokerage'} size="sm" dot>
              {property.listingTypeLabel}
            </Badge>
            <Badge
              variant={isUnderNegotiation ? 'warning' : 'success'}
              size="sm"
            >
              {property.availabilityLabel}
            </Badge>
          </div>

          {/* Heart Button */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md shadow-xs transition-colors z-10 ${
              isFavorited
                ? 'bg-rose-50 text-rose-600'
                : 'bg-white/90 text-slate-600 hover:text-rose-500'
            }`}
            aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
          >
            <svg
              className={`w-4 h-4 ${isFavorited ? 'fill-current' : 'fill-none stroke-current stroke-2'}`}
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>

        {/* Content Section */}
        <div className="p-5 md:p-6 flex flex-col justify-between flex-grow space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-gold">
                {property.categoryLabel || property.category}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {property.city}
              </span>
            </div>

            <Link to={`/properties/${property.id}`} className="group">
              <h3 className="text-lg font-bold text-brand-navy leading-snug font-heading group-hover:text-brand-gold transition-colors">
                {property.title}
              </h3>
            </Link>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
              <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{property.locality}, {property.city}</span>
            </div>

            <p className="text-xs text-slate-600 line-clamp-2 mt-2 font-light">
              {property.description}
            </p>
          </div>

          {/* Specs & Pricing Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
            {/* Specs row */}
            <div className="flex items-center gap-4 text-xs text-slate-700">
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-medium">Area:</span>
                <span className="font-bold text-slate-900">{property.area} sq ft</span>
              </div>

              {property.bedrooms !== null && (
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 font-medium">Layout:</span>
                  <span className="font-bold text-slate-900">{property.bedrooms} BHK</span>
                </div>
              )}

              {property.bathrooms !== null && (
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 font-medium">Baths:</span>
                  <span className="font-bold text-slate-900">{property.bathrooms}</span>
                </div>
              )}

              {property.furnishing && (
                <div className="hidden sm:flex items-center gap-1">
                  <span className="text-slate-400 font-medium">Furnishing:</span>
                  <span className="font-semibold text-slate-800">{property.furnishing}</span>
                </div>
              )}
            </div>

            {/* Price & Action */}
            <div className="flex items-center gap-3">
              <div>
                <div className="text-lg font-bold text-brand-navy leading-none">
                  {property.priceFormatted}
                </div>
                {pricePerSqFt && (
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                    ₹{pricePerSqFt.toLocaleString('en-IN')}/sq ft
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <WhatsAppButton
                  context="property_details"
                  data={{
                    title: property.title,
                    locality: property.locality,
                    city: property.city,
                    priceFormatted: property.priceFormatted,
                    id: property.id,
                  }}
                  variant="icon"
                  size="sm"
                />

                <Link to={`/properties/${property.id}`}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs font-semibold px-4"
                  >
                    View Details &rarr;
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // --- GRID VIEW LAYOUT (DEFAULT) ---
  return (
    <article className="flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-300">
      {/* Property Imagery & Badges */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-100">
        <Link to={`/properties/${property.id}`} className="block w-full h-full">
          <img
            src={property.imageUrl}
            alt={property.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
          <Badge variant={isDirect ? 'direct' : 'brokerage'} size="sm" dot>
            {property.listingTypeLabel}
          </Badge>
          <Badge
            variant={isUnderNegotiation ? 'warning' : 'success'}
            size="sm"
          >
            {property.availabilityLabel}
          </Badge>
        </div>

        {/* Heart Favorite Icon */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          className={`absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md shadow-xs transition-colors z-10 ${
            isFavorited
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/90 text-slate-600 hover:text-rose-500'
          }`}
          aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
        >
          <svg
            className={`w-4 h-4 ${isFavorited ? 'fill-current' : 'fill-none stroke-current stroke-2'}`}
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        {/* Price Tag Overlay at Bottom Left */}
        <div className="absolute bottom-3 left-3 bg-brand-navy-dark/95 text-white font-bold text-sm px-3 py-1 rounded-lg backdrop-blur-xs shadow-xs">
          {property.priceFormatted}
        </div>
      </div>

      {/* Property Information Body */}
      <div className="p-5 flex flex-col justify-between flex-grow space-y-3.5">
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-brand-gold">
            <span>{property.categoryLabel || property.category}</span>
            <span className="text-slate-400 font-semibold">{property.city}</span>
          </div>

          <Link to={`/properties/${property.id}`} className="group">
            <h3 className="text-base font-bold text-brand-navy mt-1 line-clamp-2 leading-snug font-heading group-hover:text-brand-gold transition-colors">
              {property.title}
            </h3>
          </Link>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{property.locality}, {property.city}</span>
          </div>
        </div>

        {/* Key Specifications Strip */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-medium">Area</span>
            <span className="font-bold text-slate-800">{property.area} sq ft</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-medium">Layout</span>
            <span className="font-bold text-slate-800">
              {property.bedrooms !== null ? `${property.bedrooms} BHK` : 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-medium">Baths</span>
            <span className="font-bold text-slate-800">
              {property.bathrooms !== null ? `${property.bathrooms} Baths` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Action Button & Rate Info */}
        <div className="pt-1 flex items-center justify-between gap-2">
          {pricePerSqFt ? (
            <span className="text-[11px] font-medium text-slate-400">
              ≈ ₹{pricePerSqFt.toLocaleString('en-IN')}/sq ft
            </span>
          ) : <span />}

          <Link to={`/properties/${property.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold px-3 py-1.5"
            >
              View Details &rarr;
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
