import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/layout/Header.jsx';
import Footer from '../../components/layout/Footer.jsx';
import SEOHead from '../../components/common/SEOHead.jsx';
import Logo from '../../components/common/Logo.jsx';
import UdyamBadge from '../../components/common/UdyamBadge.jsx';
import WhatsAppButton, { WhatsAppIcon } from '../../components/common/WhatsAppButton.jsx';
import { submitContactMessage, getCompanyContent } from '../../services/api.js';
import { COMPANY_CONFIG } from '../../config/companyConfig.js';

export default function ContactUs() {
  const [searchParams] = useSearchParams();
  const prefilledSubject = searchParams.get('subject') || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: prefilledSubject || 'General Property Inquiry',
    message: '',
  });

  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    getCompanyContent()
      .then((data) => setCompanyInfo(data))
      .catch((err) => console.warn('Could not load company info:', err.message));
  }, []);

  useEffect(() => {
    if (prefilledSubject) {
      setFormData((prev) => ({ ...prev, subject: prefilledSubject }));
    }
  }, [prefilledSubject]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
    setErrorMessage('');
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9).';
    }
    if (!formData.subject.trim() || formData.subject.trim().length < 3) {
      errors.subject = 'Subject is required.';
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters long.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      const result = await submitContactMessage({
        ...formData,
        phone: cleanPhone,
      });

      setSuccessResult(result);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Property Inquiry',
        message: '',
      });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit contact message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col text-slate-800 selection:bg-brand-gold selection:text-brand-navy">
      <SEOHead
        title="Contact Us | MasterJiEstates"
        description="Contact MasterJiEstates advisory desk in Noida Sector 62A. Call +91 9990316186, WhatsApp +91 7011202089, or email masterjiestates@gmail.com for verified property buying, selling, and site visits."
        canonicalPath="/contact"
      />

      <Header />

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="relative bg-gradient-to-b from-brand-navy-dark via-brand-navy to-brand-navy-dark text-white pt-16 pb-20 overflow-hidden border-b border-brand-gold/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-brand-gold bg-brand-gold/10 border border-brand-gold/30 mb-4">
              Real Estate Advisory Desk
            </span>
            <h1 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight text-white mb-4">
              Get in Touch with Our Team
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Have a question about a listed property, require assistance selling your home, or want to explore our allied services? Reach us directly via phone, WhatsApp, or the inquiry form below.
            </p>
          </div>
        </section>

        {/* Contact Layout */}
        <section className="py-14 sm:py-18 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Column: Office & Operational Details (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-card space-y-6">
                {/* Official Branding Header */}
                <div className="pb-4 border-b border-slate-100 flex flex-col gap-2">
                  <Logo size="md" />
                  <p className="text-xs text-slate-500 italic mt-1">
                    "{COMPANY_CONFIG.tagline}"
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold bg-brand-navy px-2.5 py-0.5 rounded-md mb-2 inline-block">
                    Operational Headquarters
                  </span>
                  <h3 className="text-xl font-heading font-bold text-brand-navy">
                    MasterJiEstates Advisory Desk
                  </h3>
                </div>

                <div className="space-y-4 text-sm text-slate-600">
                  {/* Office Location */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      📍
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-medium">Office Location</strong>
                      <span className="text-slate-700 font-semibold block">
                        {COMPANY_CONFIG.officeLocation}
                      </span>
                      <span className="text-xs text-slate-500">
                        Noida, Uttar Pradesh, India
                      </span>
                    </div>
                  </div>

                  {/* Official Telephone (Clickable) */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      📞
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-medium">Helpline Telephone</strong>
                      <a
                        href={COMPANY_CONFIG.phoneTel}
                        className="font-bold text-brand-navy hover:text-brand-gold text-base block transition-colors"
                      >
                        {COMPANY_CONFIG.phoneDisplay}
                      </a>
                      <span className="text-[11px] text-slate-400">Direct voice helpline</span>
                    </div>
                  </div>

                  {/* Official WhatsApp (Clickable) */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#25D366] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-medium">Official WhatsApp</strong>
                      <a
                        href={`https://wa.me/${COMPANY_CONFIG.whatsappRaw}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[#128C7E] hover:underline text-base block transition-colors"
                      >
                        {COMPANY_CONFIG.whatsappDisplay}
                      </a>
                      <span className="text-[11px] text-slate-400">Instant chat & property updates</span>
                    </div>
                  </div>

                  {/* Official Email (Clickable) */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      ✉️
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-medium">Official Email</strong>
                      <a
                        href={COMPANY_CONFIG.emailMailto}
                        className="text-slate-800 hover:text-brand-gold font-medium block transition-colors"
                      >
                        {COMPANY_CONFIG.email}
                      </a>
                    </div>
                  </div>

                  {/* Operating Hours */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      🕒
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-medium">Operating Hours</strong>
                      <span className="text-xs text-slate-500 block leading-relaxed">
                        {COMPANY_CONFIG.operatingHours}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Instant WhatsApp CTA Button */}
                <div className="pt-2">
                  <WhatsAppButton
                    context="contact"
                    variant="solid"
                    size="md"
                    label="Message Us on WhatsApp"
                    className="w-full"
                  />
                </div>

                {/* Service Areas */}
                <div className="pt-4 border-t border-slate-100">
                  <strong className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                    Service Areas Covered:
                  </strong>
                  <div className="flex flex-wrap gap-1.5">
                    {COMPANY_CONFIG.serviceAreas.map((area) => (
                      <span
                        key={area}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Udyam Registration Card */}
                <UdyamBadge variant="card" />

                <div className="pt-3 text-[11px] text-slate-500 leading-relaxed bg-slate-50 -mx-8 -mb-8 p-6 rounded-b-3xl border-t border-slate-100">
                  <strong>Privacy Notice:</strong> We do not broadcast or sell user contact numbers. Your details are accessible solely by MasterJiEstates executives assigned to handle your transaction.
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Contact Form (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-card">
                {successResult ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                      ✓
                    </div>
                    <h3 className="text-2xl font-heading font-bold text-brand-navy">
                      Message Received Successfully
                    </h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                      Thank you, <strong className="text-slate-900">{successResult.name}</strong>. Your message has been logged under reference code:
                    </p>
                    <div className="inline-block px-4 py-2 rounded-xl bg-slate-100 text-brand-navy font-mono font-bold text-base border border-slate-200">
                      {successResult.referenceCode}
                    </div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      A MasterJiEstates advisor will review your notes and contact you at{' '}
                      <strong>{successResult.phone}</strong> or <strong>{successResult.email}</strong>.
                    </p>
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSuccessResult(null)}
                        className="px-6 py-2.5 rounded-xl bg-brand-navy text-brand-gold font-bold text-xs hover:bg-brand-navy-light transition-colors"
                      >
                        Send Another Inquiry
                      </button>

                      <WhatsAppButton
                        context="contact"
                        size="sm"
                        label="Follow up on WhatsApp"
                      />
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <h2 className="text-2xl font-heading font-bold text-brand-navy">
                        Send a Message
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Please provide accurate contact details so our advisor can reach you promptly.
                      </p>
                    </div>

                    {errorMessage && (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
                        {errorMessage}
                      </div>
                    )}

                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Your Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Rajesh Khanna"
                        className={`w-full px-4 py-3 rounded-xl bg-slate-50 border text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
                          fieldErrors.name
                            ? 'border-rose-400 focus:ring-rose-200'
                            : 'border-slate-200 focus:ring-brand-gold/40'
                        }`}
                      />
                      {fieldErrors.name && (
                        <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.name}</p>
                      )}
                    </div>

                    {/* Email and Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Email Address <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="rajesh@example.com"
                          className={`w-full px-4 py-3 rounded-xl bg-slate-50 border text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
                            fieldErrors.email
                              ? 'border-rose-400 focus:ring-rose-200'
                              : 'border-slate-200 focus:ring-brand-gold/40'
                          }`}
                        />
                        {fieldErrors.email && (
                          <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Mobile Number (10 Digits) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                            +91
                          </span>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="9876543210"
                            maxLength={10}
                            className={`w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
                              fieldErrors.phone
                                ? 'border-rose-400 focus:ring-rose-200'
                                : 'border-slate-200 focus:ring-brand-gold/40'
                            }`}
                          />
                        </div>
                        {fieldErrors.phone && (
                          <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Subject / Topic <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="e.g., Property Buying Inquiry, Home Loan Advisory, Selling Mandate"
                        className={`w-full px-4 py-3 rounded-xl bg-slate-50 border text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
                          fieldErrors.subject
                            ? 'border-rose-400 focus:ring-rose-200'
                            : 'border-slate-200 focus:ring-brand-gold/40'
                        }`}
                      />
                      {fieldErrors.subject && (
                        <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.subject}</p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Detailed Message <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Please describe your requirements, property location preference, or inquiry details..."
                        className={`w-full px-4 py-3 rounded-xl bg-slate-50 border text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 resize-none ${
                          fieldErrors.message
                            ? 'border-rose-400 focus:ring-rose-200'
                            : 'border-slate-200 focus:ring-brand-gold/40'
                        }`}
                      />
                      {fieldErrors.message && (
                        <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.message}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-6 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-brand-gold font-bold text-sm tracking-wide transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-brand-gold/40 border-t-brand-gold rounded-full animate-spin"></div>
                            <span>Submitting Inquiry...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Message</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Section 8: Google Maps Location Placeholder (Prepared for Future Embed) */}
          <div className="mt-14 pt-10 border-t border-slate-200">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold bg-brand-navy px-2.5 py-0.5 rounded-md inline-block mb-1">
                    Office Location
                  </span>
                  <h3 className="text-xl font-heading font-bold text-brand-navy">
                    {COMPANY_CONFIG.officeLocation}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Noida, Uttar Pradesh, India &bull; Service Hub for Delhi NCR
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={COMPANY_CONFIG.phoneTel}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                  >
                    <span>📞 {COMPANY_CONFIG.phoneDisplay}</span>
                  </a>

                  <WhatsAppButton
                    context="contact"
                    size="sm"
                    label="WhatsApp Location"
                  />
                </div>
              </div>

              {/* Dedicated Google Maps Container Placeholder */}
              <div
                aria-label="Google Maps Location Container"
                className="w-full h-64 sm:h-80 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group"
              >
                {COMPANY_CONFIG.googleMapsUrl ? (
                  <iframe
                    title="MasterJiEstates Google Map"
                    src={COMPANY_CONFIG.googleMapsUrl}
                    className="w-full h-full rounded-2xl border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="max-w-md space-y-3 z-10">
                    <div className="w-12 h-12 rounded-full bg-brand-navy text-brand-gold flex items-center justify-center mx-auto text-xl shadow-md">
                      📍
                    </div>
                    <h4 className="text-base font-heading font-bold text-brand-navy">
                      {COMPANY_CONFIG.officeLocation} Office
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Detailed interactive Google Maps directions will be linked upon public pin activation. For in-person consultations, title verifications, or escorted site visits, please contact us via phone or WhatsApp.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[11px] font-semibold text-slate-700 shadow-xs border border-slate-200">
                      <span>Coordinates: Noida Sector 62A Hub</span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-emerald-700">Visits by Prior Appointment</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
