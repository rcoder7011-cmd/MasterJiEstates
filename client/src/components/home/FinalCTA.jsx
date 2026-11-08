import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import Badge from '../ui/Badge.jsx';
import WhatsAppButton from '../common/WhatsAppButton.jsx';
import { COMPANY_CONFIG } from '../../config/companyConfig.js';

export default function FinalCTA() {
  const scrollToFeatured = (e) => {
    e.preventDefault();
    const el = document.getElementById('featured-properties');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative py-20 sm:py-24 bg-brand-navy-dark overflow-hidden text-white">
      {/* Decorative architectural background accents */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 100 100">
          <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="0.5" />
          <line x1="20" y1="100" x2="100" y2="20" stroke="currentColor" strokeWidth="0.5" />
          <line x1="40" y1="100" x2="100" y2="40" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Subtle gold radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(197, 160, 89, 0.12) 0%, rgba(10, 25, 47, 0) 70%)',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <Badge
            variant="outline"
            className="border-brand-gold/40 text-brand-gold bg-brand-gold/10 backdrop-blur-xs font-semibold px-3 py-1"
          >
            Start Your Property Journey
          </Badge>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white tracking-tight leading-tight mb-4">
          Let’s Find the Right Property for You.
        </h2>

        <p className="text-base sm:text-lg text-slate-300 font-light max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
          Whether you are exploring property opportunities or planning to sell, start your journey with MasterJiEstates. Clear information, professional coordination, and reliable guidance every step of the way.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
          <Link to="/properties" className="w-full sm:w-auto">
            <Button
              variant="gold"
              size="lg"
              className="w-full sm:w-auto shadow-gold"
            >
              Explore Properties
            </Button>
          </Link>

          <WhatsAppButton
            context="home"
            variant="solid"
            size="lg"
            className="w-full sm:w-auto shadow-md"
            label="Chat on WhatsApp"
          />

          <a
            href={`tel:${COMPANY_CONFIG.phoneClean}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-white/30 text-white hover:bg-white/10 hover:border-white transition-all w-full sm:w-auto"
          >
            <svg className="w-4 h-4 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>Call Advisor</span>
          </a>
        </div>

        {/* Supporting trust guarantees strip */}
        <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-gold"></span>
            <span>Direct Company & Brokerage Listings</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-gold"></span>
            <span>Physical Ground Verification</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-gold"></span>
            <span>Complete Pricing Transparency</span>
          </div>
        </div>
      </div>
    </section>
  );
}

