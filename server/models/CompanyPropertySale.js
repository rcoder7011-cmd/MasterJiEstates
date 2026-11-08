import mongoose from 'mongoose';

const companyPropertySaleSchema = new mongoose.Schema(
  {
    saleReference: {
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
      unique: true,
      index: true,
    },
    propertyTitle: {
      type: String,
      default: '',
      trim: true,
    },
    buyer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, default: '', trim: true },
      email: { type: String, default: '', trim: true },
      address: { type: String, default: '', trim: true },
    },
    saleDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    saleAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    agreementReference: {
      type: String,
      required: true,
      trim: true,
    },
    paymentReceived: {
      type: Number,
      default: 0,
      min: 0,
    },
    outstandingBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partially_paid', 'fully_paid'],
      default: 'pending',
    },
    acquisitionCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalExpenses: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalInvestment: {
      type: Number,
      default: 0,
      min: 0,
    },
    grossProfit: {
      type: Number,
      default: 0,
    },
    grossMarginPercentage: {
      type: Number,
      default: 0,
    },
    internalRemarks: {
      type: String,
      default: '',
      trim: true,
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

companyPropertySaleSchema.index({ createdAt: -1 });

export default mongoose.models.CompanyPropertySale ||
  mongoose.model('CompanyPropertySale', companyPropertySaleSchema);

