import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Header from '../../components/layout/Header.jsx';
import Footer from '../../components/layout/Footer.jsx';
import SEOHead from '../../components/common/SEOHead.jsx';
import UdyamBadge from '../../components/common/UdyamBadge.jsx';
import { getLegalContent } from '../../services/api.js';

export default function LegalPageLayout({
  pageType,
  title,
  description,
  canonicalPath,
}) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const legalNavLinks = [
    { to: '/privacy-policy', label: 'Privacy Policy' },
    { to: '/terms-and-conditions', label: 'Terms & Conditions' },
    { to: '/disclaimer', label: 'Real Estate Disclaimer' },
    { to: '/brokerage-policy', label: 'Brokerage & Mandates' },
    { to: '/cookie-policy', label: 'Cookie Policy' },
  ];

  useEffect(() => {
    setLoading(true);
    setError('');
    getLegalContent(pageType)
      .then((data) => {
        setContent(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Could not load legal document.');
        setLoading(false);
      });
  }, [pageType]);

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col text-slate-800 selection:bg-brand-gold selection:text-brand-navy">
      <SEOHead
        title={title}
        description={description}
        canonicalPath={canonicalPath}
      />

      <Header />

      <main className="flex-1">
        {/* Header Banner */}
        <section className="bg-brand-navy-dark text-white pt-14 pb-16 border-b border-brand-gold/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/25 inline-block mb-3">
              Statutory Disclosures & Terms
            </span>
            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
              {content?.title || title}
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              Effective Date: {content?.lastUpdated || 'November 2026'} | MasterJiEstates Official Policy
            </p>
          </div>
        </section>

        {/* Statutory Terms Notice */}
        <div className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-start gap-3 text-xs text-slate-700">
            <svg className="w-4 h-4 text-brand-navy flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="leading-relaxed">
              <strong>Notice:</strong> These terms and statutory disclaimers govern your use of the MasterJiEstates platform. Please review them before engaging in transactions.
            </div>
          </div>
        </div>

        {/* Content Layout with Sidebar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Sidebar Navigation (4 cols) */}
            <aside className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2 sticky top-24">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2">
                  Legal Documents
                </span>
                {legalNavLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-brand-navy text-brand-gold font-bold shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    <span>{link.label}</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </NavLink>
                ))}

                <div className="pt-4 border-t border-slate-100 flex flex-col items-start gap-2">
                  <UdyamBadge size="sm" />
                  <p className="text-[11px] text-slate-400 font-light">
                    Office: Noida Sector 62A, Uttar Pradesh
                  </p>
                </div>
              </div>
            </aside>

            {/* Document Body (8 cols) */}
            <article className="lg:col-span-8 bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-card">
              {loading ? (
                <div className="text-center py-16">
                  <div className="w-8 h-8 border-3 border-brand-navy border-t-brand-gold rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs font-semibold text-slate-400">Loading document...</p>
                </div>
              ) : error ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  {error}
                </div>
              ) : (
                <div className="prose prose-slate max-w-none space-y-8">
                  {content?.sections?.map((sec, idx) => (
                    <section key={idx} className="space-y-3 border-b border-slate-100 pb-7 last:border-0 last:pb-0">
                      <h3 className="text-lg font-heading font-bold text-brand-navy tracking-tight">
                        {sec.heading}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                        {sec.content}
                      </p>
                    </section>
                  ))}
                </div>
              )}
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

