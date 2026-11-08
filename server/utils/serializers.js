/**
 * Format Indian currency number into human-readable Crores or Lakhs.
 * E.g. 18500000 -> ₹1.85 Cr, 8500000 -> ₹85 Lakhs.
 */
export function formatIndianPrice(price) {
  if (typeof price !== 'number' || isNaN(price)) return 'Price on Request';
  if (price >= 10000000) {
    const cr = price / 10000000;
    return `₹${cr % 1 === 0 ? cr : cr.toFixed(2)} Cr`;
  }
  if (price >= 100000) {
    const lk = price / 100000;
    return `₹${lk % 1 === 0 ? lk : lk.toFixed(2)} Lakhs`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
}

const CATEGORY_LABELS = {
  apartment: 'Apartments & Flats',
  villa: 'Villas',
  residential_plot: 'Residential Plots',
  commercial_property: 'Commercial Properties',
  independent_house: 'Independent Houses',
  commercial_building: 'Commercial Buildings',
  other: 'Other Real Estate',
};

const LISTING_TYPE_LABELS = {
  company_owned: 'MasterJi Direct',
  brokerage: 'Brokerage',
  owner: 'Direct Owner',
};

const AVAILABILITY_LABELS = {
  draft: 'Draft',
  available: 'Available',
  under_negotiation: 'Under Negotiation',
  sold: 'Sold',
  withdrawn: 'Withdrawn',
  pending_review: 'Verification Pending',
  changes_requested: 'Changes Requested',
  rejected: 'Rejected',
};

/**
 * Serialize a Property database document or raw object into a safe Public DTO.
 *
 * PRIVACY GUARANTEE:
 * Private street addresses, owner details, acquisition costs, and internal operational notes
 * are strictly stripped from this public representation.
 *
 * @param {object} doc - Mongoose Document or raw property object
 * @returns {object} Public Property DTO
 */
export function serializePublicProperty(doc) {
  if (!doc) return null;

  // Convert Mongoose document to plain JS object if needed
  const raw = typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true }) : doc;

  const id = raw.demoId || (raw._id ? raw._id.toString() : raw.id);
  const price = typeof raw.price === 'number' ? raw.price : 0;
  const category = raw.category || 'other';
  const listingType = raw.listingType || 'brokerage';
  const availabilityStatus = raw.availabilityStatus || 'available';

  return {
    id,
    _id: raw._id ? raw._id.toString() : undefined,
    title: raw.title || '',
    slug: raw.slug || '',
    description: raw.description || '',
    category,
    categoryLabel: raw.categoryLabel || CATEGORY_LABELS[category] || category,
    listingType,
    listingTypeLabel: raw.listingTypeLabel || LISTING_TYPE_LABELS[listingType] || listingType,
    price,
    priceFormatted: raw.priceFormatted || formatIndianPrice(price),
    priceNegotiable: raw.priceNegotiable !== false,
    city: raw.city || '',
    locality: raw.locality || '',
    state: raw.state || '',
    pincode: raw.pincode || '',
    landmark: raw.landmark || '',
    addressDisplay: raw.addressDisplay || (raw.locality ? `${raw.locality}, ${raw.city}` : raw.city),
    area: raw.area || 0,
    areaUnit: raw.areaUnit || 'sqft',
    bedrooms: raw.bedrooms || 0,
    bathrooms: raw.bathrooms || 0,
    parking: raw.parking || 0,
    furnishing: raw.furnishing || 'Unfurnished',
    floor: raw.floor || '',
    facing: raw.facing || '',
    availabilityStatus,
    availabilityLabel: raw.availabilityLabel || AVAILABILITY_LABELS[availabilityStatus] || 'Available',
    isDraft: Boolean(raw.isDraft),
    submittedAt: raw.submittedAt || null,
    imageUrl: raw.imageUrl || (Array.isArray(raw.images) && raw.images[0]) || '',
    images: Array.isArray(raw.images) ? raw.images : [],
    cloudinaryAssets: Array.isArray(raw.cloudinaryAssets) ? raw.cloudinaryAssets : [],
    tagline: raw.tagline || '',
    amenities: Array.isArray(raw.amenities) ? raw.amenities : [],
    featured: Boolean(raw.featured),
    isDemo: Boolean(raw.isDemo),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

/**
 * Serialize a collection of Property documents into public DTOs.
 *
 * @param {Array<object>} list
 * @returns {Array<object>}
 */
export function serializePublicPropertyList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(serializePublicProperty);
}

/**
 * Serialize a Property document for the authenticated owner/seller.
 * Allows the seller to view/edit their own contact details, address, and moderation feedback,
 * while keeping internal corporate financial data (acquisition cost, admin notes) strictly hidden.
 *
 * @param {object} doc
 * @returns {object} Seller Owned Property DTO
 */
export function serializeSellerOwnedProperty(doc) {
  if (!doc) return null;
  const base = serializePublicProperty(doc);
  const raw = typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true }) : doc;

  return {
    ...base,
    address: raw.privateAddress || '',
    privateAddress: raw.privateAddress || '',
    owner: raw.owner ? {
      name: raw.owner.name || '',
      phone: raw.owner.phone || '',
      email: raw.owner.email || '',
      userId: raw.owner.userId ? raw.owner.userId.toString() : null,
    } : null,
    moderation: raw.moderation ? {
      status: raw.moderation.status || 'pending',
      changeRequestRemarks: raw.moderation.changeRequestRemarks || '',
      rejectionReason: raw.moderation.rejectionReason || '',
    } : null,
  };
}

/**
 * Serialize a Property document into a privileged Admin DTO.
 * Includes unmasked owner contact information, moderation tracking, and internal company metrics.
 *
 * @param {object} doc
 * @returns {object} Admin Property DTO
 */
export function serializeAdminProperty(doc) {
  if (!doc) return null;
  const base = serializePublicProperty(doc);
  const raw = typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true }) : doc;

  return {
    ...base,
    privateAddress: raw.privateAddress || '',
    owner: raw.owner ? {
      name: raw.owner.name || '',
      phone: raw.owner.phone || '',
      email: raw.owner.email || '',
      userId: raw.owner.userId ? raw.owner.userId.toString() : null,
    } : null,
    moderation: raw.moderation || {
      status: 'pending',
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: '',
      changeRequestRemarks: '',
      internalAdminNotes: '',
    },
    acquisitionCost: raw.acquisitionCost !== undefined ? raw.acquisitionCost : null,
    acquisitionDate: raw.acquisitionDate || null,
    internalNotes: raw.internalNotes || '',
    submissionNotes: raw.submissionNotes || '',
  };
}

/**
 * Serialize a collection of Property documents into privileged Admin DTOs.
 */
export function serializeAdminPropertyList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(serializeAdminProperty);
}

