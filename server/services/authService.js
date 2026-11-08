import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { isDatabaseConnected } from '../config/database.js';
import { generateToken } from '../utils/jwt.js';

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Hash a plaintext password using bcrypt with 12 rounds.
 */
export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, BCRYPT_SALT_ROUNDS);
}

/**
 * Register a new unified user account.
 * Forces role: 'user' regardless of client submission.
 */
export async function registerUser({ fullName, email, phone, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanPhone = phone.replace(/[\s-]/g, '');

  if (isDatabaseConnected()) {
    // Check email uniqueness
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      const error = new Error('An account with this email address already exists.');
      error.statusCode = 409;
      error.errors = [{ field: 'email', message: 'Email address is already registered.' }];
      throw error;
    }

    const passwordHash = await hashPassword(password);

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: cleanPhone,
      passwordHash,
      role: 'user', // Server-enforced: public registration can never assign privileged roles
      accountStatus: 'active',
      tokenVersion: 0,
      isEmailVerified: false,
      isPhoneVerified: false,
    });

    const token = generateToken(newUser, false);

    return {
      user: newUser.toSafeObject(),
      token,
    };
  }

  // Resilient fallback when database operates in offline/dev mock mode
  const mockUser = {
    id: `usr_${Date.now()}`,
    fullName: fullName.trim(),
    email: normalizedEmail,
    phone: cleanPhone,
    role: 'user',
    accountStatus: 'active',
    tokenVersion: 0,
    createdAt: new Date().toISOString(),
  };

  const token = generateToken(mockUser, false);

  return {
    user: mockUser,
    token,
  };
}

/**
 * Authenticate user credentials and issue session token.
 */
export async function loginUser(email, password, rememberMe = false) {
  const normalizedEmail = email.trim().toLowerCase();

  if (isDatabaseConnected()) {
    const user = await User.findOne({ email: normalizedEmail }).select(
      '+passwordHash +tokenVersion +accountStatus'
    );

    // Generic invalid credentials message to prevent user enumeration
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    if (user.accountStatus === 'suspended') {
      const error = new Error('Your account has been suspended. Please contact MasterJiEstates support.');
      error.statusCode = 403;
      throw error;
    }

    const token = generateToken(user, rememberMe);

    return {
      user: user.toSafeObject(),
      token,
    };
  }

  // Fallback dev mode mock login
  if (email === 'demo@masterjiestates.in' && password === 'Password123!') {
    const mockUser = {
      id: 'demo_user_001',
      fullName: 'MasterJi Verified Demo User',
      email: 'demo@masterjiestates.in',
      phone: '9876543210',
      role: 'user',
      accountStatus: 'active',
      tokenVersion: 0,
    };
    const token = generateToken(mockUser, rememberMe);
    return { user: mockUser, token };
  }

  const error = new Error('Invalid email or password. (Note: Database is disconnected. Configure server/.env MONGODB_URI for live accounts)');
  error.statusCode = 401;
  throw error;
}

/**
 * Retrieve current user profile by user ID.
 */
export async function getCurrentUser(userId) {
  if (!userId) return null;

  if (isDatabaseConnected()) {
    const user = await User.findById(userId);
    if (user) {
      return user.toSafeObject();
    }
  }

  return null;
}

/**
 * Change authenticated user's password and invalidate all active sessions.
 */
export async function changeUserPassword(userId, currentPassword, newPassword) {
  if (!isDatabaseConnected()) {
    throw new Error('Database connection required to change password.');
  }

  const user = await User.findById(userId).select('+passwordHash +tokenVersion');
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    const error = new Error('Current password is incorrect.');
    error.statusCode = 400;
    error.errors = [{ field: 'currentPassword', message: 'Current password does not match.' }];
    throw error;
  }

  user.passwordHash = await hashPassword(newPassword);
  // Increment tokenVersion so existing JWT tokens are instantly rejected across all devices
  user.incrementTokenVersion();
  await user.save();

  return {
    success: true,
    message: 'Your password has been changed successfully. Please log in with your new password.',
  };
}

/**
 * Request password reset token.
 * Strictly returns a generic response to prevent user account enumeration.
 */
export async function requestPasswordReset(email) {
  const normalizedEmail = email.trim().toLowerCase();

  if (isDatabaseConnected()) {
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // Generate cryptographically secure reset token
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      await user.save();

      // Log delivery notice in development
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          `[MasterJiEstates Auth] Password reset generated for ${normalizedEmail}. Reset token (Dev only): ${rawToken}`
        );
      }
    }
  }

  // Consistent message returned whether email exists or not
  return {
    success: true,
    message:
      'If an account matching that email address exists, instructions to reset your password have been sent.',
  };
}

/**
 * Reset password using a valid, unexpired reset token.
 */
export async function resetPasswordWithToken(rawToken, newPassword) {
  if (!isDatabaseConnected()) {
    throw new Error('Database connection required to reset password.');
  }

  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires +tokenVersion');

  if (!user) {
    const error = new Error('Password reset token is invalid or has expired.');
    error.statusCode = 400;
    error.errors = [{ field: 'token', message: 'Token is invalid or expired. Please request a new one.' }];
    throw error;
  }

  user.passwordHash = await hashPassword(newPassword);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.incrementTokenVersion(); // Invalidate existing sessions
  await user.save();

  return {
    success: true,
    message: 'Your password has been reset successfully. You can now log in with your new password.',
  };
}

