import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { fetchUserSiteVisits, cancelSiteVisit } from '../../services/api.js';

export default function SiteVisits() {
  const [visits, setVisits] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'all' | 'past'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancellation modal state
  const [cancellingVisit, setCancellingVisit] = useState(null);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState(null);

  const loadVisits = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchUserSiteVisits();
      setVisits(data);
    } catch (err) {
      setError(err.message || 'Failed to load site visits.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Scheduled Site Visits | MasterJiEstates';
    loadVisits();
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancellingVisit) return;
    setIsSubmittingCancel(true);
    try {
      const id = cancellingVisit.bookingReference || cancellingVisit.id;
      await cancelSiteVisit(id);
      setCancelSuccessMsg(`Visit ${cancellingVisit.bookingReference} has been cancelled.`);
      setCancellingVisit(null);
      await loadVisits();
      setTimeout(() => setCancelSuccessMsg(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to cancel site visit. Please try again.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'requested':
        return <Badge variant="warning" size="sm">Visit Requested</Badge>;
      case 'confirmed':
        return <Badge variant="success" size="sm">Confirmed by Field Advisor</Badge>;
      case 'completed':
        return <Badge variant="default" size="sm">Tour Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" size="sm">Cancelled</Badge>;
      default:
        return <Badge variant="outline" size="sm">{status}</Badge>;
    }
  };

  // Filter based on active tab
  const filteredVisits = visits.filter((v) => {
    if (activeTab === 'upcoming') {
      return v.isUpcoming && v.status !== 'cancelled';
    }
    if (activeTab === 'past') {
      return !v.isUpcoming || v.status === 'completed' || v.status === 'cancelled';
    }
    return true; // 'all'
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-brand-navy">
            Escorted Site Visits
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Physical on-site walkthroughs scheduled with MasterJi field property advisors.
          </p>
        </div>

        <Link to="/properties">
          <Button variant="primary" size="sm">
            Schedule Another Visit
          </Button>
        </Link>
      </div>

      {/* Success Alert */}
      {cancelSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-fadeIn">
          <span>{cancelSuccessMsg}</span>
          <button onClick={() => setCancelSuccessMsg(null)} className="font-bold text-emerald-900">
            ✕
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          {error}
        </div>
      )}

      {/* Tab Controls */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'upcoming'
              ? 'bg-brand-navy text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Upcoming Visits
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'past'
              ? 'bg-brand-navy text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Past / Cancelled
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-brand-navy text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Visits ({visits.length})
        </button>
      </div>

      {/* Visit List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card animate-pulse flex gap-4">
              <div className="w-28 h-28 bg-slate-200 rounded-xl flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                <div className="h-8 bg-slate-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredVisits.length > 0 ? (
        <div className="space-y-4">
          {filteredVisits.map((visit) => {
            const prop = visit.property;
            const propertyId = visit.propertyId;
            const targetLink = `/properties/${prop?.slug || prop?.id || propertyId}`;
            const isCancellable = ['requested', 'confirmed'].includes(visit.status);

            return (
              <article
                key={visit.id || visit.bookingReference}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 p-5 sm:p-6 flex flex-col md:flex-row gap-5 items-start"
              >
                {/* Thumbnail */}
                <div className="w-full md:w-36 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 relative">
                  {prop?.imageUrl ? (
                    <img
                      src={prop.imageUrl}
                      alt={visit.propertyTitle}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                      </svg>
                    </div>
                  )}
                  {prop?.priceFormatted && (
                    <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-brand-navy/90 text-white font-bold text-[10px] backdrop-blur-xs">
                      {prop.priceFormatted}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-3 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-brand-gold bg-brand-gold/10 px-2.5 py-0.5 rounded-full border border-brand-gold/30">
                      {visit.bookingReference}
                    </span>
                    {getStatusBadge(visit.status)}
                  </div>

                  <div>
                    <h3 className="text-base font-bold font-heading text-brand-navy hover:text-brand-gold transition-colors">
                      <Link to={targetLink}>{visit.propertyTitle || 'Property Tour'}</Link>
                    </h3>
                    {prop?.locality && (
                      <p className="text-xs text-slate-500">
                        {prop.locality}, {prop.city}
                      </p>
                    )}
                  </div>

                  {/* Date & Slot Highlights */}
                  <div className="flex flex-wrap items-center gap-4 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 text-brand-navy font-semibold">
                      <svg className="w-4 h-4 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {new Date(visit.preferredDate).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{visit.preferredTimeSlot}</span>
                    </div>
                  </div>

                  {visit.notes && (
                    <p className="text-xs text-slate-500 italic">
                      Special note: "{visit.notes}"
                    </p>
                  )}

                  {/* Actions Bar */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                    <Link
                      to={targetLink}
                      className="text-xs font-semibold text-brand-navy hover:text-brand-gold flex items-center gap-1 transition-colors"
                    >
                      <span>View Listing</span>
                      <span>→</span>
                    </Link>

                    {isCancellable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCancellingVisit(visit)}
                        className="text-xs text-rose-600 hover:bg-rose-50 px-2 py-1"
                      >
                        Cancel Request
                      </Button>
                    )}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-heading font-bold text-brand-navy">
            No visits scheduled
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 mb-6">
            {activeTab === 'upcoming'
              ? 'You have no upcoming site visits. Explore properties and request an escorted on-site visit with our advisors.'
              : 'No visit records match this filter.'}
          </p>
          <Link to="/properties">
            <Button variant="primary" size="sm">
              Schedule a Site Visit
            </Button>
          </Link>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingVisit && (
        <Modal
          isOpen={Boolean(cancellingVisit)}
          onClose={() => setCancellingVisit(null)}
          title="Cancel Site Visit Request"
        >
          <div className="space-y-4 text-xs text-slate-600">
            <p>
              Are you sure you want to cancel the scheduled site visit for{' '}
              <strong className="text-brand-navy">
                "{cancellingVisit.propertyTitle || 'this property'}"
              </strong>{' '}
              on{' '}
              <strong>
                {new Date(cancellingVisit.preferredDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </strong>{' '}
              ({cancellingVisit.preferredTimeSlot})?
            </p>
            <p className="text-slate-500">
              Reference Code: <span className="font-mono font-bold text-brand-navy">{cancellingVisit.bookingReference}</span>
            </p>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancellingVisit(null)}
                disabled={isSubmittingCancel}
              >
                Keep Booking
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmCancel}
                isLoading={isSubmittingCancel}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Yes, Cancel Visit
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

