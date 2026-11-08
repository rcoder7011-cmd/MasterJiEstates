import mongoose from 'mongoose';

const businessExpenseSchema = new mongoose.Schema(
  {
    expenseReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'office_rent',
        'staff_costs',
        'software_subscriptions',
        'marketing',
        'travel',
        'utilities',
        'professional_services',
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
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'upi', 'cheque', 'cash', 'other'],
      default: 'bank_transfer',
    },
    referenceNumber: {
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

businessExpenseSchema.index({ createdAt: -1 });
businessExpenseSchema.index({ category: 1, date: -1 });

export default mongoose.models.BusinessExpense ||
  mongoose.model('BusinessExpense', businessExpenseSchema);

