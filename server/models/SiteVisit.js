import mongoose from 'mongoose';

const siteVisitSchema = new mongoose.Schema(
  {
    propertyId: {
      type: String,
      required: [true, 'Property reference is required'],
      index: true,
    },
    propertyTitle: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
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
    preferredDate: {
      type: Date,
      required: [true, 'Preferred visit date is required'],
      index: true,
    },
    preferredTimeSlot: {
      type: String,
      required: [true, 'Preferred time slot is required'],
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['requested', 'confirmed', 'completed', 'cancelled'],
      default: 'requested',
      index: true,
    },
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    assignedStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    internalNotes: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

siteVisitSchema.index({ createdAt: -1 });

export const SiteVisit = mongoose.model('SiteVisit', siteVisitSchema, 'sitevisits');
export default SiteVisit;

