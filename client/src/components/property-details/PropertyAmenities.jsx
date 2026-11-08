import React from 'react';

// Helper to choose appropriate SVG icon based on amenity name
function getAmenityIcon(name) {
  const lower = name.toLowerCase();

  if (lower.includes('power') || lower.includes('backup') || lower.includes('solar')) {
    return (
      <svg className="w-4 h-4 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  }
  if (lower.includes('park') || lower.includes('garage') || lower.includes('car')) {
    return (
      <svg className="w-4 h-4 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    );
  }
  if (lower.includes('security') || lower.includes('gated') || lower.includes('cctv') || lower.includes('intercom')) {
    return (
      <svg className="w-4 h-4 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    );
  }
  if (lower.includes('pool') || lower.includes('water')) {
    return (
      <svg className="w-4 h-4 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    );
  }
  if (lower.includes('clubhouse') || lower.includes('gym') || lower.includes('fitness')) {
    return (
      <svg className="w-4 h-4 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    );
  }
  if (lower.includes('elevator') || lower.includes('lift')) {
    return (
      <svg className="w-4 h-4 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }

  // Default checkmark icon
  return (
    <svg className="w-4 h-4 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function PropertyAmenities({ property }) {
  if (!property || !property.amenities || property.amenities.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-5">
      <h2 className="text-lg font-bold font-heading text-brand-navy flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-brand-gold" />
        Features & Key Amenities
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {property.amenities.map((amenity, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center flex-shrink-0 shadow-2xs">
              {getAmenityIcon(amenity)}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-800">
              {amenity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

