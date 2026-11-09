import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
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
  const containerRef = useRef(null);

  useEffect(() => {
    getCompanyContent()
      .then((data) => setCompanyInfo(data))
      .catch((err) => console.warn('Could not load company info:', err.message));
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.about-anim-image',
        { opacity: 0, scale: 0.96, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: 'power2.out' }
      );

      gsap.fromTo(
        '.about-anim-content',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power2.out' }
      );

      gsap.fromTo(
        '.about-anim-leadership',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FDFCFB] flex flex-col text-slate-800 selection:bg-brand-gold selection:text-brand-navy">
      <SEOHead
        title="About Us | MasterJiEstates"
        description="Learn about MasterJiEstates — India's trusted real-estate advisory and transaction coordination platform based in Noida Sector 62A, serving Delhi, UP, Ghaziabad, Noida, Gurugram, and Indirapuram."
        canonicalPath="/about"
      />

      <Header />

      <main className="flex-1">
        {/* Top Hero Banner */}
        <section className="relative bg-gradient-to-b from-brand-navy-dark via-brand-navy to-brand-navy-dark text-white pt-20 pb-24 overflow-hidden border-b border-brand-gold/20">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px]"></div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Logo Badge in Hero */}
            <div className="flex justify-center mb-6">
              <Logo variant="on-dark" size="lg" linkTo={null} />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-brand-gold bg-brand-gold/10 border border-brand-gold/30">
                Company Background &amp; Advisory Philosophy
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

        {/* Corporate Profile & Reception Lobby Showcase (Two-Column Layout) */}
        <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Reception Lobby Photograph */}
            <div className="about-anim-image lg:col-span-5 flex flex-col justify-center">
              <div className="relative group rounded-3xl overflow-hidden border border-slate-200/90 shadow-card bg-white p-2.5 transition-all duration-300 hover:shadow-elevated">
                <div className="relative rounded-2xl overflow-hidden aspect-[2/3] max-h-[620px] w-full bg-slate-100">
                  <img
                    src="/images/Master Ji Estates Reception Lobby.png"
                    alt="MasterJiEstates Reception Lobby in Noida Sector 62A"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="eager"
                  />
                  {/* Bottom Vignette with Office Caption */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-navy-dark/95 via-brand-navy-dark/50 to-transparent p-5 text-white">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1.5 backdrop-blur-xs">
                      <span>Official Corporate Office</span>
                    </div>
                    <p className="text-sm font-heading font-semibold text-white">
                      MasterJiEstates Reception Lobby
                    </p>
                    <p className="text-xs text-slate-300 font-light flex items-center gap-1.5 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{COMPANY_CONFIG.officeAddress}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Company Introduction & Identity */}
            <div className="lg:col-span-7 space-y-6 flex flex-col justify-center">
              <div className="about-anim-content space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-gold block">
                  ABOUT MASTERJIESTATES
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-brand-navy tracking-tight leading-tight">
                  Building Better Tomorrow
                </h2>
                <p className="text-base sm:text-lg font-heading font-semibold text-brand-gold italic">
                  &ldquo;From Finding Your Property to Building Your Dream.&rdquo;
                </p>
              </div>

              <div className="about-anim-content space-y-3.5 text-sm sm:text-base text-slate-600 leading-relaxed font-light">
                <p>
                  MasterJiEstates is a specialized real-estate advisory and transaction facilitation enterprise headquartered in {COMPANY_CONFIG.officeLocation}, India. We primarily deal in end-to-end <strong>property buying, selling, brokerage, investment assistance, and professional property consultation</strong> across {COMPANY_CONFIG.serviceAreas.join(', ')}.
                </p>
                <p>
                  Unlike unmoderated classified boards where duplicate listings and unvetted agents create confusion, MasterJiEstates operates with direct accountability. Every mandate is managed with complete owner contact privacy, rigorous title scrutiny, and guided on-site walkthroughs up to deed execution.
                </p>
              </div>

              {/* Core Offerings Grid */}
              <div className="about-anim-content grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-brand-navy font-bold flex items-center justify-center flex-shrink-0 text-sm">
                    🏢
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider">Property Buying &amp; Selling</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Verified residential homes, villas, plots, and commercial spaces.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-brand-navy font-bold flex items-center justify-center flex-shrink-0 text-sm">
                    ⚖️
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider">Brokerage Coordination</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Transparent terms, title scrutiny, and sub-registrar conveyance liaison.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-brand-navy font-bold flex items-center justify-center flex-shrink-0 text-sm">
                    📈
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider">Investment Assistance</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Strategic property selection with high yield and capital growth potential.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-brand-navy font-bold flex items-center justify-center flex-shrink-0 text-sm">
                    🧭
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider">Property Consultation</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Unbiased guidance tailored to your family's budget and requirements.</p>
                  </div>
                </div>
              </div>

              {/* Udyam Registration Card */}
              <div className="about-anim-content pt-1">
                <UdyamBadge variant="card" />
              </div>
            </div>
          </div>
        </section>

        {/* Section: Meet Our Leadership */}
        <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">
                Company Leadership
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-brand-navy tracking-tight">
                Meet Our Leadership
              </h2>
              <p className="text-sm sm:text-base text-slate-600 font-light leading-relaxed">
                Direct accountability and personal guidance. Connect with confirmed leadership behind MasterJiEstates for your property decisions.
              </p>
            </div>

            {/* Verified Leadership Profile Card */}
            <div className="about-anim-leadership max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-card hover:shadow-elevated transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 text-center sm:text-left">
                {/* CEO Leadership Portrait */}
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-md border-2 border-brand-gold/50 bg-brand-navy-dark ring-4 ring-brand-gold/10">
                    <img
                      src="/images/CEO%20img.jpeg"
                      alt="Mr Shokin - Founder &amp; Property Consultant"
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback alias if space encoding behaves differently
                        if (e.currentTarget.src !== window.location.origin + '/images/ceo.jpeg') {
                          e.currentTarget.src = '/images/ceo.jpeg';
                        }
                      }}
                    />
                  </div>
                  <span className="absolute -bottom-2.5 -right-1.5 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs flex items-center gap-1 border-2 border-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Verified
                  </span>
                </div>

                {/* Profile Details */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-2xl font-heading font-bold text-brand-navy tracking-tight">
                      Mr Shokin
                    </h3>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/15 text-amber-900 border border-amber-400/30 uppercase tracking-wider mt-1.5">
                      <span>Founder &amp; Property Consultant</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed font-light">
                    Leading MasterJiEstates with a dedicated commitment to transparency, rigorous property scrutiny, and complete privacy for buyers and property owners. Available for direct consultations, acquisition advisory, and transaction coordination.
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <WhatsAppButton
                      context="about"
                      variant="solid"
                      size="sm"
                      label="Consult on WhatsApp"
                    />
                    <a
                      href={COMPANY_CONFIG.phoneTel}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-brand-navy text-xs font-semibold transition-all border border-slate-200"
                    >
                      <svg className="w-3.5 h-3.5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{COMPANY_CONFIG.phoneDisplay}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How We Help Buyers & Sellers */}
        <section className="py-16 sm:py-20 bg-white border-y border-slate-200/80">
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
              <div className="bg-slate-50/80 rounded-2xl p-7 border border-slate-200/90 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-xl bg-brand-navy text-brand-gold font-bold flex items-center justify-center text-lg">
                  🏠
                </div>
                <h3 className="text-xl font-heading font-bold text-brand-navy">
                  For Property Buyers
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Buying real estate is often an individual's largest lifetime investment. We protect buyers by ensuring that every property displayed on our platform is either owned directly by MasterJiEstates or represented under a signed representation mandate.
                </p>
                <div className="space-y-2 pt-2 border-t border-slate-200/60 text-xs text-slate-700">
                  <p>• Escorted on-site visits with knowledgeable property advisors.</p>
                  <p>• Preliminary verification of municipal sanctions and revenue records.</p>
                  <p>• Transparent price discovery without hidden charges.</p>
                  <p>• Access to curated bank loan and interior planning partners.</p>
                </div>
              </div>

              {/* For Sellers */}
              <div className="bg-slate-50/80 rounded-2xl p-7 border border-slate-200/90 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-xl bg-brand-navy text-brand-gold font-bold flex items-center justify-center text-lg">
                  🤝
                </div>
                <h3 className="text-xl font-heading font-bold text-brand-navy">
                  For Property Sellers
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Selling property should not require broadcasting your personal mobile number to dozens of unvetted agents. MasterJiEstates provides an orderly, privacy-first selling gateway.
                </p>
                <div className="space-y-2 pt-2 border-t border-slate-200/60 text-xs text-slate-700">
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
