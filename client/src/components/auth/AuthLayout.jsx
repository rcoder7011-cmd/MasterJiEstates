import React from 'react';
import { Link } from 'react-router-dom';
import AuthVisualPanel from './AuthVisualPanel.jsx';
import Logo from '../common/Logo.jsx';

export default function AuthLayout({
  children,
  visualHeadline = "Find a Place You'll Love to Call Home",
  visualSubtitle = "Discover verified residential and commercial properties across India with complete pricing transparency and zero unsolicited broker calls.",
  visualImage = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80",
  visualTag = "Verified Inventory",
}) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-surface-primary">
      {/* ====================================================================
          Left Section: Authentication Form (50% on Desktop, 100% on Mobile)
          ==================================================================== */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 md:p-12 lg:p-14 xl:p-16 z-10 bg-white">
        {/* Top Brand Bar */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy rounded-lg p-1"
            aria-label="MasterJiEstates Home"
          >
            <Logo size="md" showText={false} linkTo={null} />
            <div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-brand-navy block leading-none">
                MasterJiEstates
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-brand-gold font-semibold mt-1 block">
                Real Estate Advisory
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="text-xs font-medium text-slate-500 hover:text-brand-navy transition-colors flex items-center gap-1.5 py-1.5 px-3 rounded-md hover:bg-slate-50 border border-slate-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Central Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-2">
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
          Right Section: Curated Real Estate Visual Panel (50% on Desktop)
          ==================================================================== */}
      <AuthVisualPanel
        headline={visualHeadline}
        subtitle={visualSubtitle}
        imageUrl={visualImage}
        featureTag={visualTag}
      />
    </div>
  );
}

