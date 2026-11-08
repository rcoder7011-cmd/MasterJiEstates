import React from 'react';

export default function PropertyLocation({ property }) {
  if (!property) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-lg font-bold font-heading text-brand-navy flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-gold" />
          Location & Neighborhood
        </h2>
        <span className="text-xs text-slate-500 font-medium">
          {property.locality}, {property.city}
        </span>
      </div>

      {/* Styled Static Map Preview Mockup (No Live External Google Maps API) */}
      <div className="relative h-60 sm:h-72 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
        {/* Subtle decorative grid canvas mimicking street maps */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(#0A192F 1px, transparent 1px), radial-gradient(#0A192F 1px, #FAF9F6 1px)`,
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
          }}
        />

        {/* Abstract road lines */}
        <svg className="absolute inset-0 w-full h-full opacity-15 stroke-brand-navy" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="35%" x2="100%" y2="35%" strokeWidth="8" />
          <line x1="40%" y1="0" x2="40%" y2="100%" strokeWidth="8" />
          <line x1="0" y1="80%" x2="100%" y2="60%" strokeWidth="4" />
          <line x1="70%" y1="0" x2="70%" y2="100%" strokeWidth="4" />
          <circle cx="40%" cy="35%" r="48" fill="none" strokeWidth="2" strokeDasharray="4 4" />
        </svg>

        {/* Centered Location Pin Marker */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <span className="absolute w-12 h-12 rounded-full bg-brand-gold/30 animate-ping" />
            <div className="w-11 h-11 rounded-full bg-brand-navy text-white flex items-center justify-center shadow-lg border-2 border-brand-gold">
              <svg className="w-5 h-5 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="mt-2.5 bg-brand-navy-dark text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md border border-white/20 text-center max-w-xs">
            <span className="block text-brand-gold font-bold">{property.locality}</span>
            <span className="text-[10px] text-slate-300 font-light">{property.city} Region</span>
          </div>
        </div>

        {/* Static Map Label at bottom right */}
        <div className="absolute bottom-3 right-3 bg-white/90 text-slate-600 text-[10px] px-2.5 py-1 rounded-md font-semibold backdrop-blur-xs border border-slate-200 shadow-2xs">
          Indicative Locality Map
        </div>
      </div>

      {/* Connectivity Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs space-y-1">
          <span className="text-slate-400 font-bold uppercase text-[10px] block">Public Transit</span>
          <span className="font-semibold text-slate-800 block">Metro & Bus Connectivity</span>
          <p className="text-[11px] text-slate-500 font-light">Proximity to primary transit arterial corridors in {property.city}.</p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs space-y-1">
          <span className="text-slate-400 font-bold uppercase text-[10px] block">Commercial Access</span>
          <span className="font-semibold text-slate-800 block">Retail & Business Hubs</span>
          <p className="text-[11px] text-slate-500 font-light">Convenient distance to neighborhood shopping and banking.</p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs space-y-1">
          <span className="text-slate-400 font-bold uppercase text-[10px] block">Site Access</span>
          <span className="font-semibold text-slate-800 block">Escorted Visit Route</span>
          <p className="text-[11px] text-slate-500 font-light">Dedicated meeting point coordinated by MasterJi property managers.</p>
        </div>
      </div>

      {/* Strict Privacy & Owner Protection Guarantee Banner */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-3 text-xs text-slate-600">
        <div className="p-1.5 bg-brand-navy rounded-lg text-brand-gold flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="space-y-1">
          <span className="font-bold text-brand-navy block">
            Owner Privacy & Escorted Access Policy
          </span>
          <p className="text-[11px] leading-relaxed text-slate-500 font-light">
            To prevent spam calls and protect owner privacy, specific house numbers and personal owner details are not published online. All inspections and documentation verifications are conducted in-person by MasterJiEstates certified executives.
          </p>
        </div>
      </div>
    </div>
  );
}

