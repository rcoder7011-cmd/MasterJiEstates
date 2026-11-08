import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { fetchUserEnquiries } from '../../services/api.js';

export default function MyEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'My Enquiries | MasterJiEstates';
    let isMounted = true;

    async function loadEnquiries() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchUserEnquiries(statusFilter);
        if (isMounted) {
          setEnquiries(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to retrieve your enquiries.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadEnquiries();

    return () => {
      isMounted = false;
    };
  }, [statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <Badge variant="brand" size="sm">Received / Pending</Badge>;
      case 'contacted':
        return <Badge variant="success" size="sm">Advisor Contacted</Badge>;
      case 'follow_up':
        return <Badge variant="warning" size="sm">Follow-up in Progress</Badge>;
      case 'converted':
        return <Badge variant="success" size="sm">Deal Proceeding</Badge>;
      case 'closed':
        return <Badge variant="default" size="sm">Closed</Badge>;
      default:
        return <Badge variant="outline" size="sm">{status}</Badge>;
    }
  };

  const filterTabs = [
    { id: 'all', label: 'All Inquiries' },
    { id: 'new', label: 'Received' },
    { id: 'contacted', label: 'Contacted' },
    { id: 'follow_up', label: 'In Progress' },
    { id: 'closed', label: 'Closed' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-brand-navy">
            My Property Inquiries
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track inquiries submitted directly to MasterJi property advisors with real-time status.
          </p>
        </div>

        <Link to="/properties">
          <Button variant="primary" size="sm">
            Browse More Properties
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === tab.id
                ? 'bg-brand-navy text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          {error}
        </div>
      )}

      {/* Inquiries Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card animate-pulse flex gap-4">
              <div className="w-24 h-24 bg-slate-200 rounded-xl flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                <div className="h-12 bg-slate-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : enquiries.length > 0 ? (
        <div className="space-y-4">
          {enquiries.map((enq) => {
            const prop = enq.property;
            const propertyId = enq.propertyId;
            const targetLink = `/properties/${prop?.slug || prop?.id || propertyId}`;

            return (
              <article
                key={enq.id || enq.referenceCode}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 p-5 sm:p-6 flex flex-col md:flex-row gap-5 items-start"
              >
                {/* Property Thumbnail */}
                <div className="w-full md:w-36 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 relative">
                  {prop?.imageUrl ? (
                    <img
                      src={prop.imageUrl}
                      alt={enq.propertyTitle}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  )}
                  {prop?.priceFormatted && (
                    <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-brand-navy/90 text-white font-bold text-[10px] backdrop-blur-xs">
                      {prop.priceFormatted}
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="flex-1 min-w-0 space-y-2.5 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-brand-gold bg-brand-gold/10 px-2.5 py-0.5 rounded-full border border-brand-gold/30">
                      {enq.referenceCode}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">
                        Submitted on{' '}
                        {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      {getStatusBadge(enq.status)}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold font-heading text-brand-navy hover:text-brand-gold transition-colors">
                      <Link to={targetLink}>{enq.propertyTitle || 'Property'}</Link>
                    </h3>
                    {prop?.locality && (
                      <p className="text-xs text-slate-500">
                        {prop.locality}, {prop.city}
                      </p>
                    )}
                  </div>

                  {/* Message Summary */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-600 italic">
                    "{enq.message}"
                  </div>

                  {/* Action Link */}
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Contact: {enq.phone}
                    </span>
                    <Link
                      to={targetLink}
                      className="text-xs font-semibold text-brand-navy hover:text-brand-gold flex items-center gap-1 transition-colors"
                    >
                      <span>View Property Details</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-lg font-heading font-bold text-brand-navy">
            No inquiries found
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 mb-6">
            {statusFilter === 'all'
              ? "You haven't submitted any property inquiries yet. Browse verified listings and connect with our advisors."
              : `You have no inquiries with status "${statusFilter}".`}
          </p>
          <Link to="/properties">
            <Button variant="primary" size="sm">
              Explore Available Properties
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

