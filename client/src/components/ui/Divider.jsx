import React from 'react';

export default function Divider({
  label = null,
  orientation = 'horizontal',
  className = '',
}) {
  if (orientation === 'vertical') {
    return <div className={`inline-block w-px self-stretch bg-slate-200/80 mx-2 ${className}`} />;
  }

  if (label) {
    return (
      <div className={`relative flex items-center justify-center my-6 ${className}`}>
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-200/80" />
        </div>
        <span className="relative z-10 bg-surface-primary px-3 text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>
    );
  }

  return <hr className={`border-0 border-t border-slate-200/80 my-4 ${className}`} />;
}

