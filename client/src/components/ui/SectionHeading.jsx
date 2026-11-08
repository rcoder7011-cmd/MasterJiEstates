import React from 'react';
import Badge from './Badge.jsx';

export default function SectionHeading({
  badge = null,
  title,
  subtitle = null,
  action = null,
  align = 'left',
  className = '',
}) {
  const isCentered = align === 'center';

  return (
    <div
      className={`w-full flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 ${className} ${
        isCentered ? 'text-center md:flex-col md:items-center' : ''
      }`}
    >
      <div className={`space-y-1.5 ${isCentered ? 'max-w-2xl mx-auto' : 'max-w-2xl'}`}>
        {badge && (
          <div className="mb-2">
            <Badge variant="brand" size="sm">
              {badge}
            </Badge>
          </div>
        )}

        <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy tracking-tight">
          {title}
        </h2>

        {subtitle && (
          <p className="text-sm sm:text-base text-slate-500 font-normal leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className={`flex-shrink-0 ${isCentered ? 'mt-2' : ''}`}>
          {action}
        </div>
      )}
    </div>
  );
}

