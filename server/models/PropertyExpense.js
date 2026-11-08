import mongoose from 'mongoose';

const propertyExpenseSchema = new mongoose.Schema(
  {
    expenseReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    propertyTitle: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'registration',
        'legal_documentation',
        'renovation',
        'repair_maintenance',
        'brokerage_paid',
        'marketing',
        'interior_work',
        'utilities',
        'other',
      ],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    vendor: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    receiptReference: {
      type: String,
      default: '',
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'upi', 'cheque', 'cash', 'other'],
      default: 'bank_transfer',
    },
    isReversed: {
      type: Boolean,
      default: false,
      index: true,
    },
    reversalReason: {
      type: String,
      default: '',
      trim: true,
    },
    reversedAt: {
      type: Date,
      default: null,
    },
    reversedBy: {
      adminId: { type: String, default: '' },
      adminName: { type: String, default: '' },
    },
    recordedBy: {
      adminId: { type: String, default: '' },
      adminName: { type: String, default: '' },
      adminEmail: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

propertyExpenseSchema.index({ propertyId: 1, isReversed: 1 });
propertyExpenseSchema.index({ createdAt: -1 });

export default mongoose.models.PropertyExpense ||
  mongoose.model('PropertyExpense', propertyExpenseSchema);

