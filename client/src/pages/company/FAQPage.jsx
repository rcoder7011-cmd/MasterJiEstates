import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header.jsx';
import Footer from '../../components/layout/Footer.jsx';
import SEOHead from '../../components/common/SEOHead.jsx';
import FAQAccordion from '../../components/faq/FAQAccordion.jsx';
import WhatsAppButton from '../../components/common/WhatsAppButton.jsx';
import { getFaqsContent } from '../../services/api.js';

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFaqsContent()
      .then((data) => {
        setFaqs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Could not load FAQs:', err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col text-slate-800 selection:bg-brand-gold selection:text-brand-navy">
      <SEOHead
        title="Frequently Asked Questions (FAQ)"
        description="Find clear answers to common questions about MasterJiEstates — property browsing, enquiry handling, seller listings, moderation, site visits, brokerage, and allied home services."
        canonicalPath="/faq"
      />

      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-brand-navy-dark via-brand-navy to-brand-navy-dark text-white pt-16 pb-20 overflow-hidden border-b border-brand-gold/20">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px]"></div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-brand-gold bg-brand-gold/10 border border-brand-gold/30 mb-4">
              Knowledge Base & Support
            </span>
            <h1 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Transparent answers regarding how MasterJiEstates manages property discovery, title verification, seller privacy, site visits, and transactions.
            </p>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-3 border-brand-navy border-t-brand-gold rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Loading Frequently Asked Questions...
              </p>
            </div>
          ) : (
            <FAQAccordion faqs={faqs} />
          )}

          {/* Unanswered Question CTA */}
          <div className="mt-16 text-center bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-card max-w-3xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 text-xl font-bold flex items-center justify-center mx-auto">
              💬
            </div>
            <h3 className="text-2xl font-heading font-bold text-brand-navy">
              Have a Specific Question Not Listed Here?
            </h3>
            <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              Our real-estate advisory team is available to address your specific queries regarding property titles, municipal guidelines, or brokerage terms.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-brand-gold font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
              >
                <span>Contact Advisory Desk</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <WhatsAppButton
                context="contact"
                variant="solid"
                size="md"
                label="Ask on WhatsApp"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

