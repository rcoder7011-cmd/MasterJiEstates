import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header.jsx';
import Footer from '../../components/layout/Footer.jsx';
import PropertySearchBar from '../../components/properties/PropertySearchBar.jsx';
import PropertyFilters from '../../components/properties/PropertyFilters.jsx';
import PropertyFilterDrawer from '../../components/properties/PropertyFilterDrawer.jsx';
import PropertyResults from '../../components/properties/PropertyResults.jsx';
import { usePropertyFilters } from '../../hooks/usePropertyFilters.js';

export default function PropertyListing() {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const {
    city,
    locality,
    search,
    category,
    listingType,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    bedrooms,
    status,
    sort,
    page,
    view,
    properties,
    totalResults,
    totalPages,
    itemsPerPage,
    activeFilters,
    isLoading,
    isFallback,
    error,
    updateFilter,
    updateMultipleFilters,
    clearFilter,
    clearAllFilters,
    setSort,
    setPage,
    setView,
  } = usePropertyFilters();

  useEffect(() => {
    document.title = 'Explore Properties | MasterJiEstates';
  }, []);

  const handleSearchSubmit = ({ search: term, city: c, category: cat }) => {
    updateMultipleFilters({
      search: term,
      city: c,
      category: cat,
    });
  };

  const handleSearchReset = () => {
    updateMultipleFilters({
      search: '',
      city: 'all',
      category: 'all',
    });
  };

  const filterProps = {
    city,
    locality,
    category,
    listingType,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    bedrooms,
    status,
    onUpdateFilter: updateFilter,
    onUpdateMultipleFilters: updateMultipleFilters,
    onClearAll: clearAllFilters,
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-canvas text-brand-dark selection:bg-brand-gold/30 selection:text-brand-navy">
      {/* Global Navigation Header */}
      <Header />

      {/* Main Page Landmark */}
      <main id="main-content" className="flex-1 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <li>
                <Link to="/" className="hover:text-brand-navy transition-colors">
                  Home
                </Link>
              </li>
              <li className="text-slate-400">/</li>
              <li className="text-brand-navy font-bold">
                <Link to="/properties" className="hover:underline">
                  Properties
                </Link>
              </li>
              {city !== 'all' && (
                <>
                  <li className="text-slate-400">/</li>
                  <li className="text-brand-gold font-bold">{city}</li>
                </>
              )}
              {category !== 'all' && (
                <>
                  <li className="text-slate-400">/</li>
                  <li className="text-brand-navy font-semibold uppercase text-[10px] bg-slate-200/70 px-1.5 py-0.5 rounded">
                    {category.replace('_', ' ')}
                  </li>
                </>
              )}
            </ol>
          </nav>

          {/* Page Heading */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading text-brand-navy tracking-tight">
              Explore Properties
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl font-light">
              Discover residential and commercial property opportunities that match your requirements. Browse verified company assets and owner mandates across prime hubs.
            </p>
          </div>

          {/* Top Search Bar */}
          <PropertySearchBar
            search={search}
            city={city}
            category={category}
            onSearchSubmit={handleSearchSubmit}
            onReset={handleSearchReset}
          />

          {/* Main 2-Column Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Desktop Sticky Filter Sidebar (3 of 12 columns) */}
            <div className="hidden lg:block lg:col-span-3 sticky top-24 bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 max-h-[calc(100vh-7rem)] overflow-y-auto">
              <PropertyFilters {...filterProps} />
            </div>

            {/* Right Column: Property Results & Catalog (9 of 12 columns) */}
            <div className="lg:col-span-9">
              {isLoading ? (
                /* Subtle Loading Skeleton */
                <div className="space-y-4 animate-pulse">
                  <div className="h-14 bg-white rounded-2xl border border-slate-200/80"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-80 bg-white rounded-2xl border border-slate-200/80"></div>
                    ))}
                  </div>
                </div>
              ) : (
                <PropertyResults
                  properties={properties}
                  totalResults={totalResults}
                  totalPages={totalPages}
                  currentPage={page}
                  itemsPerPage={itemsPerPage}
                  currentSort={sort}
                  currentView={view}
                  activeFilters={activeFilters}
                  onSortChange={setSort}
                  onPageChange={setPage}
                  onViewChange={setView}
                  onRemoveFilter={clearFilter}
                  onClearAll={clearAllFilters}
                  onOpenMobileFilters={() => setMobileDrawerOpen(true)}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Filter Slide-over Drawer */}
      <PropertyFilterDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        filterProps={filterProps}
      />

      {/* Corporate Real Estate Footer */}
      <Footer />
    </div>
  );
}
