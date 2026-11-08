import React from 'react';

export default function PropertyDescription({ property }) {
  if (!property) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-5">
      <h2 className="text-lg font-bold font-heading text-brand-navy flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-brand-gold" />
        Detailed Property Description
      </h2>

      {/* Highlight Tagline Banner */}
      {property.tagline && (
        <div className="p-4 bg-gradient-to-r from-brand-navy/5 via-brand-gold/10 to-transparent border-l-4 border-brand-gold rounded-r-xl">
          <p className="text-xs sm:text-sm font-semibold text-brand-navy italic">
            &ldquo;{property.tagline}&rdquo;
          </p>
        </div>
      )}

      {/* Main Narrative */}
      <div className="prose prose-sm text-slate-700 leading-relaxed font-light space-y-3">
        <p>{property.description}</p>
        <p>
          Managed under MasterJiEstates&apos; standard operational protocol, this listing features coordinated site visits, verified perimeter demarcation, and comprehensive transaction advisory support.
        </p>
      </div>

      {/* Important Advisory Footnote */}
      <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          Information presented reflects available catalogue records. On-site verification and deed review are facilitated during escorted visits.
        </span>
      </div>
    </div>
  );
}

