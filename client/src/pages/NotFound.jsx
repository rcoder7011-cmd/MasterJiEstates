import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';
import SEOHead from '../components/common/SEOHead.jsx';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-canvas text-slate-900 font-sans">
      <SEOHead
        title="404 — Page Not Found | MasterJiEstates"
        description="The requested property listing or page could not be found on MasterJiEstates."
        noIndex={true}
      />
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="max-w-xl w-full text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-6">
            <svg
              className="w-4 h-4 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Error 404
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-navy tracking-tight mb-4 font-serif">
            Page or Property Not Found
          </h1>

          <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed">
            The page or property listing you are searching for might have been sold, withdrawn, renamed, or is temporarily unavailable.
          </p>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link
              to="/properties"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-brand-gold text-brand-navy font-semibold text-sm hover:bg-brand-gold/90 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              Browse Properties
            </Link>

            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Return to Homepage
            </Link>
          </div>

          {/* Additional Helpful Links */}
          <div className="pt-8 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Need Assistance?
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs font-medium text-brand-navy">
              <Link to="/services" className="hover:text-brand-gold transition-colors">
                Our Services
              </Link>
              <span className="text-slate-300">•</span>
              <Link to="/contact" className="hover:text-brand-gold transition-colors">
                Contact Advisory Team
              </Link>
              <span className="text-slate-300">•</span>
              <Link to="/faq" className="hover:text-brand-gold transition-colors">
                Frequently Asked Questions
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

