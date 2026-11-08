import React from 'react';

export default function Input({
  id,
  name,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  success,
  helperText,
  required = false,
  disabled = false,
  icon = null,
  endIcon = null,
  variant = 'default',
  className = '',
  ...props
}) {
  const inputId = id || name || Math.random().toString(36).substring(7);
  const helperId = `${inputId}-helper`;

  const baseInputStyles = 'w-full text-sm text-slate-800 placeholder-slate-400 transition-all duration-200 focus:outline-none';
  
  let variantStyles = '';
  if (variant === 'neumorphic') {
    variantStyles = 'neumorphic-inset px-4 py-2.5 focus:border-brand-navy';
  } else {
    // Default outlined style
    variantStyles = 'bg-white border rounded-md px-3.5 py-2.5 shadow-sm focus:ring-2 focus:ring-offset-0';
    if (error) {
      variantStyles += ' border-red-500 focus:border-red-500 focus:ring-red-100 text-red-900';
    } else if (success) {
      variantStyles += ' border-emerald-500 focus:border-emerald-500 focus:ring-emerald-100';
    } else {
      variantStyles += ' border-slate-300 focus:border-brand-navy focus:ring-slate-100 hover:border-slate-400';
    }
  }

  const disabledStyles = disabled ? 'bg-slate-100 opacity-60 cursor-not-allowed select-none' : '';

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-red-500 ml-1" title="Required">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={helperText || error ? helperId : undefined}
          className={`${baseInputStyles} ${variantStyles} ${icon ? 'pl-9' : ''} ${endIcon ? 'pr-9' : ''} ${disabledStyles}`}
          {...props}
        />

        {endIcon && (
          <div className="absolute right-3 flex items-center text-slate-400">
            {endIcon}
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p
          id={helperId}
          className={`text-xs mt-0.5 ${error ? 'text-red-600 font-medium' : 'text-slate-500'}`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}

