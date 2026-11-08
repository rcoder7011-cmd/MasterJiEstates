import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ConfirmActionModal from '../../components/admin/ConfirmActionModal.jsx';
import {
  fetchModerationProperty,
  approveProperty,
  rejectProperty,
  requestPropertyChanges,
} from '../../services/api.js';

export default function PropertyReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Modal states
  const [modalType, setModalType] = useState(null); // 'approve' | 'reject' | 'changes' | null
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    document.title = 'Review Property Submission | MasterJiEstates Admin';
    let isMounted = true;

    async function loadProperty() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchModerationProperty(id);
        if (isMounted) {
          setProperty(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Failed to load property details.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadProperty();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleApprove = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const updated = await approveProperty(id, { notes: 'Approved by admin via Moderation Suite' });
      setProperty(updated);
      setActionSuccess('Property listing approved and published to the public directory!');
      setModalType(null);
    } catch (err) {
      setError(err?.message || 'Failed to approve listing.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (reason) => {
    setIsProcessing(true);
    setError(null);
    try {
      const updated = await rejectProperty(id, { reason });
      setProperty(updated);
      setActionSuccess(`Listing rejected with feedback recorded for the seller.`);
      setModalType(null);
    } catch (err) {
      setError(err?.message || 'Failed to reject listing.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestChanges = async (remarks) => {
    setIsProcessing(true);
    setError(null);
    try {
      const updated = await requestPropertyChanges(id, { remarks });
      setProperty(updated);
      setActionSuccess('Change request successfully issued. Seller can now update and resubmit.');
      setModalType(null);
    } catch (err) {
      setError(err?.message || 'Failed to request changes.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4" />
        <h3 className="text-sm font-semibold text-slate-800">Loading Property Submission...</h3>
      </div>
    );
  }

  if (error && !property) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs mb-4">
          {error}
        </div>
        <Link
          to="/admin/moderation"
          className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline"
        >
          ← Return to Moderation Queue
        </Link>
      </div>
    );
  }

  const images = property.images || [];
  const coverImage = images[0] || property.imageUrl;
  const isPending = property.availabilityStatus === 'pending_review';

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link to="/admin" className="hover:text-slate-800">
              Admin
            </Link>
            <span>/</span>
            <Link to="/admin/moderation" className="hover:text-slate-800">
              Moderation Queue
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">{property.id}</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-[#0A192F]">
            Review Property Submission
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isPending ? (
            <>
              <button
                type="button"
                onClick={() => setModalType('changes')}
                className="px-3.5 py-2 rounded-xl border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 text-xs font-semibold transition-colors"
              >
                Request Changes ✎
              </button>
              <button
                type="button"
                onClick={() => setModalType('reject')}
                className="px-3.5 py-2 rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 text-xs font-semibold transition-colors"
              >
                Reject ✕
              </button>
              <button
                type="button"
                onClick={() => setModalType('approve')}
                className="px-5 py-2 rounded-xl bg-[#0A192F] hover:bg-[#112340] text-amber-400 text-xs font-bold shadow-md transition-colors"
              >
                Approve & Publish ✦
              </button>
            </>
          ) : (
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Status: {property.availabilityLabel || property.availabilityStatus}
            </span>
          )}
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-emerald-700 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Main Review Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Property Details & Media (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                {property.categoryLabel || property.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">Ref ID: {property.id}</span>
            </div>

            <h3 className="text-xl font-bold font-serif text-[#0A192F] leading-tight">
              {property.title}
            </h3>

            {property.tagline && (
              <p className="text-xs text-slate-500 italic">{property.tagline}</p>
            )}

            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl font-bold font-serif text-amber-700">
                {property.priceFormatted}
              </span>
              {property.priceNegotiable && (
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Negotiable
                </span>
              )}
            </div>

            <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed pt-2 border-t border-slate-100">
              {property.description}
            </p>
          </div>

          {/* Photo Gallery Grid */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Submitted Photos ({images.length})
              </h4>
              <span className="text-[11px] text-slate-400">Cover indicated with gold border</span>
            </div>

            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className={`aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 relative border-2 ${
                      idx === 0 ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`View ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 bg-amber-600 text-white text-[9px] uppercase font-bold px-2 py-0.5 rounded shadow">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No photos submitted.</p>
            )}
          </div>

          {/* Specifications & Location */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Location Details
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Locality</span>
                  <span className="font-semibold text-slate-900">{property.locality || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">City</span>
                  <span className="font-semibold text-slate-900">{property.city || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">State</span>
                  <span className="font-semibold text-slate-900">{property.state || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Pincode</span>
                  <span className="font-semibold text-slate-900">{property.pincode || '—'}</span>
                </div>
              </div>
              {property.landmark && (
                <p className="text-xs text-slate-500 mt-2">
                  <span className="font-semibold text-slate-700">Landmark:</span> {property.landmark}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Specifications
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Built-up Area</span>
                  <span className="font-semibold text-slate-900">
                    {property.area} {property.areaUnit || 'sqft'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Configuration</span>
                  <span className="font-semibold text-slate-900">
                    {property.bedrooms ? `${property.bedrooms} BHK` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Bathrooms</span>
                  <span className="font-semibold text-slate-900">{property.bathrooms || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Parking</span>
                  <span className="font-semibold text-slate-900">
                    {property.parking ? `${property.parking} Reserved` : 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Amenities
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {property.amenities.map((item) => (
                    <span
                      key={item}
                      className="px-2.5 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-800 capitalize border border-slate-200"
                    >
                      ✓ {item.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Seller Information & Moderation Protocol (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Seller Profile Card (Unmasked for Admin) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A192F] flex items-center gap-1.5">
              <span>👤</span> Property Owner & Representation
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Full Name</span>
                <span className="font-bold text-slate-900 text-sm">
                  {property.owner?.name || 'Unspecified Owner'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Phone Number</span>
                {property.owner?.phone ? (
                  <a
                    href={`tel:${property.owner.phone}`}
                    className="font-mono text-amber-700 hover:underline font-semibold"
                  >
                    📞 {property.owner.phone}
                  </a>
                ) : (
                  <span className="text-slate-400">Not provided</span>
                )}
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Email Address</span>
                {property.owner?.email ? (
                  <a
                    href={`mailto:${property.owner.email}`}
                    className="text-slate-700 hover:underline truncate block"
                  >
                    ✉ {property.owner.email}
                  </a>
                ) : (
                  <span className="text-slate-400">Not provided</span>
                )}
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Registered User ID</span>
                <span className="font-mono text-[10px] text-slate-500">
                  {property.owner?.userId || 'N/A'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              Listing Type:{' '}
              <strong className="text-slate-800 capitalize">
                {property.listingTypeLabel || property.listingType}
              </strong>
            </div>
          </div>

          {/* Moderation History / Protocol */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A192F]">
              Moderation Checklist
            </h4>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Seller agreed to MasterJi brokerage mandate.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Photographs checked for appropriate resolution.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Price is aligned with sector market benchmarks.</span>
              </div>
            </div>

            {property.moderation?.rejectionReason && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                <strong>Previous Rejection Reason:</strong> {property.moderation.rejectionReason}
              </div>
            )}

            {property.moderation?.changeRequestRemarks && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <strong>Pending Correction Remarks:</strong>{' '}
                {property.moderation.changeRequestRemarks}
              </div>
            )}
          </div>

          {/* Statutory Caveat */}
          <div className="p-4 rounded-xl bg-slate-100 text-[11px] text-slate-500 leading-relaxed border border-slate-200">
            <strong>Administrative Notice:</strong> Approving this listing marks it as published on the public catalogue. Administrative approval confirms catalog completeness and does not constitute title indemnity or structural engineering guarantees.
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmActionModal
        isOpen={modalType === 'approve'}
        onClose={() => setModalType(null)}
        onConfirm={handleApprove}
        title="Approve Property Listing?"
        message="This action will mark the listing as 'Available' and immediately publish it to the public real estate directory."
        confirmLabel="Approve & Publish"
        confirmVariant="primary"
        isLoading={isProcessing}
      />

      <ConfirmActionModal
        isOpen={modalType === 'reject'}
        onClose={() => setModalType(null)}
        onConfirm={handleReject}
        title="Reject Property Listing"
        message="Please provide a clear reason for the rejection. This feedback will be saved to the seller's dashboard history."
        confirmLabel="Reject Submission"
        confirmVariant="danger"
        requireReason={true}
        reasonLabel="Rejection Explanation"
        reasonPlaceholder="e.g., Unclear documentation, duplicate listing, or unverified contact details..."
        isLoading={isProcessing}
      />

      <ConfirmActionModal
        isOpen={modalType === 'changes'}
        onClose={() => setModalType(null)}
        onConfirm={handleRequestChanges}
        title="Request Changes from Seller"
        message="Explain what needs to be corrected. The listing will be returned to draft state with 'Changes Requested' status so the seller can revise and resubmit."
        confirmLabel="Send Change Request"
        confirmVariant="warning"
        requireReason={true}
        reasonLabel="Required Corrections"
        reasonPlaceholder="e.g., Please upload higher resolution balcony photos and verify the exact floor number..."
        isLoading={isProcessing}
      />
    </div>
  );
}

