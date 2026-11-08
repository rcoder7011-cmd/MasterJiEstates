import React from 'react';
import { Link } from 'react-router-dom';
import SectionHeading from '../ui/SectionHeading.jsx';

const categories = [
  {
    title: 'Independent Houses',
    description: 'Spacious independent residences with private yards and freehold land ownership.',
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80',
    queryKey: 'independent_house',
  },
  {
    title: 'Apartments & Flats',
    description: 'Modern high-rise apartments and penthouses equipped with clubhouse amenities.',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
    queryKey: 'apartment',
  },
  {
    title: 'Villas',
    description: 'Luxury standalone and gated-community villas designed for bespoke living.',
    imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80',
    queryKey: 'villa',
  },
  {
    title: 'Residential Plots',
    description: 'Clear-title residential land plots ready for custom home architectural construction.',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
    queryKey: 'residential_plot',
  },
  {
    title: 'Commercial Properties',
    description: 'Grade-A office suites, retail showrooms, and complete corporate buildings.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    queryKey: 'commercial_property',
  },
];

export default function PropertyCategories() {
  return (
    <section className="py-16 sm:py-20 bg-surface-primary border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Curated Portfolios"
          title="Explore Properties by Category"
          subtitle="Find a property that matches your needs, lifestyle, and investment goals."
          align="left"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              to={`/properties?category=${cat.queryKey}`}
              className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-subtle hover:shadow-card hover:-translate-y-1.5 transition-all duration-300"
            >
              {/* Category Photography */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={cat.imageUrl}
                  alt={cat.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy-dark/60 via-transparent to-transparent opacity-80" />
              </div>

              {/* Category Details */}
              <div className="p-4 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="text-base font-bold text-brand-navy group-hover:text-brand-navy-light transition-colors font-heading">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-navy group-hover:text-brand-gold transition-colors">
                  <span>Explore Listings</span>
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

