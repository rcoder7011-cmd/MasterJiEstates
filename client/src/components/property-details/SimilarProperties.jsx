import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import { getSimilarProperties } from '../../data/demoProperties.js';

export default function SimilarProperties({ currentProperty }) {
  if (!currentProperty) return null;

  const similar = getSimilarProperties(currentProperty, 3);

  if (similar.length === 0) return null;

  return (
    <section className="mt-12 pt-10 border-t border-slate-200/80 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-brand-navy">
            Similar Properties You May Like
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-light mt-0.5">
            Explore related opportunities in {currentProperty.city} and matching categories.
          </p>
        </div>

        <Link to="/properties">
          <Button variant="outline" size="sm" className="text-xs font-semibold">
            View Full Catalogue &rarr;
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {similar.map((prop) => {
          const isDirect = prop.listingType === 'company_owned';
          return (
            <div
              key={prop.id}
              className="flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-300"
            >
              {/* Image & Badges */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={prop.imageUrl}
                  alt={prop.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />

                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <Badge variant={isDirect ? 'direct' : 'brokerage'} size="sm" dot>
                    {prop.listingTypeLabel}
                  </Badge>
                  <Badge
                    variant="default"
                    size="sm"
                    className="bg-slate-900/70 text-slate-200 backdrop-blur-xs border-0 text-[10px]"
                  >
                    Illustrative Listing
                  </Badge>
                </div>

                <div className="absolute bottom-3 left-3 bg-brand-navy-dark/95 text-white font-bold text-sm px-3 py-1 rounded-lg backdrop-blur-xs">
                  {prop.priceFormatted}
                </div>
              </div>

              {/* Information */}
              <div className="p-4 flex flex-col justify-between flex-grow space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-brand-gold">
                    <span>{prop.categoryLabel}</span>
                    <span className="text-slate-400 font-semibold">{prop.city}</span>
                  </div>

                  <h3 className="text-sm font-bold text-brand-navy mt-1 line-clamp-2 leading-snug font-heading">
                    {prop.title}
                  </h3>

                  <div className="text-xs text-slate-500 mt-1 truncate">
                    📍 {prop.locality}, {prop.city}
                  </div>
                </div>

                {/* Specs Strip */}
                <div className="grid grid-cols-3 gap-1 py-1.5 px-2 bg-slate-50 rounded-lg text-center text-[11px] border border-slate-100">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block">Area</span>
                    <span className="font-bold text-slate-800">{prop.area} sq ft</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block">BHK</span>
                    <span className="font-bold text-slate-800">{prop.bedrooms ? `${prop.bedrooms} BHK` : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block">Baths</span>
                    <span className="font-bold text-slate-800">{prop.bathrooms || 'N/A'}</span>
                  </div>
                </div>

                {/* View Details Action */}
                <Link
                  to={`/properties/${prop.id}`}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="block pt-1"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-semibold justify-center py-1.5"
                  >
                    View Details &rarr;
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

