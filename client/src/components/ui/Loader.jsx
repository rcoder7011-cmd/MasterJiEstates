import React from 'react';

export default function Loader({
  variant = 'spinner',
  size = 'md',
  color = 'navy',
  className = '',
  label = null,
}) {
  const sizeMap = {
    sm: { spinner: 'w-4 h-4', dot: 'w-1.5 h-1.5' },
    md: { spinner: 'w-8 h-8', dot: 'w-2.5 h-2.5' },
    lg: { spinner: 'w-12 h-12', dot: 'w-3.5 h-3.5' },
  };

  const colorMap = {
    navy: 'text-brand-navy',
    gold: 'text-brand-gold',
    white: 'text-white',
  };

  if (variant === 'skeleton') {
    return (
      <div
        className={`animate-pulse bg-slate-200/80 rounded-md ${className}`}
        aria-hidden="true"
      />
    );
  }

  if (variant === 'dots') {
    const dotSize = sizeMap[size]?.dot || sizeMap.md.dot;
    const dotColor = color === 'gold' ? 'bg-brand-gold' : 'bg-brand-navy';
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`} role="status">
        <span className={`${dotSize} ${dotColor} rounded-full animate-bounce [animation-delay:-0.3s]`} />
        <span className={`${dotSize} ${dotColor} rounded-full animate-bounce [animation-delay:-0.15s]`} />
        <span className={`${dotSize} ${dotColor} rounded-full animate-bounce`} />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Default Spinner
  const spinnerSize = sizeMap[size]?.spinner || sizeMap.md.spinner;
  const spinnerColor = colorMap[color] || colorMap.navy;

  return (
    <div className={`inline-flex flex-col items-center justify-center gap-2 ${className}`} role="status">
      <svg
        className={`animate-spin ${spinnerSize} ${spinnerColor}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3.5"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {label && <span className="text-xs font-medium text-slate-500">{label}</span>}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

