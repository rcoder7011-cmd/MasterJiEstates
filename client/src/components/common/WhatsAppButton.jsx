import React from 'react';
import { getWhatsAppUrl, COMPANY_CONFIG } from '../../config/companyConfig.js';

/**
 * Authentic WhatsApp Brand SVG Icon
 */
export function WhatsAppIcon({ className = 'w-5 h-5', fill = 'currentColor' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.59 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.02 8.48 7.02 9.71C7.02 10.93 7.91 12.11 8.03 12.27C8.16 12.44 9.77 14.93 12.25 16C12.84 16.26 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.69 16.03 16.9 15.45C17.11 14.86 17.11 14.36 17.05 14.25C16.98 14.15 16.82 14.09 16.58 13.97C16.34 13.85 15.17 13.27 14.95 13.19C14.74 13.11 14.58 13.07 14.42 13.31C14.26 13.56 13.8 14.09 13.66 14.25C13.52 14.42 13.38 14.44 13.14 14.32C12.9 14.2 11.89 13.87 10.69 12.8C9.76 11.97 9.13 10.94 8.95 10.63C8.77 10.32 8.93 10.15 9.05 10.03C9.16 9.92 9.3 9.73 9.44 9.57C9.58 9.41 9.63 9.29 9.72 9.11C9.81 8.93 9.76 8.77 9.7 8.65C9.64 8.53 9.18 7.39 8.99 6.93C8.8 6.49 8.61 6.55 8.47 6.54C8.34 6.54 8.18 6.54 8.02 6.54L8.53 7.33Z" />
    </svg>
  );
}

/**
 * Reusable WhatsApp CTA Button
 *
 * Directs visitors to the official WhatsApp channel (+91 7011202089) with a
 * pre-filled contextual message based on the source page or property.
 */
export default function WhatsAppButton({
  context = 'general',
  data = {},
  variant = 'solid', // 'solid', 'outline', 'pill', 'compact', 'icon'
  size = 'md', // 'sm', 'md', 'lg'
  label = 'Chat on WhatsApp',
  className = '',
}) {
  const url = getWhatsAppUrl(context, data);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs sm:text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm sm:text-base gap-2.5',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4 sm:w-5 sm:h-5',
    lg: 'w-5 h-5 sm:w-6 sm:h-6',
  };

  const variantStyles = {
    solid:
      'bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold shadow-sm hover:shadow-md transition-all active:scale-95',
    outline:
      'border border-[#25D366] text-[#128C7E] hover:bg-[#25D366]/10 font-bold transition-all active:scale-95',
    pill:
      'bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all active:scale-95',
    compact:
      'bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#075E54] font-semibold rounded-lg transition-colors',
    icon:
      'p-2 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-md hover:shadow-lg transition-all active:scale-95',
  };

  if (variant === 'icon') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat with MasterJiEstates on WhatsApp: ${COMPANY_CONFIG.whatsappDisplay}`}
        className={`inline-flex items-center justify-center ${variantStyles.icon} ${className}`}
        title={`Chat with MasterJiEstates on WhatsApp: ${COMPANY_CONFIG.whatsappDisplay}`}
      >
        <WhatsAppIcon className={iconSizes[size] || iconSizes.md} />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center rounded-xl ${sizeClasses[size] || sizeClasses.md} ${
        variantStyles[variant] || variantStyles.solid
      } ${className}`}
      title={`Chat with MasterJiEstates on WhatsApp: ${COMPANY_CONFIG.whatsappDisplay}`}
    >
      <WhatsAppIcon className={iconSizes[size] || iconSizes.md} />
      <span>{label}</span>
    </a>
  );
}

