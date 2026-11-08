import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function FAQAccordion({ faqs = [] }) {
  const [openIds, setOpenIds] = useState(new Set([faqs[0]?.id || 'faq-01']));
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Extract distinct categories
  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'browsing', label: 'Browsing & Search' },
    { id: 'enquiries', label: 'Inquiries' },
    { id: 'buying_selling', label: 'Buying & Selling' },
    { id: 'submissions', label: 'Listing Submissions' },
    { id: 'moderation', label: 'Verification' },
    { id: 'site_visits', label: 'Site Visits' },
    { id: 'brokerage', label: 'Brokerage & Fees' },
    { id: 'allied_services', label: 'Allied Services' },
    { id: 'privacy', label: 'Account & Privacy' },
  ];

  const toggleItem = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filtered FAQs
  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const s = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !s ||
      faq.question.toLowerCase().includes(s) ||
      faq.answer.toLowerCase().includes(s);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Search Input & Category Pills */}
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions by topic (e.g., brokerage, site visit, title verification)..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 shadow-xs"
          />
          <svg
            className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-full"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-navy text-brand-gold font-bold shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion Items */}
      {filteredFaqs.length === 0 ? (
        <div className="text-center py-12 px-6 rounded-2xl bg-white border border-slate-200">
          <p className="text-base font-semibold text-slate-700 mb-2">
            No matching questions found
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
            We couldn't find an answer matching your query. Our advisory desk is ready to help you directly.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-navy text-brand-gold text-xs font-bold hover:bg-brand-navy-light transition-colors"
          >
            <span>Ask a Custom Question</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openIds.has(faq.id);
            return (
              <div
                key={faq.id}
                className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors focus:outline-none focus-visible:bg-slate-50"
                >
                  <div className="space-y-1">
                    {faq.categoryLabel && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {faq.categoryLabel}
                      </span>
                    )}
                    <h4 className="text-base font-heading font-bold text-brand-navy leading-snug">
                      {faq.question}
                    </h4>
                  </div>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'bg-brand-navy text-brand-gold rotate-180' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 bg-slate-50/30">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

