import React, { useState, useEffect } from 'react';
import Button from '../ui/Button.jsx';
import Badge from '../ui/Badge.jsx';
import { scheduleSiteVisit } from '../../services/api.js';

export default function SiteVisitModal({
  isOpen,
  onClose,
  property,
}) {
  // Set minimum date to tomorrow
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const minDate = getTomorrowDate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: minDate,
    slot: 'Morning (10:00 AM - 01:00 PM)',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Close modal on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter your full name (minimum 2 characters)';
    }

    const phoneClean = formData.phone.replace(/[\s-]/g, '');
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneClean || !phoneRegex.test(phoneClean)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.date) {
      newErrors.date = 'Please select a visit date';
    } else {
      const selected = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        newErrors.date = 'Visit date cannot be in the past';
      }
    }

    if (!formData.slot) {
      newErrors.slot = 'Please choose a preferred time slot';
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
      const res = await scheduleSiteVisit({
        propertyId: property?.id || property?._id,
        propertyTitle: property?.title,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        preferredDate: formData.date,
        preferredTimeSlot: formData.slot,
        notes: formData.notes,
      });

      setSubmittedRef(res.data?.bookingReference || `VISIT-${Math.floor(1000 + Math.random() * 9000)}`);
      setIsDemoMode(Boolean(res.isFallback || res.data?.isDemoRecorded));
    } catch (err) {
      setApiError(err.message || 'Failed to schedule site visit. Please verify your input and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setSubmittedRef(null);
    setIsDemoMode(false);
    setApiError(null);
    setErrors({});
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-visit-title"
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      {/* Liquid Glass Backdrop */}
      <div
        className="fixed inset-0 bg-brand-navy-dark/70 backdrop-blur-md transition-opacity"
        onClick={handleModalClose}
        aria-hidden="true"
      />

      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200">
          {/* Modal Header */}
          <div className="bg-brand-navy-dark px-6 py-4 text-white flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold block">
                Escorted On-Site Inspection
              </span>
              <h2 id="site-visit-title" className="text-base font-bold font-heading">
                Schedule a Property Visit
              </h2>
            </div>
            <button
              type="button"
              onClick={handleModalClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg transition-colors focus:outline-none"
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-4">
            {submittedRef ? (
              /* Success confirmation state */
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xl mx-auto shadow-sm">
                  ✓
                </div>

                <div className="space-y-1">
                  <div className="flex justify-center">
                    <Badge variant="success">
                      Visit Request Received
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-emerald-950 mt-2">
                    Site Visit Request Registered
                  </h3>
                  <p className="text-xs text-emerald-700">
                    Booking Reference:{' '}
                    <span className="font-mono font-bold text-emerald-950">
                      {submittedRef}
                    </span>
                  </p>
                </div>

                <div className="p-3 bg-white/80 rounded-lg border border-emerald-200/60 text-xs text-emerald-800 text-left space-y-1">
                  <span className="font-bold block">Visit Logistics & Next Steps:</span>
                  <p className="leading-relaxed font-light">
                    Your escorted visit request for <span className="font-semibold">{formData.date}</span> during the <span className="font-semibold">{formData.slot}</span> slot has been scheduled. A MasterJi field executive will phone <span className="font-mono font-semibold">+91 {formData.phone}</span> 2 hours prior to the slot to confirm arrival.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center text-xs font-bold"
                  onClick={handleModalClose}
                >
                  Close & Continue Browsing
                </Button>
              </div>
            ) : (
              /* Form input state */
              <form onSubmit={handleSubmit} className="space-y-3.5 text-left" noValidate>
                {apiError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                    {apiError}
                  </div>
                )}

                {/* Target Property Summary Pill */}
                {property && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between gap-2">
                    <span className="font-semibold text-brand-navy truncate max-w-xs">
                      {property.title}
                    </span>
                    <span className="font-bold text-brand-gold flex-shrink-0">
                      {property.priceFormatted}
                    </span>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label htmlFor="visit-name" className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="visit-name"
                    type="text"
                    placeholder="e.g. Priyanshu Verma"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    disabled={isSubmitting}
                    className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                      errors.name
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-slate-300 focus:ring-brand-navy focus:bg-white'
                    }`}
                  />
                  {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* Mobile & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="visit-phone" className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-2.5 rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 text-slate-600 text-xs font-semibold">
                        +91
                      </span>
                      <input
                        id="visit-phone"
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
                    {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label htmlFor="visit-email" className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="visit-email"
                      type="email"
                      placeholder="e.g. priyanshu@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      disabled={isSubmitting}
                      className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                        errors.email
                          ? 'border-red-400 focus:ring-red-400'
                          : 'border-slate-300 focus:ring-brand-navy focus:bg-white'
                      }`}
                    />
                    {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
                  </div>
                </div>

                {/* Date & Time Slot Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="visit-date" className="block text-xs font-bold text-slate-700 mb-1">
                      Preferred Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="visit-date"
                      type="date"
                      min={minDate}
                      value={formData.date}
                      onChange={(e) => handleChange('date', e.target.value)}
                      disabled={isSubmitting}
                      className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 ${
                        errors.date
                          ? 'border-red-400 focus:ring-red-400'
                          : 'border-slate-300 focus:ring-brand-navy focus:bg-white'
                      }`}
                    />
                    {errors.date && <p className="text-[11px] text-red-500 mt-1">{errors.date}</p>}
                  </div>

                  <div>
                    <label htmlFor="visit-slot" className="block text-xs font-bold text-slate-700 mb-1">
                      Time Slot <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="visit-slot"
                      value={formData.slot}
                      onChange={(e) => handleChange('slot', e.target.value)}
                      disabled={isSubmitting}
                      className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 ${
                        errors.slot
                          ? 'border-red-400 focus:ring-red-400'
                          : 'border-slate-300 focus:ring-brand-navy focus:bg-white'
                      }`}
                    >
                      <option value="Morning (10:00 AM - 01:00 PM)">Morning (10:00 AM - 01:00 PM)</option>
                      <option value="Afternoon (02:00 PM - 05:00 PM)">Afternoon (02:00 PM - 05:00 PM)</option>
                      <option value="Evening (05:00 PM - 07:00 PM)">Evening (05:00 PM - 07:00 PM)</option>
                    </select>
                    {errors.slot && <p className="text-[11px] text-red-500 mt-1">{errors.slot}</p>}
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label htmlFor="visit-notes" className="block text-xs font-bold text-slate-700 mb-1">
                    Special Requirements or Questions <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="visit-notes"
                    rows={2}
                    placeholder="e.g. Bringing family architect; require layout drawings on site."
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:bg-white resize-none"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isSubmitting}
                    className="w-full justify-center text-xs font-bold shadow-md"
                  >
                    {isSubmitting ? 'Scheduling Visit...' : 'Schedule Site Visit'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
