/**
 * Validation utilities for MasterJiEstates authentication requests.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;

/**
 * Validate password strength:
 * - At least 8 characters, maximum 64 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - At least one special character
 */
export function isPasswordStrong(password) {
  if (typeof password !== 'string' || password.length < 8 || password.length > 64) {
    return false;
  }
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password);

  return hasUpper && hasLower && hasNumber && hasSpecial;
}

/**
 * Validate user registration payload.
 * Strictly forbids client-submitted roles or privileged parameters.
 */
export function validateRegisterInput(body = {}) {
  const errors = [];
  const { fullName, email, phone, password } = body;

  // Security check: Detect any client attempt to tamper with administrative roles
  if (body.role !== undefined && body.role !== 'user') {
    errors.push({
      field: 'role',
      message: 'Role assignment is forbidden. All accounts are registered as standard users.',
    });
  }
  if (body.accountStatus !== undefined || body.isAdmin !== undefined || body.isStaff !== undefined) {
    errors.push({
      field: 'security',
      message: 'Privileged account properties cannot be submitted via public registration.',
    });
  }

  // Full Name
  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    errors.push({ field: 'fullName', message: 'Full name is required (minimum 2 characters).' });
  } else if (fullName.trim().length > 100) {
    errors.push({ field: 'fullName', message: 'Full name cannot exceed 100 characters.' });
  }

  // Email
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push({ field: 'email', message: 'Please enter a valid email address.' });
  }

  // Phone (10-digit Indian mobile)
  const cleanPhone = typeof phone === 'string' ? phone.replace(/[\s-]/g, '') : '';
  if (!cleanPhone || !INDIAN_PHONE_REGEX.test(cleanPhone)) {
    errors.push({
      field: 'phone',
      message: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
    });
  }

  // Password
  if (!password || typeof password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required.' });
  } else if (password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters long.' });
  } else if (password.length > 64) {
    errors.push({ field: 'password', message: 'Password cannot exceed 64 characters.' });
  } else if (!isPasswordStrong(password)) {
    errors.push({
      field: 'password',
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate login credentials input.
 */
export function validateLoginInput(body = {}) {
  const errors = [];
  const { email, password } = body;

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push({ field: 'email', message: 'Please enter a valid email address.' });
  }

  if (!password || typeof password !== 'string' || !password.trim()) {
    errors.push({ field: 'password', message: 'Password is required.' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate authenticated password change payload.
 */
export function validateChangePasswordInput(body = {}) {
  const errors = [];
  const { currentPassword, newPassword } = body;

  if (!currentPassword || typeof currentPassword !== 'string') {
    errors.push({ field: 'currentPassword', message: 'Current password is required.' });
  }

  if (!newPassword || typeof newPassword !== 'string') {
    errors.push({ field: 'newPassword', message: 'New password is required.' });
  } else if (!isPasswordStrong(newPassword)) {
    errors.push({
      field: 'newPassword',
      message:
        'New password must be 8-64 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    });
  } else if (currentPassword === newPassword) {
    errors.push({
      field: 'newPassword',
      message: 'New password cannot be identical to the current password.',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate forgot password request.
 */
export function validateForgotPasswordInput(body = {}) {
  const errors = [];
  const { email } = body;

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address.' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate password reset token and new password.
 */
export function validateResetPasswordInput(body = {}) {
  const errors = [];
  const { token, newPassword } = body;

  if (!token || typeof token !== 'string' || !token.trim()) {
    errors.push({ field: 'token', message: 'Password reset token is required.' });
  }

  if (!newPassword || typeof newPassword !== 'string' || !isPasswordStrong(newPassword)) {
    errors.push({
      field: 'newPassword',
      message:
        'New password must be 8-64 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

