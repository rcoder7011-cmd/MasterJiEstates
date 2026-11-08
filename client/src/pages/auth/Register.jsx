import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import PasswordInput from '../../components/auth/PasswordInput.jsx';
import GoogleAuthButton from '../../components/auth/GoogleAuthButton.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Divider from '../../components/ui/Divider.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const from = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : '/dashboard';

  // If already authenticated, redirect immediately to intended destination
  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate, from]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Email format validation
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // 10-digit Indian mobile number validation (starts with 6, 7, 8, or 9)
  const isValidIndianPhone = (phone) => {
    return /^[6-9]\d{9}$/.test(phone.trim());
  };

  // Password constraint checks
  const passwordCriteria = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?~`]/.test(formData.password),
  };

  const isPasswordStrong = Object.values(passwordCriteria).every(Boolean);

  const validateField = (name, value, currentFormData = formData) => {
    let error = '';

    if (name === 'name') {
      if (!value.trim()) {
        error = 'Full name is required';
      } else if (value.trim().length < 2) {
        error = 'Name must be at least 2 characters';
      }
    }

    if (name === 'email') {
      if (!value.trim()) {
        error = 'Email address is required';
      } else if (!isValidEmail(value)) {
        error = 'Please enter a valid email address';
      }
    }

    if (name === 'phone') {
      const cleanPhone = value.replace(/\D/g, '');
      if (!cleanPhone) {
        error = 'Mobile number is required';
      } else if (!isValidIndianPhone(cleanPhone)) {
        error = 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210)';
      }
    }

    if (name === 'password') {
      if (!value) {
        error = 'Password is required';
      } else if (value.length < 8) {
        error = 'Password must be at least 8 characters long';
      } else if (!isPasswordStrong) {
        error = 'Password does not meet the complexity requirements below';
      }
    }

    if (name === 'confirmPassword') {
      if (!value) {
        error = 'Please confirm your password';
      } else if (value !== currentFormData.password) {
        error = 'Passwords do not match';
      }
    }

    if (name === 'agreeTerms') {
      if (!value) {
        error = 'You must agree to the Terms of Service & Privacy Policy';
      }
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    const updatedFormData = {
      ...formData,
      [name]: fieldValue,
    };

    setFormData(updatedFormData);

    if (serverError) {
      setServerError(null);
    }

    if (touched[name]) {
      const error = validateField(name, fieldValue, updatedFormData);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }

    if (name === 'password' && touched.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword, updatedFormData);
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allTouched = {
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      agreeTerms: true,
    };
    setTouched(allTouched);

    const validationErrors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      phone: validateField('phone', formData.phone),
      password: validateField('password', formData.password),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword),
      agreeTerms: validateField('agreeTerms', formData.agreeTerms),
    };

    const activeErrors = Object.fromEntries(
      Object.entries(validationErrors).filter(([_, v]) => v !== '')
    );

    if (Object.keys(activeErrors).length > 0) {
      setErrors(activeErrors);
      return;
    }

    setErrors({});
    setServerError(null);
    setIsLoading(true);

    try {
      await register({
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone.replace(/\D/g, ''),
        password: formData.password,
      });

      // Navigate to requested destination (e.g. listing form) or dashboard after confirmation
      navigate(from, { replace: true });
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const fieldErrors = {};
        err.errors.forEach((e) => {
          fieldErrors[e.field === 'fullName' ? 'name' : e.field] = e.message;
        });
        setErrors(fieldErrors);
      }
      setServerError(
        err.message || 'Registration failed. Please review your information and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      visualHeadline="Your Property Journey Starts Here"
      visualSubtitle="Experience seamless property buying and selling with full brokerage transparency, verified ownership, and zero unsolicited phone spam."
      visualImage="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1800&q=80"
      visualTag="Unified Buyer & Seller Access"
    >
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="direct" size="sm">Unified Account</Badge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy tracking-tight">
            Create Your Account
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Join MasterJiEstates and start your property journey.
          </p>
        </div>

        {/* Unified Account Benefit Info Box */}
        <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-lg flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
          <svg className="w-4 h-4 text-brand-navy flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            <strong>Single Unified Account:</strong> Use the same account to discover and buy properties as well as list your own properties for verified brokerage.
          </span>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div
            role="alert"
            className="p-3.5 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs leading-relaxed animate-fade-in"
          >
            <div className="font-semibold mb-0.5 flex items-center gap-1.5 text-red-950">
              <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Registration Error</span>
            </div>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            id="name"
            name="name"
            type="text"
            label="Full Name"
            placeholder="e.g. Rajesh Sharma"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name ? errors.name : ''}
            required
            autoComplete="name"
          />

          <Input
            id="email"
            name="email"
            type="email"
            label="Email Address"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email ? errors.email : ''}
            required
            autoComplete="email"
          />

          <div>
            <label
              htmlFor="phone"
              className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1.5"
            >
              Mobile Number (India) <span className="text-red-500">*</span>
            </label>
            <div className="relative flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-600 font-medium text-xs select-none">
                🇮🇳 +91
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                maxLength={10}
                placeholder="98765 43210"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={touched.phone && !!errors.phone}
                className={`w-full text-sm text-slate-800 placeholder-slate-400 bg-white border rounded-r-md px-3.5 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                  touched.phone && errors.phone
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-100 text-red-900'
                    : 'border-slate-300 focus:border-brand-navy focus:ring-slate-100 hover:border-slate-400'
                }`}
              />
            </div>
            {touched.phone && errors.phone && (
              <p className="text-xs text-red-600 font-medium mt-1">
                {errors.phone}
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              Used strictly for verification & site visits. Never displayed publicly.
            </p>
          </div>

          <div className="space-y-1.5">
            <PasswordInput
              id="password"
              name="password"
              label="Password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password ? errors.password : ''}
              required
              autoComplete="new-password"
            />

            {/* Password Requirement Real-Time Feedback */}
            {formData.password && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md text-[11px] space-y-1">
                <span className="font-semibold text-slate-700 block mb-1">Password Strength Criteria:</span>
                <div className="grid grid-cols-2 gap-1 text-slate-500">
                  <span className={passwordCriteria.length ? 'text-emerald-600 font-medium' : ''}>
                    {passwordCriteria.length ? '✓' : '○'} Min. 8 characters
                  </span>
                  <span className={passwordCriteria.uppercase ? 'text-emerald-600 font-medium' : ''}>
                    {passwordCriteria.uppercase ? '✓' : '○'} 1 Uppercase letter
                  </span>
                  <span className={passwordCriteria.number ? 'text-emerald-600 font-medium' : ''}>
                    {passwordCriteria.number ? '✓' : '○'} 1 Number (0-9)
                  </span>
                  <span className={passwordCriteria.special ? 'text-emerald-600 font-medium' : ''}>
                    {passwordCriteria.special ? '✓' : '○'} 1 Special symbol (@$!%*?&#)
                  </span>
                </div>
              </div>
            )}
          </div>

          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.confirmPassword ? errors.confirmPassword : ''}
            required
            autoComplete="new-password"
          />

          <div>
            <label className="flex items-start gap-2.5 cursor-pointer select-none mt-1">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="w-4 h-4 rounded text-brand-navy border-slate-300 focus:ring-brand-navy focus:ring-offset-0 mt-0.5 cursor-pointer"
              />
              <span className="text-xs text-slate-600 leading-normal">
                I agree to the{' '}
                <span className="text-brand-navy font-semibold underline">
                  Terms of Service
                </span>{' '}
                and{' '}
                <span className="text-brand-navy font-semibold underline">
                  Privacy Policy
                </span>
                . I understand that my contact details will remain private.
              </span>
            </label>
            {touched.agreeTerms && errors.agreeTerms && (
              <p className="text-xs text-red-600 font-medium mt-1">
                {errors.agreeTerms}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <Divider label="OR" />

        <GoogleAuthButton text="Sign up with Google" />

        <p className="text-center text-xs text-slate-600 pt-2">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-brand-navy hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy rounded"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
