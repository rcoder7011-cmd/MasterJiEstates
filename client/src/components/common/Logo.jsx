import React from 'react';
import { Link } from 'react-router-dom';
import { COMPANY_CONFIG } from '../../config/companyConfig.js';

/**
 * Reusable Official Company Logo Component
 *
 * Strictly adheres to brand guidelines:
 * - Maintains 1536x1024 original proportions with object-fit: contain
 * - Never stretches or distorts
 * - High-contrast backdrop container when displayed on dark backgrounds
 * - Accessible alt text: "MasterJiEstates Official Logo"
 */
export default function Logo({
  variant = 'default', // 'default' (for light bgs), 'on-dark' (for dark bgs like footer), 'compact', 'emblem-only'
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  linkTo = '/',
  showText = true,
  className = '',
}) {
  // Sizing maps
  const heightClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-8 sm:h-9 lg:h-10',
    lg: 'h-12 sm:h-14',
    xl: 'h-16 sm:h-20',
  };

  const currentHeight = heightClasses[size] || heightClasses.md;

  const logoImage = (
    <img
      src={COMPANY_CONFIG.logoPath}
      alt={COMPANY_CONFIG.logoAlt}
      className={`w-auto ${currentHeight} object-contain transition-transform duration-200 group-hover:scale-[1.02] flex-shrink-0 ${
        variant === 'on-dark'
          ? 'bg-white/95 p-1 rounded-xl shadow-xs border border-white/20'
          : 'rounded-lg'
      }`}
      loading="eager"
    />
  );

  const brandText = showText && (
    <div className="flex flex-col min-w-0">
      <span
        className={`font-heading font-extrabold tracking-tight leading-none truncate ${
          variant === 'on-dark' ? 'text-white' : 'text-brand-navy'
        } ${size === 'sm' ? 'text-sm sm:text-base' : size === 'lg' ? 'text-xl' : 'text-base sm:text-lg'}`}
      >
        MasterJi<span className="text-brand-gold">Estates</span>
      </span>
      <span
        className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest mt-0.5 whitespace-nowrap ${
          variant === 'on-dark' ? 'text-brand-gold' : 'text-slate-500'
        }`}
      >
        Real Estate Advisory
      </span>
    </div>
  );

  const content = (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {logoImage}
      {brandText}
    </div>
  );

  if (linkTo) {
    return (
      <Link
        to={linkTo}
        className="inline-flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded-xl p-0.5"
        title="MasterJiEstates — Return to Homepage"
      >
        {content}
      </Link>
    );
  }

  return content;
}

