import React from 'react';
import { Link } from 'react-router-dom';
import DeliveryBadge from './DeliveryBadge.jsx';
import WhatsAppButton from '../common/WhatsAppButton.jsx';

export default function ServiceCard({ service, onSelect }) {
  const {
    id,
    title,
    tagline,
    shortDesc,
    category,
    deliveryType,
    features = [],
    deliveryNote,
    ctaText = 'Inquire Now',
    ctaLink = '/contact',
  } = service;

  const isRealEstate = category === 'real_estate';

  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border transition-all duration-300 hover:shadow-card-hover p-6 sm:p-7 ${
        isRealEstate
          ? 'bg-gradient-to-b from-white to-slate-50/80 border-slate-200/90 shadow-card'
          : 'bg-white border-slate-200 shadow-xs'
      }`}
    >
      <div>
        {/* Header: Title & Delivery Type */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            {isRealEstate && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold bg-brand-navy/90 px-2 py-0.5 rounded-md mb-2 inline-block">
                Core Real Estate Service
              </span>
            )}
            <h3 className="text-xl font-heading font-bold text-brand-navy tracking-tight">
              {title}
            </h3>
          </div>
          <DeliveryBadge deliveryType={deliveryType} />
        </div>

        {/* Tagline */}
        {tagline && (
          <p className="text-xs font-semibold text-slate-500 mb-3 italic">
            "{tagline}"
          </p>
        )}

        {/* Short Description */}
        <p className="text-sm text-slate-600 leading-relaxed mb-5">
          {shortDesc}
        </p>

        {/* Features Checklist */}
        {features.length > 0 && (
          <div className="space-y-2 mb-6 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Key Capabilities:
            </span>
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                <svg
                  className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Notes & CTA */}
      <div className="pt-4 border-t border-slate-100 mt-auto">
        {deliveryNote && (
          <div className="mb-4 p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
            <svg
              className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="leading-snug">{deliveryNote}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {deliveryType === 'coming_soon' ? (
            <Link
              to={`/contact?subject=Waitlist%3A%20${encodeURIComponent(title)}`}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 transition-colors shadow-xs"
            >
              <span>{ctaText || 'Join Service Waitlist'}</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          ) : deliveryType === 'unavailable' ? (
            <button
              type="button"
              disabled
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 bg-slate-100 cursor-not-allowed text-center"
            >
              Service Currently Inactive
            </button>
          ) : (
            <Link
              to={ctaLink}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isRealEstate
                  ? 'bg-brand-navy hover:bg-brand-navy-light text-brand-gold'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <span>{ctaText}</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          )}

          {deliveryType !== 'unavailable' && (
            <WhatsAppButton
              context={
                id === 'buy' || id === 'buying'
                  ? 'service_buy'
                  : id === 'sell' || id === 'selling'
                  ? 'service_sell'
                  : id === 'home-loans' || id === 'loans'
                  ? 'service_loan'
                  : id === 'interior-design' || id === 'interiors' || id === 'architecture'
                  ? 'service_interior'
                  : 'services'
              }
              data={{ title }}
              variant="icon"
              size="sm"
              className="p-2.5 rounded-xl border border-emerald-500/30 shrink-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}

