import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header.jsx';
import Footer from '../../components/layout/Footer.jsx';
import SEOHead from '../../components/common/SEOHead.jsx';
import Logo from '../../components/common/Logo.jsx';
import UdyamBadge from '../../components/common/UdyamBadge.jsx';
import WhatsAppButton from '../../components/common/WhatsAppButton.jsx';
import { getCompanyContent } from '../../services/api.js';
import { COMPANY_CONFIG } from '../../config/companyConfig.js';

export default function AboutUs() {
  const [companyInfo, setCompanyInfo] = useState(null);

  useEffect(() => {
    getCompanyContent()
      .then((data) => setCompanyInfo(data))
      .catch((err) => console.warn('Could not load company info:', err.message));
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col text-slate-800 selection:bg-brand-gold selection:text-brand-navy">
      <SEOHead
        title="About Us | MasterJiEstates"
        description="Learn about MasterJiEstates — India's trusted real-estate advisory and transaction coordination platform based in Noida Sector 62A, serving Delhi, UP, Ghaziabad, Noida, and Gurugram."
        canonicalPath="/about"
      />

      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-brand-navy-dark via-brand-navy to-brand-navy-dark text-white pt-20 pb-24 overflow-hidden border-b border-brand-gold/20">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px]"></div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Logo Badge in Hero */}
            <div className="flex justify-center mb-6">
              <Logo variant="on-dark" size="lg" linkTo={null} />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-brand-gold bg-brand-gold/10 border border-brand-gold/30">
                Company Background & Advisory Philosophy
              </span>
              <UdyamBadge variant="badge" />
            </div>

            <h1 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight text-white mb-6">
              From Finding Your Property <br className="hidden sm:inline" />
              <span className="text-brand-gold">to Building Your Dream.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              MasterJiEstates is a specialized real-estate advisory enterprise headquartered in {COMPANY_CONFIG.officeLocation}, India. We are built on a simple premise: Indian property transactions should be transparent, verified, and free from misleading classified noise.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <WhatsAppButton
                context="about"
                size="md"
                label="Connect on WhatsApp"
              />
              <a
                href={COMPANY_CONFIG.phoneTel}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/20"
              >
                <span>📞 Call {COMPANY_CONFIG.phoneDisplay}</span>
              </a>
            </div>
          </div>
        </section>

        {/* Identity & Core Real Estate Positioning */}
        <section className="py-16 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">
                Who We Are
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-brand-navy tracking-tight">
                A Dedicated Real Estate Advisory, Not An Open Classified Board.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                MasterJiEstates is primarily a <strong>real-estate brokerage and asset management company</strong>. Operating from our central hub at {COMPANY_CONFIG.officeLocation}, we focus our day-to-day operations on one core objective: helping families, individuals, and institutional investors safely acquire, sell, and convey residential and commercial real estate across <strong>{COMPANY_CONFIG.serviceAreas.join(', ')}</strong>.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Rather than operating as an unmoderated open classified board where duplicate listings, outdated prices, and unauthorized broker reposts abound, we screen listings before they are published, mask owner contact information to prevent harassment, and manage end-to-end conveyance up to deed execution.
              </p>

              {/* Udyam Registration Card */}
              <div className="pt-2">
                <UdyamBadge variant="card" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-card space-y-6">
              <h3 className="text-lg font-heading font-bold text-brand-navy border-b border-slate-100 pb-3">
                Core Real Estate Focus
              </h3>
              <ul className="space-y-3.5 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <strong className="text-brand-navy block">Property Buying Representation</strong>
                    <span className="text-xs text-slate-500">Unbiased property searches, title scrutiny, escorted site visits, and negotiation.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <strong className="text-brand-navy block">Privacy-Preserving Seller Mandates</strong>
                    <span className="text-xs text-slate-500">Shielding owners from open web scrapers while connecting pre-qualified buyers.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <strong className="text-brand-navy block">MasterJi Direct Company Assets</strong>
                    <span className="text-xs text-slate-500">Legally scrutinized company-owned properties offered with zero buyer brokerage fees.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <strong className="text-brand-navy block">Sub-Registrar Conveyance Liaison</strong>
                    <span className="text-xs text-slate-500">Stamp duty advisory, deed drafting, appointment booking, and registration accompaniment.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* How We Help Buyers & Sellers */}
        <section className="py-16 bg-slate-50 border-y border-slate-200/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">
                Our Operational Approach
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-brand-navy">
                How MasterJiEstates Solves Real Estate Friction
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* For Buyers */}
              <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-xl bg-brand-navy text-brand-gold font-bold flex items-center justify-center text-lg">
                  🏠
                </div>
                <h3 className="text-xl font-heading font-bold text-brand-navy">
                  For Property Buyers
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Buying real estate is often an individual's largest lifetime investment. We protect buyers by ensuring that every property displayed on our platform is either owned directly by MasterJiEstates or represented under a signed representation mandate.
                </p>
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                  <p>• Escorted on-site visits with knowledgeable property advisors.</p>
                  <p>• Preliminary verification of municipal sanctions and revenue records.</p>
                  <p>• Transparent price discovery without hidden charges.</p>
                  <p>• Access to curated bank loan and interior planning partners.</p>
                </div>
              </div>

              {/* For Sellers */}
              <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-xl bg-brand-navy text-brand-gold font-bold flex items-center justify-center text-lg">
                  🤝
                </div>
                <h3 className="text-xl font-heading font-bold text-brand-navy">
                  For Property Sellers
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Selling property should not require broadcasting your personal mobile number to dozens of unvetted agents. MasterJiEstates provides an orderly, privacy-first selling gateway.
                </p>
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                  <p>• Complete owner contact masking from search engines and scrapers.</p>
                  <p>• Screening of prospective buyers to ensure genuine financial capability.</p>
                  <p>• Individually agreed brokerage mandate terms with zero ambiguity.</p>
                  <p>• Professional guidance through Agreement to Sell and deed execution.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Allied Services Introduction */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="bg-gradient-to-r from-brand-navy to-brand-navy-light text-white rounded-3xl p-8 sm:p-10 shadow-card flex flex-col md:flex-row items-center justify-between gap-8 border border-brand-gold/30">
            <div className="space-y-3 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">
                Allied Home Services
              </span>
              <h3 className="text-2xl font-heading font-bold text-white">
                Assisting You Beyond Property Discovery
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                To support your journey from finding a property to settling in, we facilitate access to trusted partners for Home Loans, Turnkey Interiors, and Architectural Planning across {COMPANY_CONFIG.serviceAreas.join(', ')}.
              </p>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-gold hover:bg-amber-400 text-brand-navy font-bold text-sm transition-all shadow-md flex-shrink-0"
            >
              <span>Explore All Services</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-10 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-2xl font-heading font-bold text-brand-navy">
              Ready to Discuss Your Property Requirements?
            </h3>
            <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              Whether you are looking to purchase a family home, acquire an investment plot, or list a high-value property for sale, our advisory desk at {COMPANY_CONFIG.officeLocation} is here to assist.
            </p>
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-brand-gold font-bold text-sm transition-all shadow-xs"
              >
                <span>Contact Our Advisory Desk</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              <WhatsAppButton
                context="about"
                variant="solid"
                size="lg"
                label="WhatsApp Advisory Desk"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
