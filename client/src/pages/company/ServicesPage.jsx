import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header.jsx';
import Footer from '../../components/layout/Footer.jsx';
import SEOHead from '../../components/common/SEOHead.jsx';
import ServiceCard from '../../components/services/ServiceCard.jsx';
import { getServicesContent } from '../../services/api.js';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  useEffect(() => {
    getServicesContent()
      .then((data) => {
        setServices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Could not load services:', err.message);
        setLoading(false);
      });
  }, []);

  const realEstateServices = services.filter((s) => s.category === 'real_estate');
  const alliedServices = services.filter((s) => s.category === 'allied');

  const displayedAllied =
    activeCategoryFilter === 'all'
      ? alliedServices
      : alliedServices.filter((s) => s.deliveryType === activeCategoryFilter);

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col text-slate-800 selection:bg-brand-gold selection:text-brand-navy">
      <SEOHead
        title="Real Estate & Allied Home Services"
        description="Explore MasterJiEstates real-estate services — Property Buying Representation, Privacy-Preserving Selling Mandates, MasterJi Direct Assets, and Allied Home Services via our verified partner network."
        canonicalPath="/services"
      />

      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-brand-navy-dark via-brand-navy to-brand-navy-dark text-white pt-20 pb-24 overflow-hidden border-b border-brand-gold/20">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px]"></div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-brand-gold bg-brand-gold/10 border border-brand-gold/30 mb-5">
              Comprehensive Property & Living Solutions
            </span>
            <h1 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight text-white mb-6">
              Primary Real Estate Advisory <br className="hidden sm:inline" />
              <span className="text-brand-gold">& Allied Home Solutions</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Real estate transaction advisory is our primary business. We provide end-to-end representation for buyers and sellers, complemented by a curated network of home loan, architecture, and interior design partners.
            </p>
          </div>
        </section>

        {/* SECTION 1: Primary Real Estate Services */}
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-navy text-brand-gold">
              Primary Business Operations
            </div>
            <h2 className="text-2xl sm:text-4xl font-heading font-bold text-brand-navy tracking-tight">
              Core Real Estate Services
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              These services represent the core operational focus of MasterJiEstates, delivered directly by our in-house advisory desk and experienced property specialists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {realEstateServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>

        {/* SECTION 2: Additional Allied Services */}
        <section className="py-16 bg-slate-50 border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
              <div className="max-w-2xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">
                  Complementary Services
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-brand-navy tracking-tight">
                  Allied Home & Living Solutions
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  To assist homeowners and investors through construction, interior furnishing, and financing, MasterJiEstates coordinates with verified banking institutions and licensed design studios.
                </p>
              </div>

              {/* Delivery Type Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'All Services' },
                  { id: 'verified_partner', label: 'Partner Network' },
                  { id: 'coming_soon', label: 'Coming Soon' },
                ].map((filter) => {
                  const isActive = activeCategoryFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setActiveCategoryFilter(filter.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-brand-navy text-brand-gold font-bold shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delivery Disclaimer Notice */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <svg
                className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="leading-relaxed">
                <strong>Statutory Partner Delivery Disclaimer:</strong> MasterJiEstates is an independent real estate advisory firm. Services labeled "Verified Partner Network" are fulfilled directly by third-party banks, financial companies, interior designers, or structural engineers under their own applicable terms and service guarantees. MasterJiEstates does not warrant third-party bank loan approvals or interior execution warranties.
              </div>
            </div>

            {/* Allied Services Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {displayedAllied.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

