import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { requestPasswordReset } from '../../services/api.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');
  const [serverError, setServerError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isValidEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const validate = (val) => {
    if (!val.trim()) {
      return 'Email address is required';
    }
    if (!isValidEmail(val)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (serverError) {
      setServerError(null);
    }
    if (touched) {
      setError(validate(e.target.value));
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validate(email));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    const err = validate(email);
    if (err) {
      setError(err);
      return;
    }

    setError('');
    setServerError(null);
    setIsLoading(true);

    try {
      await requestPasswordReset(email);
      setIsSubmitted(true);
    } catch (apiErr) {
      setServerError(apiErr.message || 'Unable to process reset request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      visualHeadline="Protected Real Estate Asset Management"
      visualSubtitle="Industry-standard security protocols safeguarding your property listings, transaction negotiations, and personal credentials."
      visualImage="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=80"
      visualTag="Account Security"
    >
      <div className="space-y-6">
        <div>
          <Badge variant="brand" size="sm" className="mb-2">Account Recovery</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy tracking-tight">
            Reset Password
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Enter your registered email address to receive password recovery instructions.
          </p>
        </div>

        {serverError && (
          <div
            role="alert"
            className="p-3.5 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs leading-relaxed animate-fade-in"
          >
            {serverError}
          </div>
        )}

        {isSubmitted ? (
          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
              <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Recovery Request Processed</span>
            </div>
            <p className="text-xs text-emerald-700 leading-relaxed">
              If an account is associated with <strong>{email}</strong>, instructions to reset your password have been generated. The reset link remains valid for 30 minutes.
            </p>
            <div className="p-2.5 bg-white/70 rounded-lg text-[11px] text-emerald-800 border border-emerald-200/50">
              <span className="font-semibold block">Notice:</span>
              <p>Email delivery requires configured SMTP/transactional email provider. In development mode, the reset token hash is safely recorded in system logs.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
                setTouched(false);
              }}
            >
              Send to another email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              label="Registered Email Address"
              placeholder="name@example.com"
              value={email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched ? error : ''}
              required
              autoComplete="email"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              disabled={isLoading}
            >
              {isLoading ? 'Processing Request...' : 'Send Recovery Instructions'}
            </Button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-navy hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy rounded"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
