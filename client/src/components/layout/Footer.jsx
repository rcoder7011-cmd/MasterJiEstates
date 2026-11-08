import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo.jsx';
import UdyamBadge from '../common/UdyamBadge.jsx';
import { WhatsAppIcon } from '../common/WhatsAppButton.jsx';
import { COMPANY_CONFIG, getWhatsAppUrl } from '../../config/companyConfig.js';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-navy-dark text-slate-300 pt-16 pb-12 border-t border-brand-navy-light selection:bg-brand-gold selection:text-brand-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid: 5 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* Column 1: Company Introduction (4 cols on desktop) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Official Logo on Dark */}
            <Logo variant="on-dark" size="md" />

            {/* Tagline */}
            <p className="text-xs font-semibold text-brand-gold tracking-wide italic">
              "{COMPANY_CONFIG.tagline}"
            </p>

            {/* Real-Estate-Focused Description */}
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              MasterJiEstates is India's trusted digital real estate brokerage and asset platform. We specialize in verified residential and commercial properties, direct company assets, and transparent, legally scrutinized transaction coordination across the National Capital Region.
            </p>

            {/* Udyam Registered Enterprise Indicator */}
            <div className="pt-2">
              <UdyamBadge variant="footer" />
            </div>

            {/* Reserved Space for Official Social Media Handles (No Invented URLs) */}
            <div className="pt-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Connect With Us
              </span>
              <div className="flex items-center gap-2.5 text-xs text-slate-400">
                <a
                  href={getWhatsAppUrl('general')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#25D366] hover:text-white text-slate-300 flex items-center justify-center transition-colors"
                  title={`Chat on WhatsApp (${COMPANY_CONFIG.whatsappDisplay})`}
                  aria-label="WhatsApp"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                </a>

                <a
                  href={COMPANY_CONFIG.emailMailto}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-brand-gold hover:text-brand-navy text-slate-300 flex items-center justify-center transition-colors"
                  title={`Email us at ${COMPANY_CONFIG.email}`}
                  aria-label="Email"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>

                <a
                  href={COMPANY_CONFIG.phoneTel}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-brand-gold hover:text-brand-navy text-slate-300 flex items-center justify-center transition-colors"
                  title={`Call us at ${COMPANY_CONFIG.phoneDisplay}`}
                  aria-label="Phone"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links (2 cols on desktop) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/properties" className="hover:text-white transition-colors">
                  Properties
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Property Services (2 cols on desktop) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold">
              Property Services
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/properties" className="hover:text-white transition-colors">
                  Buy Property
                </Link>
              </li>
              <li>
                <Link to="/dashboard/listings/new" className="hover:text-white transition-colors">
                  Sell Property
                </Link>
              </li>
              <li>
                <Link to="/contact?subject=Property%20Consultation" className="hover:text-white transition-colors">
                  Property Consultation
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Home Loan Assistance
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Interior Design
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Information & Service Locations (4 cols on desktop) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold">
              Contact Information
            </h4>
            <div className="space-y-3 text-sm text-slate-300">
              {/* Phone (Clickable) */}
              <p className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-brand-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a
                  href={COMPANY_CONFIG.phoneTel}
                  className="text-white hover:text-brand-gold font-semibold transition-colors"
                  title="Call MasterJiEstates Helpline"
                >
                  Phone: {COMPANY_CONFIG.phoneDisplay}
                </a>
              </p>

              {/* WhatsApp (Clickable) */}
              <p className="flex items-center gap-2.5">
                <WhatsAppIcon className="w-4 h-4 text-[#25D366] flex-shrink-0" />
                <a
                  href={getWhatsAppUrl('general')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#25D366] hover:underline font-semibold transition-colors"
                  title="Chat with MasterJiEstates on WhatsApp"
                >
                  WhatsApp: {COMPANY_CONFIG.whatsappDisplay}
                </a>
              </p>

              {/* Email (Clickable) */}
              <p className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-brand-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a
                  href={COMPANY_CONFIG.emailMailto}
                  className="text-slate-200 hover:text-brand-gold transition-colors font-medium"
                  title="Send email to MasterJiEstates"
                >
                  Email: {COMPANY_CONFIG.email}
                </a>
              </p>

              {/* Office Location */}
              <p className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  Office: <strong className="text-white">{COMPANY_CONFIG.officeLocation}</strong>
                </span>
              </p>
            </div>

            {/* Service Locations */}
            <div className="pt-2 border-t border-white/10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Service Locations
              </span>
              <div className="flex flex-wrap gap-1.5 text-xs text-slate-300">
                {COMPANY_CONFIG.serviceAreas.map((city) => (
                  <span
                    key={city}
                    className="px-2 py-0.5 rounded-md bg-white/10 text-slate-200 font-medium border border-white/10"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Legal Links & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p className="text-center md:text-left">
            &copy; {currentYear} MasterJiEstates. All Rights Reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-slate-400">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-and-conditions" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/disclaimer" className="hover:text-white transition-colors">
              Disclaimer
            </Link>
            <Link to="/brokerage-policy" className="hover:text-white transition-colors">
              Brokerage Policy
            </Link>
            <Link to="/cookie-policy" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
