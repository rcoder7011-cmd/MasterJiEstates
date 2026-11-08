import mongoose from 'mongoose';

const commissionPaymentSchema = new mongoose.Schema(
  {
    paymentReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BrokerageDeal',
      required: true,
      index: true,
    },
    dealReference: {
      type: String,
      required: true,
      trim: true,
    },
    propertyTitle: {
      type: String,
      default: '',
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
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'upi', 'cheque', 'cash', 'other'],
      required: true,
    },
    transactionNumber: {
      type: String,
      default: '',
      trim: true,
    },
    receivedFrom: {
      type: String,
      enum: ['buyer', 'seller', 'other'],
      default: 'seller',
    },
    payerName: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'partially_paid', 'paid', 'overdue', 'cancelled'],
      default: 'paid',
      index: true,
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
    internalRemarks: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

commissionPaymentSchema.index({ createdAt: -1 });

export default mongoose.models.CommissionPayment ||
  mongoose.model('CommissionPayment', commissionPaymentSchema);

