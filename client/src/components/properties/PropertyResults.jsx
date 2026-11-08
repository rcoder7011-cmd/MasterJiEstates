import React, { useState } from 'react';
import PropertyCard from './PropertyCard.jsx';
import PropertySort from './PropertySort.jsx';
import PropertyPagination from './PropertyPagination.jsx';
import ActiveFilterChips from './ActiveFilterChips.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import Button from '../ui/Button.jsx';
import Modal from '../ui/Modal.jsx';
import Badge from '../ui/Badge.jsx';
import { Link } from 'react-router-dom';

export default function PropertyResults({
  properties,
  totalResults,
  totalPages,
  currentPage,
  itemsPerPage,
  currentSort,
  currentView,
  activeFilters,
  onSortChange,
  onPageChange,
  onViewChange,
  onRemoveFilter,
  onClearAll,
  onOpenMobileFilters,
}) {
  const [selectedProperty, setSelectedProperty] = useState(null);

  return (
    <div className="space-y-6">
      {/* Top Toolbar: Results count, Mobile Filter Button, Sort & View Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Results Count & Mobile Filter Trigger */}
          <div className="flex items-center gap-3">
            {/* Mobile Filter Drawer Button */}
            <button
              type="button"
              onClick={onOpenMobileFilters}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-navy text-white text-xs font-semibold rounded-lg shadow-xs hover:bg-brand-navy-light transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filters</span>
              {activeFilters.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-brand-gold text-brand-navy text-[10px] font-bold flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>

            {/* Results Counter */}
            <div className="text-xs sm:text-sm font-semibold text-slate-700">
              <span className="font-bold text-brand-navy">{totalResults}</span>{' '}
              {totalResults === 1 ? 'Property Available' : 'Properties Available'}
            </div>
          </div>

          {/* Right: Sort Dropdown & Grid/List View Toggles */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <PropertySort
              currentSort={currentSort}
              onSortChange={onSortChange}
            />

            {/* View Layout Switcher (Grid vs List) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => onViewChange('grid')}
                className={`p-1.5 rounded-md text-slate-600 transition-all ${
                  currentView === 'grid'
                    ? 'bg-white text-brand-navy shadow-xs font-bold'
                    : 'hover:text-brand-navy'
                }`}
                aria-label="Grid View"
                title="Grid View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => onViewChange('list')}
                className={`p-1.5 rounded-md text-slate-600 transition-all ${
                  currentView === 'list'
                    ? 'bg-white text-brand-navy shadow-xs font-bold'
                    : 'hover:text-brand-navy'
                }`}
                aria-label="List View"
                title="List View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilters.length > 0 && (
          <div className="pt-3 border-t border-slate-100 mt-3">
            <ActiveFilterChips
              activeFilters={activeFilters}
              onRemoveFilter={onRemoveFilter}
              onClearAll={onClearAll}
            />
          </div>
        )}
      </div>

      {/* Property Cards Container */}
      {properties.length === 0 ? (
        <EmptyState
          title="No properties found"
          description="We couldn't find any listings matching your combination of filters. Try clearing specific filters or searching across a broader area."
          action={
            <Button variant="primary" size="sm" onClick={onClearAll}>
              Clear All Filters
            </Button>
          }
        />
      ) : (
        <div
          className={
            currentView === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
              : 'flex flex-col gap-5'
          }
        >
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              view={currentView}
              onViewDetails={(prop) => setSelectedProperty(prop)}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <PropertyPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalResults={totalResults}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
      />

      {/* Part 6 Details Preview & Part 7 Notice Modal */}
      {selectedProperty && (
        <Modal
          isOpen={!!selectedProperty}
          onClose={() => setSelectedProperty(null)}
          title={selectedProperty.title}
          size="lg"
          actions={
            <div className="flex items-center justify-between w-full gap-3">
              <span className="text-xs text-slate-500 hidden sm:inline">
                Property ID: <code className="text-brand-navy font-bold">{selectedProperty.id}</code>
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedProperty(null)}>
                  Close
                </Button>
                <Link to={`/properties/${selectedProperty.id}`}>
                  <Button variant="gold" size="sm">
                    View Full Details &rarr;
                  </Button>
                </Link>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-left">
            {/* Visual Thumbnail */}
            <div className="relative h-64 w-full rounded-xl overflow-hidden bg-slate-100">
              <img
                src={selectedProperty.imageUrl}
                alt={selectedProperty.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge
                  variant={selectedProperty.listingType === 'company_owned' ? 'direct' : 'brokerage'}
                  size="sm"
                  dot
                >
                  {selectedProperty.listingTypeLabel}
                </Badge>
              </div>
              <div className="absolute bottom-3 left-3 bg-brand-navy-dark/95 text-white font-bold text-lg px-3 py-1 rounded-lg backdrop-blur-xs">
                {selectedProperty.priceFormatted}
              </div>
            </div>

            {/* Specifications Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-medium block uppercase text-[10px]">Location</span>
                <span className="font-bold text-slate-800">{selectedProperty.locality}, {selectedProperty.city}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block uppercase text-[10px]">Carpet Area</span>
                <span className="font-bold text-slate-800">{selectedProperty.area} sq ft</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block uppercase text-[10px]">Bedrooms</span>
                <span className="font-bold text-slate-800">
                  {selectedProperty.bedrooms !== null ? `${selectedProperty.bedrooms} BHK` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block uppercase text-[10px]">Status</span>
                <span className="font-bold text-slate-800">{selectedProperty.availabilityLabel}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Overview</h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-light">
                {selectedProperty.description}
              </p>
            </div>

            {/* Amenities */}
            {selectedProperty.amenities && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Features & Amenities</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProperty.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      ✓ {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy & Operational Process Box */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 text-slate-700">
              <div className="font-bold flex items-center gap-1.5 text-brand-navy">
                <span>🛡️</span> Privacy Guarantee & Escorted Visits
              </div>
              <p className="leading-relaxed">
                Owner contact numbers and private identity records are strictly masked for client protection. All on-site visits and negotiations are coordinated directly by MasterJiEstates executives.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

