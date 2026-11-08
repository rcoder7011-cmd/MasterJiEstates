import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    demoId: {
      type: String,
      sparse: true,
      index: true,
    },
    title: {
      type: String,
      required: [function () { return !this.isDraft; }, 'Property title is required'],
      trim: true,
      validate: {
        validator: function (v) {
          if (this.isDraft) return true;
          return typeof v === 'string' && v.trim().length >= 5 && v.trim().length <= 200;
        },
        message: 'Title must be between 5 and 200 characters long',
      },
      default: 'Untitled Property Draft',
    },
    slug: {
      type: String,
      required: [true, 'Property slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [function () { return !this.isDraft; }, 'Property description is required'],
      trim: true,
      validate: {
        validator: function (v) {
          if (this.isDraft) return true;
          return typeof v === 'string' && v.trim().length >= 20;
        },
        message: 'Description must be at least 20 characters long',
      },
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Property category is required'],
      enum: [
        'apartment',
        'villa',
        'residential_plot',
        'commercial_property',
        'independent_house',
        'commercial_building',
        'other',
      ],
      index: true,
    },
    categoryLabel: {
      type: String,
      default: '',
    },
    listingType: {
      type: String,
      required: [true, 'Listing type is required'],
      enum: ['company_owned', 'brokerage', 'owner'],
      default: 'brokerage',
      index: true,
    },
    listingTypeLabel: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [function () { return !this.isDraft; }, 'Property price is required'],
      min: [0, 'Price must be a positive number'],
      index: true,
      default: 0,
    },
    priceFormatted: {
      type: String,
      default: '',
    },
    priceNegotiable: {
      type: Boolean,
      default: true,
    },
    city: {
      type: String,
      required: [function () { return !this.isDraft; }, 'City is required'],
      trim: true,
      index: true,
      default: '',
    },
    locality: {
      type: String,
      required: [function () { return !this.isDraft; }, 'Locality is required'],
      trim: true,
      index: true,
      default: '',
    },
    state: {
      type: String,
      default: '',
      trim: true,
    },
    pincode: {
      type: String,
      default: '',
      trim: true,
    },
    landmark: {
      type: String,
      default: '',
      trim: true,
    },
    addressDisplay: {
      type: String,
      default: '',
    },
    area: {
      type: Number,
      required: [function () { return !this.isDraft; }, 'Area is required'],
      min: [0, 'Area must be greater than or equal to 0'],
      default: 0,
    },
    areaUnit: {
      type: String,
      default: 'sqft',
    },
    bedrooms: {
      type: Number,
      default: 0,
      index: true,
    },
    bathrooms: {
      type: Number,
      default: 0,
    },
    parking: {
      type: Number,
      default: 0,
    },
    furnishing: {
      type: String,
      default: 'Unfurnished',
    },
    floor: {
      type: String,
      default: '',
    },
    facing: {
      type: String,
      default: '',
    },
    availabilityStatus: {
      type: String,
      enum: [
        'draft',
        'pending_review',
        'changes_requested',
        'available',
        'under_negotiation',
        'sold',
        'withdrawn',
        'rejected',
      ],
      default: 'available',
      index: true,
    },
    availabilityLabel: {
      type: String,
      default: 'Available',
    },
    isDraft: {
      type: Boolean,
      default: false,
      index: true,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    submissionNotes: {
      type: String,
      default: '',
    },
    moderation: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'changes_requested'],
        default: 'pending',
      },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reviewedAt: { type: Date, default: null },
      rejectionReason: { type: String, default: '' },
      changeRequestRemarks: { type: String, default: '' },
      internalAdminNotes: { type: String, default: '' },
    },
    imageUrl: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    cloudinaryAssets: {
      type: [
        {
          publicId: { type: String, required: true },
          url: { type: String, required: true },
          secureUrl: { type: String, required: true },
          width: Number,
          height: Number,
          format: String,
          bytes: Number,
          isCover: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
    tagline: {
      type: String,
      default: '',
    },
    amenities: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDemo: {
      type: Boolean,
      default: false,
      index: true,
    },

    // --- Private & Sensitive Back-Office Fields (Omitted from public queries) ---
    privateAddress: {
      type: String,
      select: false,
    },
    owner: {
      type: {
        name: String,
        phone: String,
        email: String,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
      select: false,
    },
    acquisitionCost: {
      type: Number,
      select: false,
    },
    acquisitionDate: {
      type: Date,
      default: null,
      select: false,
    },
    internalNotes: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for id getter that returns string representation
propertySchema.virtual('id').get(function () {
  return this.demoId || this._id.toHexString();
});

// Text index for search across title, description, locality, tagline, city
propertySchema.index(
  {
    title: 'text',
    description: 'text',
    locality: 'text',
    tagline: 'text',
    city: 'text',
  },
  {
    weights: {
      title: 10,
      locality: 5,
      city: 3,
      tagline: 2,
      description: 1,
    },
    name: 'PropertyTextIndex',
  }
);

// Compound indexes for optimal catalog filtering
propertySchema.index({ city: 1, category: 1, listingType: 1, price: 1 });
propertySchema.index({ availabilityStatus: 1, featured: -1, createdAt: -1 });
propertySchema.index({ 'owner.userId': 1, availabilityStatus: 1, createdAt: -1 });

export const Property = mongoose.model('Property', propertySchema, 'properties');
export default Property;
