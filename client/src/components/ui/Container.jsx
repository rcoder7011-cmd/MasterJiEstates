import React from 'react';

export default function Container({
  children,
  size = 'xl',
  className = '',
  ...props
}) {
  const sizeStyles = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${sizeStyles[size] || sizeStyles.xl} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

