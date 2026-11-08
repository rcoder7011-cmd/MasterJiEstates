import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import Badge from '../components/ui/Badge.jsx';

export default function AuthLayout({
  children,
  badgeText = 'Secure Client Access',
  pageTitle = 'MasterJiEstates',
  pageSubtitle = 'Access your unified real estate buying and selling portal.',
}) {
  const visualPanelRef = useRef(null);
  const quoteRef = useRef(null);

  useEffect(() => {
    if (visualPanelRef.current) {
      gsap.fromTo(
        visualPanelRef.current,
        { opacity: 0, scale: 1.03 },
        { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' }
      );
    }
    if (quoteRef.current) {
      gsap.fromTo(
        quoteRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* ====================================================================
          Left Panel: Authentication Form Canvas (50% on Desktop)
          ==================================================================== */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 md:p-14 lg:p-16 xl:p-20 z-10">
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <Link to="/" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy rounded-lg p-1">
            <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center text-brand-gold font-bold text-lg shadow-sm group-hover:bg-brand-navy-light transition-colors">
              MJ
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-brand-navy block leading-none">
                MasterJiEstates
              </span>
              <span className="text-[10px] uppercase tracking-widest text-brand-gold font-semibold mt-1 block">
                Real Estate Advisory
              </span>
            </div>
          </Link>

          <Link
            to="/design-system"
            className="text-xs font-medium text-slate-500 hover:text-brand-navy transition-colors flex items-center gap-1"
          >
            <span>Design System</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>

        {/* Central Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          <div className="mb-6 space-y-2">
            {badgeText && (
              <Badge variant="brand" size="sm">
                {badgeText}
              </Badge>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy tracking-tight">
              {pageTitle}
            </h1>
            {pageSubtitle && (
              <p className="text-sm text-slate-600 leading-relaxed">
                {pageSubtitle}
              </p>
            )}
          </div>

          {/* Form Content Injected Here */}
          {children}
        </div>

        {/* Footer Disclaimers */}
        <div className="pt-8 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>&copy; {new Date().getFullYear()} MasterJiEstates. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 transition-colors">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:text-slate-600 transition-colors">Brokerage Terms</span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          Right Panel: Curated Architectural Showcase (50% on Desktop)
          ==================================================================== */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-brand-navy-dark overflow-hidden flex-col justify-between p-12 xl:p-16">
        {/* Architectural Image Backdrop with Luxury Vignette */}
        <div
          ref={visualPanelRef}
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-100"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1800&q=80')`,
          }}
        />

        {/* Dark Navy & Gold Radial Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy-dark via-brand-navy/70 to-brand-navy-dark/40" />

        {/* Top Badges over Visual */}
        <div className="relative z-10 flex items-center justify-between">
          <Badge variant="direct" dot>
            MasterJi Direct &bull; Verified Portfolio
          </Badge>
          <span className="text-xs font-mono text-brand-gold-light/80 tracking-widest uppercase">
            https://masterjiestates.in
          </span>
        </div>

        {/* Inset Testimonial & Value Proposition */}
        <div ref={quoteRef} className="relative z-10 max-w-lg space-y-4">
          <div className="w-12 h-1 bg-brand-gold rounded-full" />
          <blockquote className="text-2xl xl:text-3xl font-heading font-medium text-white leading-snug tracking-tight">
            &ldquo;From Finding Your Property to Building Your Dream.&rdquo;
          </blockquote>
          <p className="text-sm text-slate-300 leading-relaxed">
            Experience end-to-end real estate transparency. Zero unsolicited broker spam, legally vetted titles, escorted site visits, and professional transaction facilitation.
          </p>

          <div className="pt-4 flex items-center gap-6 text-xs text-brand-gold-light font-medium border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>100% Masked Owner PII</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>RERA Compliant Guidelines</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

