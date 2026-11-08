import mongoose from 'mongoose';

const revisionSchema = new mongoose.Schema(
  {
    revisedAt: { type: Date, default: Date.now },
    revisedBy: {
      adminId: { type: String, default: '' },
      adminName: { type: String, default: '' },
    },
    previousTerms: { type: Object, default: {} },
    reason: { type: String, default: '' },
  },
  { _id: false }
);

const commissionAgreementSchema = new mongoose.Schema(
  {
    commissionType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
      required: true,
    },
    percentageRate: {
      type: Number,
      default: 2,
      min: 0,
      max: 100,
    },
    fixedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    agreedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isEstimated: {
      type: Boolean,
      default: true,
    },
    agreementDate: {
      type: Date,
      default: null,
    },
    payer: {
      type: String,
      enum: ['seller', 'buyer', 'both', 'other'],
      default: 'seller',
    },
    buyerShare: {
      type: Number,
      default: 0,
      min: 0,
    },
    sellerShare: {
      type: Number,
      default: 0,
      min: 0,
    },
    documentReference: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'pending_agreement',
        'agreement_signed',
        'invoiced',
        'partially_collected',
        'fully_collected',
        'waived',
        'disputed',
      ],
      default: 'pending_agreement',
    },
    internalNotes: {
      type: String,
      default: '',
      trim: true,
    },
    revisionHistory: [revisionSchema],
  },
  { _id: false }
);

const brokerageDealSchema = new mongoose.Schema(
  {
    dealReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
      index: true,
    },
    propertyTitle: {
      type: String,
      required: true,
      trim: true,
    },
    propertySlug: {
      type: String,
      default: '',
    },
    propertyCity: {
      type: String,
      default: '',
    },
    seller: {
      userId: { type: String, default: null },
      name: { type: String, default: '', trim: true },
      phone: { type: String, default: '', trim: true },
      email: { type: String, default: '', trim: true },
    },
    buyer: {
      userId: { type: String, default: null },
      name: { type: String, default: '', trim: true },
      phone: { type: String, default: '', trim: true },
      email: { type: String, default: '', trim: true },
    },
    enquiryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enquiry',
      default: null,
    },
    status: {
      type: String,
      enum: [
        'lead',
        'negotiation',
        'agreement_pending',
        'agreement_signed',
        'transaction_in_progress',
        'completed',
        'cancelled',
        'on_hold',
      ],
      default: 'lead',
      index: true,
    },
    expectedTransactionValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    actualTransactionValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    dealDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expectedClosingDate: {
      type: Date,
      default: null,
    },
    actualClosingDate: {
      type: Date,
      default: null,
    },
    responsibleAdmin: {
      adminId: { type: String, default: '' },
      name: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    internalNotes: {
      type: String,
      default: '',
      trim: true,
    },
    commissionAgreement: {
      type: commissionAgreementSchema,
      default: () => ({}),
    },
    totalReceivedCommission: {
      type: Number,
      default: 0,
      min: 0,
    },
    outstandingCommission: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for searching and filtering
brokerageDealSchema.index({ createdAt: -1 });
brokerageDealSchema.index({ status: 1, dealDate: -1 });

export default mongoose.models.BrokerageDeal ||
  mongoose.model('BrokerageDeal', brokerageDealSchema);

