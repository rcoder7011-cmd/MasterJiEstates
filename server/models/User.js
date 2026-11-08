import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters long'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'],
      index: true,
    },
    passwordHash: {
      type: String,
      select: false, // Strictly omitted from default queries
    },
    role: {
      type: String,
      enum: ['user', 'staff', 'admin'],
      default: 'user',
      index: true,
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'pending'],
      default: 'active',
      index: true,
    },
    tokenVersion: {
      type: Number,
      default: 0,
      index: true, // Used for instant cross-device session invalidation
    },
    passwordResetToken: {
      type: String,
      select: false, // SHA-256 hash of reset token
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    preferences: {
      type: Object,
      default: {},
    },
    favourites: {
      type: [String],
      default: [],
    },
    recentlyViewed: {
      type: [
        {
          propertyId: { type: String, required: true },
          viewedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Compare a candidate plaintext password with the stored bcrypt hash.
 *
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * Invalidate all existing active JWT tokens by incrementing tokenVersion.
 */
userSchema.methods.incrementTokenVersion = function () {
  this.tokenVersion = (this.tokenVersion || 0) + 1;
};

/**
 * Produce a safe user DTO stripped of sensitive credentials.
 *
 * @returns {object} Safe user profile representation
 */
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id ? this._id.toString() : this.id,
    fullName: this.fullName,
    email: this.email,
    phone: this.phone,
    role: this.role,
    accountStatus: this.accountStatus,
    isEmailVerified: Boolean(this.isEmailVerified),
    isPhoneVerified: Boolean(this.isPhoneVerified),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const User = mongoose.model('User', userSchema, 'users');
export default User;
