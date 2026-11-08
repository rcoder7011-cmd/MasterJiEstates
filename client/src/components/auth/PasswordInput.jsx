import React, { useState } from 'react';

export default function PasswordInput({
  id,
  name,
  label = 'Password',
  placeholder = '••••••••',
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || name || 'password-input';
  const helperId = `${inputId}-helper`;

  const toggleVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            {label}
            {required && <span className="text-red-500 ml-1" title="Required">*</span>}
          </label>
        </div>
      )}

      <div className="relative flex items-center">
        <input
          id={inputId}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={helperText || error ? helperId : undefined}
          className={`w-full text-sm text-slate-800 placeholder-slate-400 bg-white border rounded-md px-3.5 py-2.5 pr-11 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-100 text-red-900'
              : 'border-slate-300 focus:border-brand-navy focus:ring-slate-100 hover:border-slate-400'
          } ${disabled ? 'bg-slate-100 opacity-60 cursor-not-allowed' : ''}`}
          {...props}
        />

        <button
          type="button"
          onClick={toggleVisibility}
          disabled={disabled}
          className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy rounded transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            // Eye Off SVG Icon
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
              />
            </svg>
          ) : (
            // Eye On SVG Icon
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
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

