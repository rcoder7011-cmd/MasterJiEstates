import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none';

  const sizeStyles = {
    sm: 'text-xs py-1.5 px-3 gap-1.5',
    md: 'text-sm py-2 px-4 gap-2',
    lg: 'text-base py-3 px-6 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-brand-navy text-white hover:bg-brand-navy-light focus-visible:ring-brand-navy active:scale-[0.98] shadow-sm',
    secondary: 'bg-brand-gold text-brand-navy font-semibold hover:bg-brand-gold-dark focus-visible:ring-brand-gold active:scale-[0.98] shadow-sm',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-brand-navy focus-visible:ring-brand-navy active:scale-[0.98]',
    ghost: 'text-brand-navy hover:bg-slate-100 focus-visible:ring-brand-navy active:scale-[0.98]',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 active:scale-[0.98]',
    neumorphic: 'neumorphic-btn text-brand-navy focus-visible:ring-brand-navy',
  };

  const disabledStyles = (disabled || loading) ? 'opacity-60 cursor-not-allowed pointer-events-none' : '';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${disabledStyles} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

