/**
 * Authentication Input Validation and Masking Utilities
 * Pure functions for validating mobile numbers, emails, and OTP formats.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: string;
}

/**
 * Validates Indian 10-digit mobile phone numbers.
 * Supports numbers starting with 6, 7, 8, or 9.
 */
export function validateIndianPhone(rawPhone: string): ValidationResult {
  if (!rawPhone || rawPhone.trim() === '') {
    return { isValid: false, error: 'Mobile number is required' };
  }

  // Strip non-digits, leading +91, or leading 0
  let cleaned = rawPhone.replace(/\D/g, '');
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }

  if (cleaned.length !== 10) {
    return {
      isValid: false,
      error: 'Please enter a valid 10-digit mobile number',
      sanitizedValue: cleaned,
    };
  }

  // Standard Indian Telecom prefix validation (6-9)
  if (!/^[6-9]/.test(cleaned)) {
    return {
      isValid: false,
      error: 'Mobile number must start with 6, 7, 8, or 9',
      sanitizedValue: cleaned,
    };
  }

  return { isValid: true, sanitizedValue: cleaned };
}

/**
 * Validates email addresses using standard RFC-compliant pattern.
 */
export function validateEmail(rawEmail: string): ValidationResult {
  if (!rawEmail || rawEmail.trim() === '') {
    return { isValid: false, error: 'Email address is required' };
  }

  const cleaned = rawEmail.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(cleaned)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address (e.g. name@example.com)',
      sanitizedValue: cleaned,
    };
  }

  return { isValid: true, sanitizedValue: cleaned };
}

/**
 * Validates 6-digit OTP code.
 */
export function validateOtp(rawOtp: string): ValidationResult {
  if (!rawOtp || rawOtp.trim() === '') {
    return { isValid: false, error: 'Verification code is required' };
  }

  const cleaned = rawOtp.trim();
  if (!/^\d{6}$/.test(cleaned)) {
    return {
      isValid: false,
      error: 'Verification code must be exactly 6 numeric digits',
      sanitizedValue: cleaned,
    };
  }

  return { isValid: true, sanitizedValue: cleaned };
}

/**
 * Masks Indian phone number for privacy display (e.g. +91 99*** **186)
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  const tenDigits = digits.length > 10 ? digits.slice(-10) : digits;

  if (tenDigits.length === 10) {
    const firstTwo = tenDigits.slice(0, 2);
    const lastThree = tenDigits.slice(7);
    return `+91 ${firstTwo}*** **${lastThree}`;
  }

  return phone;
}

/**
 * Masks email address for privacy display (e.g. jo***@domain.com)
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [localPart, domain] = email.split('@');

  if (localPart.length <= 2) {
    return `${localPart}***@${domain}`;
  }

  const visible = localPart.slice(0, 2);
  return `${visible}***@${domain}`;
}

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
  strength: PasswordStrength;
  criteria: {
    hasMinLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

/**
 * Validates password strength:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePassword(password: string): PasswordValidationResult {
  const p = password || '';
  const criteria = {
    hasMinLength: p.length >= 8,
    hasUppercase: /[A-Z]/.test(p),
    hasLowercase: /[a-z]/.test(p),
    hasNumber: /[0-9]/.test(p),
    hasSpecial: /[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?~`]/.test(p),
  };

  const score = Object.values(criteria).filter(Boolean).length;
  let strength: PasswordStrength = 'weak';
  if (score >= 5) strength = 'strong';
  else if (score >= 4) strength = 'good';
  else if (score >= 3) strength = 'fair';

  if (!p) {
    return {
      isValid: false,
      error: 'Password is required',
      strength: 'weak',
      criteria,
    };
  }

  if (!criteria.hasMinLength) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long',
      strength,
      criteria,
    };
  }

  if (!criteria.hasUppercase) {
    return {
      isValid: false,
      error: 'Password must include at least one uppercase letter (A-Z)',
      strength,
      criteria,
    };
  }

  if (!criteria.hasLowercase) {
    return {
      isValid: false,
      error: 'Password must include at least one lowercase letter (a-z)',
      strength,
      criteria,
    };
  }

  if (!criteria.hasNumber) {
    return {
      isValid: false,
      error: 'Password must include at least one number (0-9)',
      strength,
      criteria,
    };
  }

  if (!criteria.hasSpecial) {
    return {
      isValid: false,
      error: 'Password must include at least one special character (!@#$%^&*)',
      strength,
      criteria,
    };
  }

  return {
    isValid: true,
    strength: 'strong',
    criteria,
  };
}

/**
 * Validates whether password and confirm password match.
 */
export function validateConfirmPassword(password: string, confirmPassword: string): ValidationResult {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match. Please re-enter.' };
  }
  return { isValid: true };
}

