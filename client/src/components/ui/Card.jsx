import React from 'react';

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className = '',
  onClick,
  ...props
}) {
  const baseStyles = 'transition-all duration-200 overflow-hidden';

  const variantStyles = {
    default: 'bg-white border border-slate-200/80 rounded-xl shadow-subtle',
    elevated: 'bg-white border border-slate-100 rounded-2xl shadow-card',
    outlined: 'bg-white border border-slate-300 rounded-xl',
    neumorphic: 'neumorphic-card',
    glass: 'liquid-glass rounded-2xl',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hoverable
    ? 'hover:-translate-y-1 hover:shadow-elevated cursor-pointer'
    : '';

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.default} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

