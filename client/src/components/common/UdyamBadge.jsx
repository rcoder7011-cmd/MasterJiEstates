import React from 'react';
import { COMPANY_CONFIG } from '../../config/companyConfig.js';

/**
 * Professional Udyam Registration Indicator
 *
 * Displays the verified business registration status as supplied by the owner:
 * "Udyam Registered Enterprise" with an optional link to the official MSME Udyam portal.
 *
 * Adheres strictly to government disclosure ethics:
 * - No fake government seals or unofficial coats of arms
 * - No invented certificate numbers or categories
 * - No claims of government endorsement or title verification
 */
export default function UdyamBadge({
  variant = 'badge', // 'badge' (pill style), 'footer' (text with subtle indicator), 'card' (informative block)
  showLink = true,
  className = '',
}) {
  const linkProps = showLink
    ? {
        href: COMPANY_CONFIG.udyamPortalUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
        title: 'Verify Udyam Registration on the Official Government of India MSME Portal (opens in new tab)',
      }
    : {};

  const Element = showLink ? 'a' : 'div';

  if (variant === 'footer') {
    return (
      <Element
        {...linkProps}
        className={`inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-brand-gold transition-colors group ${className}`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20 animate-pulse" />
        <span className="font-semibold tracking-wide text-slate-200 group-hover:text-white">
          {COMPANY_CONFIG.udyamDisplayText}
        </span>
        {showLink && (
          <svg
            className="w-3 h-3 text-slate-400 group-hover:text-brand-gold transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        )}
      </Element>
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-800 space-y-1.5 ${className}`}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            MSME / Udyam Registration
          </span>
        </div>
        <p className="text-sm font-semibold text-brand-navy">
          {COMPANY_CONFIG.udyamDisplayText}
        </p>
        <p className="text-xs text-slate-600 leading-relaxed">
          Registered enterprise under the Ministry of Micro, Small and Medium Enterprises, Government of India.
        </p>
        {showLink && (
          <div className="pt-1">
            <Element
              {...linkProps}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-navy hover:text-brand-gold transition-colors"
            >
              <span>Official Udyam Portal</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Element>
          </div>
        )}
      </div>
    );
  }

  // Default 'badge' pill style
  return (
    <Element
      {...linkProps}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 hover:bg-emerald-500/20 transition-all group ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
      <span>{COMPANY_CONFIG.udyamDisplayText}</span>
      {showLink && (
        <svg
          className="w-3 h-3 text-emerald-600/70 group-hover:text-emerald-700 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      )}
    </Element>
  );
}

