import mongoose from 'mongoose';

const siteContentSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      unique: true,
      enum: ['company', 'services', 'faqs', 'legal'],
      index: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    lastUpdatedBy: {
      adminId: { type: String, default: null },
      adminName: { type: String, default: 'Admin' },
      updatedAt: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
  }
);

export const SiteContent = mongoose.model('SiteContent', siteContentSchema);
export default SiteContent;

