import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/layout/Header.jsx';
import Footer from '../../components/layout/Footer.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import WhatsAppButton from '../../components/common/WhatsAppButton.jsx';
import { COMPANY_CONFIG } from '../../config/companyConfig.js';
import PropertyBreadcrumbs from '../../components/property-details/PropertyBreadcrumbs.jsx';
import PropertyGallery from '../../components/property-details/PropertyGallery.jsx';
import PropertyOverview from '../../components/property-details/PropertyOverview.jsx';
import PropertySpecifications from '../../components/property-details/PropertySpecifications.jsx';
import PropertyDescription from '../../components/property-details/PropertyDescription.jsx';
import PropertyAmenities from '../../components/property-details/PropertyAmenities.jsx';
import PropertyLocation from '../../components/property-details/PropertyLocation.jsx';
import PropertyEnquiryCard from '../../components/property-details/PropertyEnquiryCard.jsx';
import SiteVisitModal from '../../components/property-details/SiteVisitModal.jsx';
import SimilarProperties from '../../components/property-details/SimilarProperties.jsx';
import { fetchPropertyById } from '../../services/api.js';
import { useFavourites } from '../../context/FavouritesContext.jsx';

export default function PropertyDetails() {
  const { id } = useParams();
  const { trackView } = useFavourites();
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [error, setError] = useState(null);
  const [siteVisitOpen, setSiteVisitOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    async function loadProperty() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetchPropertyById(id);
        if (!isMounted) return;

        if (res && res.property) {
          setProperty(res.property);
          setIsFallback(Boolean(res.isFallback));
          document.title = `${res.property.title} | MasterJiEstates`;
          trackView(res.property.id || id);
        } else {
          setProperty(null);
          document.title = 'Property Not Found | MasterJiEstates';
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load property details.');
        document.title = 'Error Loading Property | MasterJiEstates';
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProperty();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Handle smooth scroll to enquiry form for mobile users
  const scrollToEnquiry = () => {
    const el = document.getElementById('enquiry-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-canvas text-brand-dark selection:bg-brand-gold/30 selection:text-brand-navy">
      {/* Global Navigation Header */}
      <Header />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 py-6 sm:py-8 pb-24 lg:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            /* Loading Skeleton State */
            <div className="space-y-6 animate-pulse py-8">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-96 bg-slate-200 rounded-2xl w-full"></div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-4">
                  <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-32 bg-slate-200 rounded-xl w-full"></div>
                </div>
                <div className="lg:col-span-4">
                  <div className="h-72 bg-slate-200 rounded-2xl w-full"></div>
                </div>
              </div>
            </div>
          ) : error || !property ? (
            /* Not Found or Error State */
            <div className="py-12">
              <EmptyState
                title={error ? 'Unable to Load Property' : 'Property Listing Not Found'}
                description={
                  error
                    ? error
                    : `We could not locate any property listing matching ID "${id}". It may have been withdrawn or moved.`
                }
                action={
                  <Link to="/properties">
                    <Button variant="primary" size="md">
                      &larr; Return to Property Catalogue
                    </Button>
                  </Link>
                }
              />
            </div>
          ) : (
            /* Property Details Content */
            <div className="space-y-6">
              {/* Breadcrumb Navigation Bar */}
              <PropertyBreadcrumbs property={property} />

              {/* 2-Column Responsive Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Primary Left Column (8 of 12 columns on desktop) */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Photo Gallery & Lightbox */}
                  <PropertyGallery property={property} />

                  {/* Overview, Title, Pricing & Quick Actions */}
                  <PropertyOverview
                    property={property}
                    onRequestSiteVisit={() => setSiteVisitOpen(true)}
                  />

                  {/* Comprehensive Specifications Grid */}
                  <PropertySpecifications property={property} />

                  {/* Detailed Description */}
                  <PropertyDescription property={property} />

                  {/* Features & Amenities */}
                  <PropertyAmenities property={property} />

                  {/* Location & Neighborhood Intelligence */}
                  <PropertyLocation property={property} />
                </div>

                {/* Right Sticky Sidebar (4 of 12 columns on desktop) */}
                <div id="enquiry-section" className="lg:col-span-4">
                  <PropertyEnquiryCard
                    property={property}
                    onRequestSiteVisit={() => setSiteVisitOpen(true)}
                  />
                </div>
              </div>

              {/* Similar Properties Section */}
              <SimilarProperties currentProperty={property} />
            </div>
          )}
        </div>
      </main>

      {/* Escorted Site Visit Request Modal */}
      {property && (
        <SiteVisitModal
          isOpen={siteVisitOpen}
          onClose={() => setSiteVisitOpen(false)}
          property={property}
        />
      )}

      {/* Mobile Sticky Bottom Conversion Bar (Visible only on < 1024px) */}
      {property && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2.5 flex items-center justify-between gap-2 shadow-2xl lg:hidden">
          <div className="min-w-0 pr-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block leading-none">
              Price
            </span>
            <span className="text-sm font-bold font-heading text-brand-navy truncate block">
              {property.priceFormatted}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <WhatsAppButton
              context="property_details"
              data={{
                title: property?.title,
                locality: property?.locality,
                city: property?.city,
                priceFormatted: property?.priceFormatted,
                id: property?.id || property?._id,
              }}
              variant="solid"
              size="sm"
              className="px-2.5 py-1.5 text-xs font-semibold"
            >
              WhatsApp
            </WhatsAppButton>

            <a
              href={`tel:${COMPANY_CONFIG.phoneClean}`}
              aria-label={`Call MasterJi Advisor at ${COMPANY_CONFIG.phoneDisplay}`}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center justify-center transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-brand-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </a>

            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold py-1.5 px-2.5"
              onClick={scrollToEnquiry}
            >
              Enquire
            </Button>

            <Button
              variant="gold"
              size="sm"
              className="text-xs font-bold py-1.5 px-2.5 shadow-xs"
              onClick={() => setSiteVisitOpen(true)}
            >
              📅 Visit
            </Button>
          </div>
        </div>
      )}

      {/* Global Corporate Footer */}
      <Footer />
    </div>
  );
}
