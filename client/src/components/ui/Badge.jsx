import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center gap-1.5 font-semibold rounded-pill tracking-wide select-none';

  const sizeStyles = {
    sm: 'text-[10px] py-0.5 px-2',
    md: 'text-xs py-1 px-2.5',
    lg: 'text-sm py-1.5 px-3',
  };

  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    brand: 'bg-brand-navy text-brand-gold border border-brand-gold/30',
    direct: 'bg-[#0F2444] text-[#F4E8C1] border border-[#C5A059]/40 shadow-xs',
    brokerage: 'bg-slate-800 text-amber-300 border border-amber-400/30',
  };

  const dotColors = {
    default: 'bg-slate-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    brand: 'bg-brand-gold',
    direct: 'bg-[#C5A059]',
    brokerage: 'bg-amber-400',
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.default} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || 'bg-current'} animate-pulse`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

