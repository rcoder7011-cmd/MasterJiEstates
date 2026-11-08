import React from 'react';

export default function PropertySpecifications({ property }) {
  if (!property) return null;

  // Build specifications list dynamically based on fields that actually exist
  const specs = [];

  if (property.area) {
    specs.push({
      label: 'Carpet Area',
      value: `${property.area.toLocaleString('en-IN')} ${property.areaUnit || 'sq ft'}`,
      icon: (
        <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      ),
    });
  }

  if (property.bedrooms !== null && property.bedrooms !== undefined) {
    specs.push({
      label: 'Bedrooms',
      value: `${property.bedrooms} BHK Layout`,
      icon: (
        <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    });
  }

  if (property.bathrooms !== null && property.bathrooms !== undefined) {
    specs.push({
      label: 'Bathrooms',
      value: `${property.bathrooms} Bathroom(s)`,
      icon: (
        <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    });
  }

  if (property.parking !== null && property.parking !== undefined) {
    specs.push({
      label: 'Parking',
      value: `${property.parking} Dedicated Slot(s)`,
      icon: (
        <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    });
  }

  if (property.furnishing) {
    specs.push({
      label: 'Furnishing Status',
      value: property.furnishing,
      icon: (
        <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    });
  }

  if (property.floor) {
    specs.push({
      label: 'Floor / Level',
      value: property.floor,
      icon: (
        <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    });
  }

  if (property.facing) {
    specs.push({
      label: 'Facing Direction',
      value: property.facing,
      icon: (
        <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      ),
    });
  }

  specs.push({
    label: 'Property Category',
    value: property.categoryLabel,
    icon: (
      <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-5">
      <h2 className="text-lg font-bold font-heading text-brand-navy flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-brand-gold" />
        Property Specifications & Overview
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {specs.map((item, idx) => (
          <div
            key={idx}
            className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-col justify-between space-y-2 hover:bg-slate-100/70 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {item.label}
              </span>
              <div className="p-1 rounded-lg bg-white border border-slate-200/60 shadow-2xs">
                {item.icon}
              </div>
            </div>
            <div className="text-sm font-bold text-slate-900 leading-snug">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

