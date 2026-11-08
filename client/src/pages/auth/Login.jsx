import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import PasswordInput from '../../components/auth/PasswordInput.jsx';
import GoogleAuthButton from '../../components/auth/GoogleAuthButton.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Divider from '../../components/ui/Divider.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const from = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : '/dashboard';

  // If already authenticated, redirect immediately to intended destination without showing login form
  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate, from]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Email regex validation
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateField = (name, value) => {
    let error = '';
    if (name === 'email') {
      if (!value.trim()) {
        error = 'Email address is required';
      } else if (!isValidEmail(value)) {
        error = 'Please enter a valid email address';
      }
    }
    if (name === 'password') {
      if (!value) {
        error = 'Password is required';
      }
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    if (serverError) {
      setServerError(null);
    }

    if (touched[name]) {
      const error = validateField(name, fieldValue);
      setErrors((prev) => ({ ...prev, [name]: error }));
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
    setTouched({ email: true, password: true });

    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      });
      return;
    }

    setErrors({});
    setServerError(null);
    setIsLoading(true);

    try {
      await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      // Redirect user to requested page or homepage upon successful authentication
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(
        err.message || 'Unable to sign in. Please verify your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      visualHeadline="Find a Place You'll Love to Call Home"
      visualSubtitle="Sign in to explore verified residential listings, track scheduled site visits, and coordinate direct real estate transactions."
      visualImage="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80"
      visualTag="Verified Residential & Commercial"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy tracking-tight">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Sign in to continue your property journey.
          </p>
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
              <span>Authentication Error</span>
            </div>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
            <PasswordInput
              id="password"
              name="password"
              label="Password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password ? errors.password : ''}
              required
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between mt-2.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-brand-navy border-slate-300 focus:ring-brand-navy focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-slate-600">Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-brand-navy hover:text-brand-navy-light hover:underline transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy rounded"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <Divider label="OR" />

        <GoogleAuthButton text="Sign in with Google" />

        <p className="text-center text-xs text-slate-600 pt-2">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-bold text-brand-navy hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy rounded"
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
