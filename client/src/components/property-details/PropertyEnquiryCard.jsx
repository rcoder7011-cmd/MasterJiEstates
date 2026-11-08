import React, { useState } from 'react';
import Button from '../ui/Button.jsx';
import Badge from '../ui/Badge.jsx';
import WhatsAppButton from '../common/WhatsAppButton.jsx';
import { COMPANY_CONFIG } from '../../config/companyConfig.js';
import { submitEnquiry } from '../../services/api.js';

export default function PropertyEnquiryCard({ property, onRequestSiteVisit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: `Hi, I am interested in "${property?.title}". Please provide more details and schedule an escorted visit.`,
    consent: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [apiError, setApiError] = useState(null);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter your full name (minimum 2 characters)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    const phoneClean = formData.phone.replace(/[\s-]/g, '');
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneClean || !phoneRegex.test(phoneClean)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number';
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = 'Please provide an enquiry message (minimum 10 characters)';
    } else if (formData.message.length > 1000) {
      newErrors.message = 'Message must not exceed 1000 characters';
    }

    if (!formData.consent) {
      newErrors.consent = 'You must agree to receive communications regarding this enquiry';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (apiError) {
      setApiError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      const res = await submitEnquiry({
        propertyId: property?.id || property?._id,
        propertyTitle: property?.title,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      });

      setSubmittedRef(res.data?.referenceCode || `ENQ-${Math.floor(1000 + Math.random() * 9000)}`);
      setIsDemoMode(Boolean(res.isFallback || res.data?.isDemoRecorded));
    } catch (err) {
      setApiError(err.message || 'Failed to submit enquiry. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedRef(null);
    setIsDemoMode(false);
    setApiError(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: `Hi, I am interested in "${property?.title}". Please provide more details and schedule an escorted visit.`,
      consent: true,
    });
    setErrors({});
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-5 sticky top-24">
      {/* Card Header */}
      <div className="space-y-1 pb-4 border-b border-slate-100">
        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold block">
          Direct Property Enquiry
        </span>
        <h3 className="text-lg font-bold font-heading text-brand-navy">
          Interested in this Property?
        </h3>
        <p className="text-xs text-slate-500 font-light leading-relaxed">
          Connect with an assigned MasterJi property advisor. We coordinate on-site visits and verify property records.
        </p>
      </div>

      {/* Success Confirmation State */}
      {submittedRef ? (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-4 text-left animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg">
              ✓
            </div>
            <Badge variant="success">
              Enquiry Received
            </Badge>
          </div>

          <div>
            <h4 className="text-sm font-bold text-emerald-900">
              Enquiry Received Successfully
            </h4>
            <p className="text-xs text-emerald-700 mt-1">
              Tracking Reference Code:{' '}
              <span className="font-mono font-bold text-emerald-950">
                {submittedRef}
              </span>
            </p>
          </div>

          <div className="p-3 bg-white/80 rounded-lg border border-emerald-200/60 text-[11px] text-emerald-800 space-y-1">
            <span className="font-bold block">Next Steps:</span>
            <p className="leading-relaxed">
              Your inquiry has been logged with our customer desk. An assigned MasterJi advisor will reach out to{' '}
              <span className="font-semibold">{formData.name}</span> on{' '}
              <span className="font-mono font-semibold">+91 {formData.phone}</span>.
            </p>
          </div>

          <div className="flex gap-2">
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
              className="flex-1 justify-center text-xs"
            >
              Follow-up via WhatsApp
            </WhatsAppButton>
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </div>
      ) : (
        /* Enquiry Input Form */
        <form onSubmit={handleSubmit} className="space-y-3.5 text-left" noValidate>
          {apiError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              {apiError}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label htmlFor="enquiry-name" className="block text-xs font-bold text-slate-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="enquiry-name"
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={isSubmitting}
              className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-slate-300 focus:ring-brand-navy focus:bg-white'
              }`}
            />
            {errors.name && (
              <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="enquiry-email" className="block text-xs font-bold text-slate-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="enquiry-email"
              type="email"
              placeholder="e.g. rahul@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={isSubmitting}
              className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-slate-300 focus:ring-brand-navy focus:bg-white'
              }`}
            />
            {errors.email && (
              <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Mobile Phone Number */}
          <div>
            <label htmlFor="enquiry-phone" className="block text-xs font-bold text-slate-700 mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 text-slate-600 text-xs font-semibold">
                +91
              </span>
              <input
                id="enquiry-phone"
                type="tel"
                maxLength={10}
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={isSubmitting}
                className={`w-full bg-slate-50 border rounded-r-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  errors.phone
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-300 focus:ring-brand-navy focus:bg-white'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Message */}
          <div>
            <label htmlFor="enquiry-message" className="block text-xs font-bold text-slate-700 mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="enquiry-message"
              rows={3}
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              disabled={isSubmitting}
              className={`w-full bg-slate-50 border rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 resize-none ${
                errors.message
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-slate-300 focus:ring-brand-navy focus:bg-white'
              }`}
            />
            {errors.message && (
              <p className="text-[11px] text-red-500 mt-1">{errors.message}</p>
            )}
          </div>

          {/* Consent Checkbox */}
          <div className="space-y-1">
            <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-600">
              <input
                type="checkbox"
                checked={formData.consent}
                onChange={(e) => handleChange('consent', e.target.checked)}
                className="mt-0.5 rounded text-brand-navy focus:ring-brand-navy"
              />
              <span>
                I agree to be contacted by MasterJiEstates regarding this listing.
              </span>
            </label>
            {errors.consent && (
              <p className="text-[11px] text-red-500">{errors.consent}</p>
            )}
          </div>

          {/* Submit Action */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting}
            className="w-full justify-center text-xs font-bold shadow-sm"
          >
            {isSubmitting ? 'Submitting Enquiry...' : 'Submit Enquiry'}
          </Button>
        </form>
      )}

      {/* Instant Direct Connect (WhatsApp & Call) */}
      <div className="pt-3 border-t border-slate-100 space-y-2.5">
        <div className="relative flex py-0.5 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Instant Connect
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* WhatsApp Button */}
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
          size="md"
          className="w-full justify-center shadow-xs"
        >
          Chat on WhatsApp ({COMPANY_CONFIG.whatsappDisplay})
        </WhatsAppButton>

        {/* Direct Call Button */}
        <a
          href={`tel:${COMPANY_CONFIG.phoneClean}`}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
        >
          <svg className="w-3.5 h-3.5 text-brand-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span>Call Advisor: {COMPANY_CONFIG.phoneDisplay}</span>
        </a>
      </div>

      {/* Alternative Action: Schedule Escorted Visit */}
      <div className="pt-4 border-t border-slate-100 text-center space-y-2">
        <span className="text-xs text-slate-400 font-medium block">
          Prefer an on-site walkthrough?
        </span>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center text-xs font-semibold border-brand-gold/60 text-brand-navy hover:bg-brand-gold/10"
          onClick={onRequestSiteVisit}
        >
          📅 Schedule Site Visit
        </Button>
      </div>

      {/* Privacy Guarantee Micro-Footnote */}
      <div className="pt-2 text-center">
        <p className="text-[10px] text-slate-400 font-light flex items-center justify-center gap-1">
          <span>🔒</span>
          <span>Zero spam. Direct coordination only.</span>
        </p>
      </div>
    </div>
  );
}
