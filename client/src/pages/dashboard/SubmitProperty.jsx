import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import StepProgress from '../../components/property-submission/StepProgress.jsx';
import Step1BasicInfo from '../../components/property-submission/Step1BasicInfo.jsx';
import Step2Location from '../../components/property-submission/Step2Location.jsx';
import Step3Specifications from '../../components/property-submission/Step3Specifications.jsx';
import Step4Pricing from '../../components/property-submission/Step4Pricing.jsx';
import Step5Photos from '../../components/property-submission/Step5Photos.jsx';
import Step6ReviewSubmit from '../../components/property-submission/Step6ReviewSubmit.jsx';
import Modal from '../../components/ui/Modal.jsx';
import {
  createPropertyDraft,
  updatePropertyDraft,
  fetchOwnedListingById,
  submitListingForReview,
} from '../../services/api.js';

const INITIAL_FORM_DATA = {
  // Section A: Listing Type
  sellerListingType: 'owner', // 'owner' | 'brokerage'
  listingType: 'owner',
  // Section B: Basic Information
  purpose: 'sale', // 'sale' | 'rent'
  title: '',
  category: 'apartment',
  tagline: '',
  description: '',
  // Section C: Location Details
  city: 'Noida',
  locality: '',
  address: '', // Private street address (Admin-only)
  state: 'Uttar Pradesh',
  pincode: '',
  landmark: '',
  // Section D: Specifications
  area: '',
  areaUnit: 'sqft',
  bedrooms: '3',
  bathrooms: 2,
  balconies: 2,
  parking: 1,
  furnishing: 'Semi-Furnished',
  facing: 'North-East',
  floor: '',
  // Plot specifics
  plotDimensions: '',
  hasBoundaryWall: false,
  isCornerPlot: false,
  // Commercial specifics
  washrooms: '1',
  // Section E: Amenities
  amenities: [],
  // Section B/Pricing: Commercial terms
  price: '',
  priceNegotiable: true,
  availabilityLabel: 'Ready to Move',
  // Section F: Photos
  images: [],
  // Section G: Seller Contact Details
  ownerName: '',
  ownerPhone: '',
  ownerEmail: '',
  // Section H: Declaration
  agreedToDeclaration: false,
};

function formatIndianPriceDisplay(val, isRent = false) {
  const num = Number(val);
  if (!num || isNaN(num) || num <= 0) return '₹0';
  if (isRent) {
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakh / month`;
    return `₹${num.toLocaleString('en-IN')} / month`;
  }
  if (num >= 10000000) {
    const cr = num / 10000000;
    return `₹${cr % 1 === 0 ? cr : cr.toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    const lk = num / 100000;
    return `₹${lk % 1 === 0 ? lk : lk.toFixed(2)} Lakhs`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

export default function SubmitProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [draftId, setDraftId] = useState(id || null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success'|'error', message }
  const [submittedListing, setSubmittedListing] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Pre-fill authenticated seller contact details when user object is available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        ownerName: prev.ownerName || user.fullName || user.name || '',
        ownerPhone: prev.ownerPhone || user.phone || user.phoneNumber || '',
        ownerEmail: prev.ownerEmail || user.email || '',
      }));
    }
  }, [user]);

  // Load existing draft if editing
  useEffect(() => {
    let isMounted = true;
    async function loadExistingDraft() {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await fetchOwnedListingById(id);
        if (isMounted && data) {
          setDraftId(data.id || data._id);
          setFormData((prev) => ({
            ...prev,
            sellerListingType: data.sellerListingType || (data.listingType === 'company_owned' ? 'brokerage' : (data.listingType || 'owner')),
            listingType: data.listingType || data.sellerListingType || 'owner',
            purpose: data.purpose || 'sale',
            title: data.title || '',
            category: data.category || 'apartment',
            tagline: data.tagline || '',
            description: data.description || '',
            city: data.city || data.location?.city || 'Noida',
            locality: data.locality || data.location?.locality || '',
            address: data.privateAddress || data.address || '',
            state: data.state || data.location?.state || 'Uttar Pradesh',
            pincode: data.pincode || data.location?.pincode || '',
            landmark: data.landmark || data.location?.landmark || '',
            area: data.area || data.specifications?.area || '',
            areaUnit: data.areaUnit || data.specifications?.areaUnit || 'sqft',
            bedrooms: data.bedrooms?.toString() || data.specifications?.bedrooms?.toString() || '3',
            bathrooms: data.bathrooms ?? data.specifications?.bathrooms ?? 2,
            balconies: data.balconies ?? 2,
            parking: data.parking ?? data.specifications?.parkingSpaces ?? 1,
            furnishing: data.furnishing || data.specifications?.furnishingStatus || 'Semi-Furnished',
            facing: data.facing || data.specifications?.facing || 'North-East',
            floor: data.floor || '',
            plotDimensions: data.plotDimensions || '',
            hasBoundaryWall: Boolean(data.hasBoundaryWall),
            isCornerPlot: Boolean(data.isCornerPlot),
            washrooms: data.washrooms || '1',
            amenities: Array.isArray(data.amenities) ? data.amenities : [],
            price: data.price?.toString() || '',
            priceNegotiable: data.priceNegotiable !== false,
            availabilityLabel: data.availabilityLabel || 'Ready to Move',
            images: data.cloudinaryAssets?.length
              ? data.cloudinaryAssets
              : (data.images || []).map((url, i) => ({
                  publicId: `img_${i}`,
                  url,
                  secureUrl: url,
                  isCover: i === 0,
                })),
            ownerName: data.owner?.name || prev.ownerName || user?.fullName || '',
            ownerPhone: data.owner?.phone || prev.ownerPhone || user?.phone || '',
            ownerEmail: data.owner?.email || prev.ownerEmail || user?.email || '',
            agreedToDeclaration: false,
          }));
        }
      } catch (err) {
        if (isMounted) {
          setNotification({
            type: 'error',
            message: err?.message || 'Failed to load property draft.',
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadExistingDraft();
    return () => {
      isMounted = false;
    };
  }, [id, user]);

  const handleFieldChange = useCallback((updatedFields) => {
    setFormData((prev) => ({ ...prev, ...updatedFields }));
    // Clear field-specific errors
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(updatedFields).forEach((k) => delete next[k]);
      return next;
    });
  }, []);

  // Step-by-step validations before advancing
  const validateStep = (step) => {
    const errs = {};
    if (step === 1) {
      if (!formData.title?.trim()) {
        errs.title = 'Title is required (minimum 10 characters).';
      } else if (formData.title.trim().length < 10) {
        errs.title = 'Title must be at least 10 characters.';
      }
      if (!formData.category) {
        errs.category = 'Please select a property category.';
      }
      if (!formData.description?.trim()) {
        errs.description = 'Description is required (minimum 20 characters).';
      } else if (formData.description.trim().length < 20) {
        errs.description = 'Description must be at least 20 characters.';
      }
    } else if (step === 2) {
      if (!formData.city?.trim()) errs.city = 'City name is required.';
      if (!formData.locality?.trim()) errs.locality = 'Locality / Sector is required.';
      if (formData.pincode && !/^\d{6}$/.test(formData.pincode.trim())) {
        errs.pincode = 'Pincode must be a valid 6-digit Indian postal code.';
      }
    } else if (step === 3) {
      if (!formData.area || Number(formData.area) <= 0) {
        errs.area = 'Please enter a valid area.';
      }
      const isPlot = formData.category === 'residential_plot';
      const isCommercial =
        formData.category === 'commercial_property' || formData.category === 'commercial_building';
      if (!isPlot && !isCommercial) {
        if (!formData.bedrooms) {
          errs.bedrooms = 'Bedrooms (BHK) configuration is required.';
        }
      }
    } else if (step === 4) {
      if (!formData.price || Number(formData.price) <= 0) {
        errs.price = 'Please specify a valid asking price or rent in INR.';
      }
    } else if (step === 5) {
      if (!formData.images || formData.images.length === 0) {
        errs.images = 'Please upload at least 1 photograph of your property.';
      }
    } else if (step === 6) {
      if (!formData.ownerName?.trim()) {
        errs.ownerName = 'Seller full name is required.';
      }
      if (!formData.ownerPhone?.trim()) {
        errs.ownerPhone = 'Seller mobile phone number is required.';
      } else if (!/^[6-9]\d{9}$/.test(formData.ownerPhone.trim().replace(/[\s-]/g, ''))) {
        errs.ownerPhone = 'Please enter a valid 10-digit Indian mobile number.';
      }
      if (!formData.ownerEmail?.trim()) {
        errs.ownerEmail = 'Seller email address is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail.trim())) {
        errs.ownerEmail = 'Please enter a valid email address.';
      }
      if (!formData.agreedToDeclaration) {
        errs.declaration = 'You must confirm the accuracy declaration before submitting.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      const nextStep = Math.min(currentStep + 1, 6);
      setCurrentStep(nextStep);
      setMaxStepReached((prev) => Math.max(prev, nextStep));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpToStep = (stepNumber) => {
    setCurrentStep(stepNumber);
    setMaxStepReached((prev) => Math.max(prev, stepNumber));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build payload for backend API
  const buildPayload = () => {
    const chosenType = formData.sellerListingType || formData.listingType || 'owner';
    return {
      listingType: chosenType,
      sellerListingType: chosenType,
      title: formData.title.trim(),
      category: formData.category,
      purpose: formData.purpose || 'sale',
      tagline: formData.tagline.trim(),
      description: formData.description.trim(),
      city: formData.city.trim(),
      locality: formData.locality.trim(),
      state: formData.state.trim(),
      pincode: formData.pincode.trim(),
      landmark: formData.landmark.trim(),
      address: (formData.address || '').trim(),
      privateAddress: (formData.address || '').trim(),
      area: Number(formData.area) || 0,
      areaUnit: formData.areaUnit || 'sqft',
      bedrooms: Number(formData.bedrooms) || 0,
      bathrooms: Number(formData.bathrooms) || 0,
      balconies: Number(formData.balconies) || 0,
      parking: Number(formData.parking) || 0,
      furnishing: formData.furnishing || 'Semi-Furnished',
      facing: formData.facing || '',
      floor: formData.floor || '',
      plotDimensions: formData.plotDimensions || '',
      hasBoundaryWall: Boolean(formData.hasBoundaryWall),
      isCornerPlot: Boolean(formData.isCornerPlot),
      washrooms: formData.washrooms || '1',
      amenities: formData.amenities || [],
      price: Number(formData.price) || 0,
      priceNegotiable: formData.priceNegotiable !== false,
      availabilityLabel: formData.availabilityLabel || 'Ready to Move',
      ownerName: (formData.ownerName || user?.fullName || '').trim(),
      ownerPhone: (formData.ownerPhone || user?.phone || '').trim().replace(/[\s-]/g, ''),
      ownerEmail: (formData.ownerEmail || user?.email || '').trim().toLowerCase(),
      cloudinaryAssets: formData.images,
      images: formData.images.map((img) => img.secureUrl || img.url),
    };
  };

  // Save current progress as draft
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    setNotification(null);
    try {
      const payload = buildPayload();
      let saved;
      if (draftId) {
        saved = await updatePropertyDraft(draftId, payload);
      } else {
        saved = await createPropertyDraft(payload);
        if (saved?.id || saved?._id) {
          setDraftId(saved.id || saved._id);
        }
      }
      setNotification({
        type: 'success',
        message: 'Property draft saved successfully to MongoDB! You can resume editing anytime.',
      });
    } catch (err) {
      const fieldErrors = {};
      let detailedMsg = err?.message || 'Failed to save property draft.';

      if (Array.isArray(err?.errors) && err.errors.length > 0) {
        err.errors.forEach((e) => {
          if (e.field) fieldErrors[e.field] = e.message;
        });
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
        detailedMsg = err.errors.map((e) => e.message).join(' • ');
      }

      setNotification({
        type: 'error',
        message: detailedMsg,
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Final submission for review
  const handleSubmitForReview = async () => {
    // Validate all 6 steps
    for (let s = 1; s <= 6; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        setNotification({
          type: 'error',
          message: `Please complete all required fields in Step ${s} before submitting.`,
        });
        return;
      }
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      const payload = buildPayload();
      let activeDraftId = draftId;

      if (!activeDraftId) {
        const created = await createPropertyDraft(payload);
        activeDraftId = created.id || created._id;
        setDraftId(activeDraftId);
      } else {
        await updatePropertyDraft(activeDraftId, payload);
      }

      // Submit draft for administrative curation review
      const result = await submitListingForReview(activeDraftId, {
        ...payload,
        agreedToDeclaration: formData.agreedToDeclaration,
        submissionNotes: 'Submitted by seller via Unified Portal',
      });

      const submissionId = activeDraftId || result.data?.id || result.data?._id;

      // Navigate to homepage with submission details in router state
      navigate('/', {
        state: {
          submissionSuccess: {
            id: submissionId,
            title: formData.title,
            status: 'Pending Review',
          },
        },
      });
    } catch (err) {
      const fieldErrors = {};
      let detailedMsg = err?.message || 'Failed to submit property for review.';

      if (Array.isArray(err?.errors) && err.errors.length > 0) {
        err.errors.forEach((e) => {
          if (e.field) fieldErrors[e.field] = e.message;
        });
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
        detailedMsg = err.errors.map((e) => e.message).join(' • ');
      }

      setNotification({
        type: 'error',
        message: detailedMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Loading State (NO DashboardLayout wrapper)
  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-brand-navy rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold text-brand-navy">Loading Property Draft...</h2>
        <p className="text-xs text-slate-500 mt-1">Retrieving persistent data from database</p>
      </div>
    );
  }

  // 2. Submission Success Screen (NO DashboardLayout wrapper)
  if (submittedListing) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center animate-fadeIn">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner font-bold">
          ✓
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 mb-3 border border-amber-200">
          Status: Verification Pending (Saved to MongoDB)
        </span>

        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-brand-navy mb-2">
          Property Submitted for Curation
        </h1>

        <p className="text-xs text-slate-600 mb-8 leading-relaxed max-w-lg mx-auto">
          Thank you for listing your property with MasterJiEstates. Your property submission{' '}
          <strong className="text-brand-navy">"{formData.title}"</strong> has been saved and transferred to our administrative review desk.
        </p>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-left shadow-sm space-y-4 mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
            Next Steps in Our Curation Protocol
          </h3>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold flex-shrink-0 text-xs">
                1
              </span>
              <div>
                <strong className="text-brand-navy block">Title & Legal Inspection</strong>
                Our team verifies registry ownership records within 24-48 business hours.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold flex-shrink-0 text-xs">
                2
              </span>
              <div>
                <strong className="text-brand-navy block">Photography & Watermarking</strong>
                Showcase assets are reviewed and optimized for premium presentation.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold flex-shrink-0 text-xs">
                3
              </span>
              <div>
                <strong className="text-brand-navy block">Public Portal Publishing</strong>
                Once verified, your listing goes live to buyers across Delhi NCR.
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/dashboard/listings"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-navy text-brand-gold text-xs font-bold hover:bg-slate-900 transition-colors shadow-sm"
          >
            Go to My Listings
          </Link>
          <button
            type="button"
            onClick={() => {
              setSubmittedListing(null);
              setDraftId(null);
              setFormData(INITIAL_FORM_DATA);
              setCurrentStep(1);
              setMaxStepReached(1);
              navigate('/dashboard/listings/new');
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Submit Another Property
          </button>
        </div>
      </div>
    );
  }

  // 3. Main Form UI (NO DashboardLayout wrapper — rendered inside DashboardLayout Outlet)
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Header Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link to="/dashboard" className="hover:text-brand-navy">
              Dashboard
            </Link>
            <span>/</span>
            <Link to="/dashboard/listings" className="hover:text-brand-navy">
              My Listings
            </Link>
            <span>/</span>
            <span className="text-brand-navy font-semibold">
              {id ? 'Edit Draft' : 'Submit Property'}
            </span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-brand-navy">
            {id ? 'Edit Property Listing' : 'Submit Property for Listing'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete the details below to list your residential or commercial real estate.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <span>👁</span> Preview
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSavingDraft || isSubmitting}
            className="px-4 py-2 rounded-xl border border-brand-navy text-brand-navy text-xs font-bold hover:bg-brand-navy/5 transition-colors disabled:opacity-50"
          >
            {isSavingDraft ? 'Saving Draft...' : 'Save Draft'}
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{notification.type === 'success' ? '✓' : '⚠'}</span>
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-sm font-bold opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Wizard Steps Progress Indicator */}
      <StepProgress
        currentStep={currentStep}
        onStepClick={handleJumpToStep}
        maxStepReached={maxStepReached}
      />

      {/* Wizard Step Body */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {currentStep === 1 && (
          <Step1BasicInfo
            formData={formData}
            updateFormData={handleFieldChange}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {currentStep === 2 && (
          <Step2Location
            formData={formData}
            updateFormData={handleFieldChange}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {currentStep === 3 && (
          <Step3Specifications
            formData={formData}
            updateFormData={handleFieldChange}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {currentStep === 4 && (
          <Step4Pricing
            formData={formData}
            updateFormData={handleFieldChange}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {currentStep === 5 && (
          <Step5Photos
            formData={formData}
            updateFormData={handleFieldChange}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {currentStep === 6 && (
          <Step6ReviewSubmit
            formData={formData}
            updateFormData={handleFieldChange}
            onChange={handleFieldChange}
            onJumpToStep={handleJumpToStep}
            isSubmitting={isSubmitting}
            isSavingDraft={isSavingDraft}
            onSaveDraft={handleSaveDraft}
            onOpenPreview={() => setIsPreviewOpen(true)}
            onSubmitForReview={handleSubmitForReview}
            errors={errors}
          />
        )}

        {/* Stepper Footer Controls (for Steps 1-5) */}
        {currentStep < 6 && (
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                ← Back
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
                className="px-4 py-2.5 text-xs text-slate-500 hover:text-brand-navy font-medium underline"
              >
                Save progress & finish later
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-brand-navy hover:bg-slate-900 text-brand-gold text-xs font-bold shadow-md transition-colors"
              >
                Next Step →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Interactive "Preview Listing" Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Public Listing Preview"
        size="xl"
      >
        <div className="space-y-6">
          <div className="p-3 bg-brand-navy/5 rounded-xl text-xs text-slate-600 border border-brand-navy/10 flex items-center gap-2">
            <span>ℹ️</span>
            <span>
              This is how your listing will appear to buyers on the MasterJiEstates public catalogue once approved.
            </span>
          </div>

          {/* Listing Card Preview */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
            {/* Hero Image */}
            <div className="w-full h-56 bg-slate-100 relative">
              {formData.images?.[0] ? (
                <img
                  src={formData.images[0].secureUrl || formData.images[0].url}
                  alt={formData.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <span className="text-3xl mb-1">🖼</span>
                  <span className="text-xs">No Cover Photo Uploaded</span>
                </div>
              )}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-navy text-brand-gold shadow-sm">
                  {formData.category?.replace(/_/g, ' ')}
                </span>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/90 text-slate-800 shadow-sm backdrop-blur-xs">
                  {formData.purpose === 'rent' ? 'For Rent' : 'For Sale'}
                </span>
              </div>
              <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] backdrop-blur-xs">
                {formData.images?.length || 0} Photos
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-heading font-bold text-brand-navy">
                    {formData.title || 'Untitled Property'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    📍 {formData.locality ? `${formData.locality}, ` : ''}{formData.city || 'NCR'} (Exact address confidential)
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-heading font-bold text-brand-navy">
                    {formatIndianPriceDisplay(formData.price, formData.purpose === 'rent')}
                  </div>
                  {formData.priceNegotiable && (
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Negotiable
                    </span>
                  )}
                </div>
              </div>

              {/* Specs Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Area</span>
                  <span className="font-bold text-slate-800">
                    {formData.area ? `${formData.area} ${formData.areaUnit || 'sqft'}` : '—'}
                  </span>
                </div>
                {formData.category !== 'residential_plot' && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] block">Configuration</span>
                    <span className="font-bold text-slate-800">
                      {formData.bedrooms ? `${formData.bedrooms} BHK` : '—'}
                    </span>
                  </div>
                )}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Facing</span>
                  <span className="font-bold text-slate-800">{formData.facing || '—'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Possession</span>
                  <span className="font-bold text-slate-800">{formData.availabilityLabel || 'Ready'}</span>
                </div>
              </div>

              {/* Narrative */}
              <div>
                <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider mb-1">
                  About this Property
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {formData.description || 'No description provided.'}
                </p>
              </div>

              {/* Public Contact Card (Strictly pointing to MasterJiEstates, never seller) */}
              <div className="p-4 bg-brand-navy/5 rounded-xl border border-brand-navy/15 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-brand-navy block">
                    Interested in this property?
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Buyers connect with MasterJiEstates verified advisors (+91 9990316186).
                  </span>
                </div>
                <span className="px-4 py-1.5 bg-brand-navy text-brand-gold font-bold text-xs rounded-xl shadow-xs">
                  Contact MasterJi Desk
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Close Preview
            </button>
            {currentStep === 6 && (
              <button
                type="button"
                onClick={() => {
                  setIsPreviewOpen(false);
                  handleSubmitForReview();
                }}
                className="px-6 py-2.5 rounded-xl bg-brand-navy text-brand-gold text-xs font-bold hover:bg-slate-900"
              >
                Confirm & Submit for Review
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
