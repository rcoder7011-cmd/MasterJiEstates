import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { fetchUserListings, withdrawListing } from '../../services/api.js';

export default function MyListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState(null);

  useEffect(() => {
    document.title = 'My Seller Listings | MasterJiEstates';
    let isMounted = true;

    async function loadListings() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchUserListings();
        if (isMounted) {
          setListings(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load submitted listings.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadListings();

    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" size="sm">Draft</Badge>;
      case 'pending_review':
        return <Badge variant="warning" size="sm">Verification Pending</Badge>;
      case 'available':
        return <Badge variant="success" size="sm">Active on Portal</Badge>;
      case 'changes_requested':
        return <Badge variant="warning" size="sm">Changes Requested</Badge>;
      case 'rejected':
        return <Badge variant="danger" size="sm">Rejected</Badge>;
      case 'under_negotiation':
        return <Badge variant="warning" size="sm">Under Negotiation</Badge>;
      case 'sold':
        return <Badge variant="default" size="sm">Sold</Badge>;
      case 'withdrawn':
        return <Badge variant="outline" size="sm">Withdrawn</Badge>;
      default:
        return <Badge variant="outline" size="sm">{status}</Badge>;
    }
  };

  const handleWithdraw = async (propId) => {
    if (!window.confirm('Are you sure you want to withdraw this listing from active marketing?')) {
      return;
    }
    setWithdrawingId(propId);
    setActionMessage(null);
    try {
      await withdrawListing(propId);
      setListings((prev) =>
        prev.map((item) =>
          (item.id === propId || item._id === propId)
            ? { ...item, availabilityStatus: 'withdrawn' }
            : item
        )
      );
      setActionMessage('Listing has been successfully withdrawn.');
    } catch (err) {
      setError(err?.message || 'Failed to withdraw listing.');
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-brand-navy flex items-center gap-2">
            <span>My Property Listings (Seller)</span>
            {listings.length > 0 && (
              <span className="text-xs font-bold text-brand-gold bg-brand-gold/15 px-2.5 py-0.5 rounded-full border border-brand-gold/30">
                {listings.length}
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review and monitor real estate assets you have submitted for brokerage mandate or direct sale.
          </p>
        </div>

        {/* Submit New Property CTA */}
        <div className="relative group">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/dashboard/listings/new')}
          >
            + Submit New Property
          </Button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{actionMessage}</span>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="text-emerald-700 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Information Notice for Seller Mandate */}
      <div className="p-4 rounded-2xl bg-brand-navy/5 border border-brand-navy/10 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-brand-navy text-brand-gold flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-xs text-slate-600 space-y-1">
          <div className="font-bold text-brand-navy">
            Seller Workflow & Quality Verification
          </div>
          <p>
            All listings submitted by external property owners undergo rigorous title verification and physical inspection by MasterJi field advisors before publication on the public directory.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          {error}
        </div>
      )}

      {/* Listings Inventory */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card flex gap-4">
              <div className="w-32 h-28 bg-slate-200 rounded-xl flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                <div className="h-8 bg-slate-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : listings.length > 0 ? (
        <div className="space-y-4">
          {listings.map((prop) => {
            const key = prop.id || prop.demoId || prop.slug;
            const isDraft = prop.availabilityStatus === 'draft' || prop.isDraft;
            const isPending = prop.availabilityStatus === 'pending_review';
            const isAvailable = prop.availabilityStatus === 'available';
            const isWithdrawn = prop.availabilityStatus === 'withdrawn';
            const isChangesRequested = prop.availabilityStatus === 'changes_requested';
            const isRejected = prop.availabilityStatus === 'rejected';
            const editLink = `/dashboard/listings/edit/${key}`;
            const publicLink = `/properties/${prop.slug || key}`;

            return (
              <article
                key={key}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 p-5 sm:p-6 flex flex-col md:flex-row gap-5 items-start"
              >
                {/* Property Image */}
                <div className="w-full md:w-40 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 relative">
                  {prop.imageUrl ? (
                    <img
                      src={prop.imageUrl}
                      alt={prop.title}
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
                  <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-brand-navy/90 text-white font-bold text-[10px] backdrop-blur-xs">
                    {prop.priceFormatted || 'Price on Request'}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-2.5 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant={prop.listingType === 'company_owned' ? 'direct' : 'brokerage'} size="sm">
                      {prop.listingTypeLabel || prop.listingType || 'Brokerage Mandate'}
                    </Badge>
                    {getStatusBadge(prop.availabilityStatus)}
                  </div>

                  <div>
                    <h3 className="text-base font-bold font-heading text-brand-navy hover:text-brand-gold transition-colors">
                      <Link to={isDraft || isChangesRequested ? editLink : isAvailable ? publicLink : '#'}>
                        {prop.title || 'Untitled Property Draft'}
                      </Link>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {prop.locality || 'Locality not set'}, {prop.city || 'City not set'} • {prop.categoryLabel || prop.category || 'Residential'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                    <span>Target Price: <strong className="text-brand-navy">{prop.priceFormatted || 'Not set'}</strong></span>
                    <span>•</span>
                    <span>Area: {prop.area || '—'} {prop.areaUnit || 'sqft'}</span>
                    <span>•</span>
                    <span>BHK: {prop.bedrooms || '—'}</span>
                  </div>

                  {/* Status Notes & Admin Feedback */}
                  {isPending && (
                    <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                      <span>⏳</span>
                      <span>Verification Pending: Our curation team is currently reviewing your property details and documents.</span>
                    </div>
                  )}

                  {isChangesRequested && prop.moderation?.changeRequestRemarks && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                      <strong className="block font-semibold text-amber-950">Action Required — Admin Remarks:</strong>
                      <p>{prop.moderation.changeRequestRemarks}</p>
                    </div>
                  )}

                  {isRejected && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                      <strong className="block font-semibold text-rose-950">Submission Rejected:</strong>
                      <p>{prop.moderation?.rejectionReason || 'This listing does not meet portal verification criteria.'}</p>
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">
                      Submitted: {new Date(prop.createdAt || Date.now()).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>

                    <div className="flex items-center gap-3">
                      {isDraft && (
                        <Link
                          to={editLink}
                          className="text-xs font-semibold text-brand-navy hover:text-white transition-colors flex items-center gap-1 bg-slate-100 hover:bg-brand-navy px-3 py-1 rounded-lg border border-slate-300"
                        >
                          <span>Continue Draft</span>
                          <span>✎</span>
                        </Link>
                      )}

                      {isChangesRequested && (
                        <Link
                          to={editLink}
                          className="text-xs font-semibold text-brand-navy hover:text-white transition-colors flex items-center gap-1 bg-brand-gold hover:bg-slate-900 px-3 py-1.5 rounded-lg border border-brand-gold shadow-xs"
                        >
                          <span>Edit & Resubmit</span>
                          <span>✎</span>
                        </Link>
                      )}

                      {isAvailable && (
                        <Link
                          to={publicLink}
                          className="text-xs font-semibold text-brand-navy hover:text-brand-gold transition-colors flex items-center gap-1 bg-brand-gold/20 hover:bg-brand-gold/30 px-3 py-1 rounded-lg border border-brand-gold/40"
                        >
                          <span>View Public Details</span>
                          <span>↗</span>
                        </Link>
                      )}

                      {(isAvailable || isPending) && (
                        <button
                          type="button"
                          onClick={() => handleWithdraw(key)}
                          disabled={withdrawingId === key}
                          className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors disabled:opacity-50"
                        >
                          {withdrawingId === key ? 'Withdrawing...' : 'Withdraw'}
                        </button>
                      )}

                      {isWithdrawn && (
                        <span className="text-xs text-neutral-400 italic">Withdrawn from Portal</span>
                      )}
                    </div>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-heading font-bold text-brand-navy">
            You haven't submitted any listings yet
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 mb-6">
            Looking to sell an apartment, villa, or residential plot? As a registered user, you can submit your property directly to our brokerage network.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/dashboard/listings/new')}
          >
            Submit a Property Listing
          </Button>
        </div>
      )}
    </div>
  );
}

