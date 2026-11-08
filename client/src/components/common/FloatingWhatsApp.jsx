import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { WhatsAppIcon } from './WhatsAppButton.jsx';
import { getWhatsAppUrl, COMPANY_CONFIG } from '../../config/companyConfig.js';

/**
 * Global Floating WhatsApp Action Widget
 *
 * Automatically detects the visitor's current route to pre-fill the most relevant
 * inquiry message when clicked. Renders on all public pages while remaining unobtrusive.
 */
export default function FloatingWhatsApp() {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  // Do not render on private dashboard or admin back-office panels
  if (
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/dashboard')
  ) {
    return null;
  }

  // Determine context from current URL pathname
  let context = 'general';
  if (location.pathname === '/') {
    context = 'home';
  } else if (location.pathname.startsWith('/properties')) {
    context = 'properties';
  } else if (location.pathname.startsWith('/services')) {
    context = 'services';
  } else if (location.pathname.startsWith('/contact')) {
    context = 'contact';
  } else if (location.pathname.startsWith('/about')) {
    context = 'about';
  }

  const whatsappUrl = getWhatsAppUrl(context);

  const isPropertyDetails =
    location.pathname.startsWith('/properties/') && location.pathname !== '/properties';
  const bottomClass = isPropertyDetails ? 'bottom-20 sm:bottom-6' : 'bottom-5 sm:bottom-6';

  return (
    <aside
      aria-label="Instant WhatsApp Contact"
      className={`fixed ${bottomClass} right-4 sm:right-6 z-40 flex items-center gap-3 select-none`}
    >
      {/* Tooltip Pill (Desktop & Hover/Focus) */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 text-slate-800 text-xs font-semibold shadow-lg border border-slate-200/80 backdrop-blur-sm transition-all duration-200 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-90 -translate-x-1'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Chat on WhatsApp</span>
        <span className="text-[11px] text-slate-400 font-normal">
          ({COMPANY_CONFIG.whatsappDisplay})
        </span>
      </a>

      {/* Circular Floating Brand Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open WhatsApp chat with MasterJiEstates at ${COMPANY_CONFIG.whatsappDisplay}`}
        className="relative group w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40"
      >
        {/* Subtle Pulse Ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25 pointer-events-none" />

        <WhatsAppIcon className="w-7 h-7 relative z-10 transition-transform group-hover:scale-110" />
      </a>
    </aside>
  );
}

