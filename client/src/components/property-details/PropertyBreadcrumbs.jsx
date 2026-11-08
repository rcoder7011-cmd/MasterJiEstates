import React from 'react';
import { Link } from 'react-router-dom';

export default function PropertyBreadcrumbs({ property }) {
  if (!property) return null;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 border-b border-slate-200/80 mb-6 text-xs">
      {/* Breadcrumb Path */}
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-slate-500 font-medium">
          <li>
            <Link to="/" className="hover:text-brand-navy transition-colors">
              Home
            </Link>
          </li>
          <li className="text-slate-400">/</li>
          <li>
            <Link to="/properties" className="hover:text-brand-navy transition-colors">
              Properties
            </Link>
          </li>
          <li className="text-slate-400">/</li>
          <li>
            <Link
              to={`/properties?city=${property.city}`}
              className="hover:text-brand-navy transition-colors"
            >
              {property.city}
            </Link>
          </li>
          <li className="text-slate-400">/</li>
          <li className="text-brand-navy font-bold truncate max-w-[200px] sm:max-w-xs md:max-w-md">
            {property.title}
          </li>
        </ol>
      </nav>

      {/* Back to Catalogue Action */}
      <Link
        to="/properties"
        className="inline-flex items-center gap-1.5 text-brand-navy hover:text-brand-gold font-semibold transition-colors flex-shrink-0"
      >
        <span>&larr;</span>
        <span>Back to Properties</span>
      </Link>
    </div>
  );
}

