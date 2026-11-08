import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';

export default function PropertyCard({ property, onViewDetails }) {
  const isDirect = property.listingType === 'company_owned';

  return (
    <div className="flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-300">
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
        </div>

        {/* Price Tag Overlay at Bottom of Image */}
        <div className="absolute bottom-3 left-3 bg-brand-navy-dark/90 text-white font-bold text-base px-3 py-1 rounded-lg backdrop-blur-xs shadow-xs">
          {property.priceFormatted}
        </div>
      </div>

      {/* Property Information Body */}
      <div className="p-5 flex flex-col justify-between flex-grow space-y-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-brand-gold">
            {property.categoryLabel || property.category}
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
            <span className="truncate">{property.addressDisplay || property.location}</span>
          </div>
        </div>

        {/* Key Specifications Strip */}
        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-medium">Area</span>
            <span className="font-bold text-slate-800">{property.area} sq ft</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-medium">Layout</span>
            <span className="font-bold text-slate-800">
              {property.bedrooms ? `${property.bedrooms} BHK` : 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-medium">Baths</span>
            <span className="font-bold text-slate-800">
              {property.bathrooms ? `${property.bathrooms} Baths` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link to={`/properties/${property.id}`} className="block">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold justify-center"
            >
              View Details &rarr;
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
