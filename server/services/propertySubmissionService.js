import mongoose from 'mongoose';
import Property from '../models/Property.js';
import { isDatabaseConnected } from '../config/database.js';
import {
  validateDraftInput,
  validateSubmissionInput,
  CATEGORY_LABELS,
} from '../validators/propertySubmissionValidator.js';
import { serializePublicProperty, serializeSellerOwnedProperty, formatIndianPrice } from '../utils/serializers.js';

// In-memory storage for drafts and seller submissions when operating in dev/offline mode
export const inMemorySubmissionStore = new Map(); // id -> property object

/**
 * Generate a unique SEO slug from a title string.
 */
function generatePropertySlug(title) {
  const clean = (title || 'listing')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${clean.slice(0, 50)}-${randomSuffix}`;
}

/**
 * Resolve cover image and images array from validated Cloudinary assets.
 */
function resolveImagesFromAssets(cloudinaryAssets) {
  if (!Array.isArray(cloudinaryAssets) || cloudinaryAssets.length === 0) {
    return { imageUrl: '', images: [] };
  }

  const coverAsset = cloudinaryAssets.find((a) => a.isCover) || cloudinaryAssets[0];
  const imageUrl = coverAsset.secureUrl || coverAsset.url;
  const images = cloudinaryAssets.map((a) => a.secureUrl || a.url);

  return { imageUrl, images };
}

/**
 * 1. Create a new property draft.
 */
export async function createPropertyDraft(user, draftData) {
  const validation = validateDraftInput(draftData);
  if (!validation.isValid) {
    const error = new Error('Draft validation failed.');
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  const title = (draftData.title || 'Untitled Property Draft').trim();
  const slug = generatePropertySlug(title);
  const category = draftData.category || 'apartment';
  const price = typeof draftData.price === 'number' ? draftData.price : Number(draftData.price) || 0;
  const area = typeof draftData.area === 'number' ? draftData.area : Number(draftData.area) || 0;

  const { imageUrl, images } = resolveImagesFromAssets(validation.validatedAssets);

  // Strictly enforce business security constraints (Owner vs Brokerage; Company-owned restricted to admin)
  const rawType = (draftData.listingType || draftData.sellerListingType || '').trim().toLowerCase();
  const resolvedListingType = rawType === 'owner' ? 'owner' : 'brokerage';
  const resolvedListingTypeLabel = resolvedListingType === 'owner' ? 'Direct Owner' : 'Brokerage';

  const propertyPayload = {
    title,
    slug,
    description: (draftData.description || '').trim(),
    category,
    categoryLabel: CATEGORY_LABELS[category] || category,
    listingType: resolvedListingType,
    listingTypeLabel: resolvedListingTypeLabel,
    price,
    priceFormatted: price > 0 ? formatIndianPrice(price) : 'Price on Request',
    priceNegotiable: draftData.priceNegotiable !== false,
    city: (draftData.city || '').trim(),
    locality: (draftData.locality || '').trim(),
    state: (draftData.state || '').trim(),
    pincode: (draftData.pincode || '').trim(),
    landmark: (draftData.landmark || '').trim(),
    addressDisplay: draftData.locality
      ? `${draftData.locality.trim()}, ${(draftData.city || '').trim()}`
      : draftData.city || '',
    area,
    areaUnit: draftData.areaUnit || 'sqft',
    bedrooms: Number(draftData.bedrooms) || 0,
    bathrooms: Number(draftData.bathrooms) || 0,
    parking: Number(draftData.parking) || 0,
    furnishing: draftData.furnishing || 'Unfurnished',
    floor: draftData.floor || '',
    facing: draftData.facing || '',
    amenities: Array.isArray(draftData.amenities) ? draftData.amenities : [],
    imageUrl,
    images,
    cloudinaryAssets: validation.validatedAssets,
    isDraft: true, // Mark as draft
    availabilityStatus: 'draft',
    availabilityLabel: 'Draft',
    owner: {
      userId: mongoose.Types.ObjectId.isValid(user.id) ? new mongoose.Types.ObjectId(user.id) : user.id, // Strictly bound to authenticated session
      name: (draftData.ownerName || user.fullName || 'Property Owner').trim(),
      email: (draftData.ownerEmail || user.email || '').trim().toLowerCase(),
      phone: (draftData.ownerPhone || user.phone || '').trim().replace(/[\s-]/g, ''),
    },
    privateAddress: (draftData.address || draftData.privateAddress || '').trim(),
    isDemo: false,
  };

  if (isDatabaseConnected()) {
    const doc = await Property.create(propertyPayload);
    return serializeSellerOwnedProperty(doc);
  }

  // In-memory fallback
  const mockId = `draft_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const mockDoc = {
    ...propertyPayload,
    id: mockId,
    _id: mockId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  inMemorySubmissionStore.set(mockId, mockDoc);
  return serializeSellerOwnedProperty(mockDoc);
}

/**
 * 2. Update an existing property draft.
 */
export async function updatePropertyDraft(user, draftId, updateData) {
  const validation = validateDraftInput(updateData);
  if (!validation.isValid) {
    const error = new Error('Draft update validation failed.');
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  if (isDatabaseConnected()) {
    const isObjectId = mongoose.Types.ObjectId.isValid(draftId);
    const filter = isObjectId ? { _id: draftId } : { slug: draftId };
    const property = await Property.findOne(filter).select('+owner +privateAddress +moderation');

    if (!property) {
      const error = new Error('Property draft not found.');
      error.statusCode = 404;
      throw error;
    }

    // Ownership verification
    const ownerUserId = property.owner?.userId?.toString();
    if (ownerUserId && ownerUserId !== user.id) {
      const error = new Error('Unauthorized to modify this property draft.');
      error.statusCode = 403;
      throw error;
    }

    // Can only edit if currently a draft or if changes were requested by admin
    if (!property.isDraft && property.availabilityStatus !== 'draft' && property.availabilityStatus !== 'changes_requested') {
      const error = new Error(
        'This listing has already been submitted for verification and cannot be edited directly.'
      );
      error.statusCode = 400;
      throw error;
    }

    // Apply allowed updates
    if (updateData.title !== undefined) {
      property.title = updateData.title.trim();
    }
    if (updateData.description !== undefined) {
      property.description = updateData.description.trim();
    }
    if (updateData.category !== undefined) {
      property.category = updateData.category;
      property.categoryLabel = CATEGORY_LABELS[updateData.category] || updateData.category;
    }
    if (updateData.city !== undefined) property.city = updateData.city.trim();
    if (updateData.locality !== undefined) property.locality = updateData.locality.trim();
    if (updateData.state !== undefined) property.state = updateData.state.trim();
    if (updateData.pincode !== undefined) property.pincode = updateData.pincode.trim();
    if (updateData.landmark !== undefined) property.landmark = updateData.landmark.trim();

    if (property.locality || property.city) {
      property.addressDisplay = property.locality
        ? `${property.locality}, ${property.city}`
        : property.city;
    }

    if (updateData.price !== undefined) {
      const p = Number(updateData.price) || 0;
      property.price = p;
      property.priceFormatted = p > 0 ? formatIndianPrice(p) : 'Price on Request';
    }
    if (updateData.priceNegotiable !== undefined) {
      property.priceNegotiable = updateData.priceNegotiable !== false;
    }
    if (updateData.area !== undefined) property.area = Number(updateData.area) || 0;
    if (updateData.areaUnit !== undefined) property.areaUnit = updateData.areaUnit;
    if (updateData.bedrooms !== undefined) property.bedrooms = Number(updateData.bedrooms) || 0;
    if (updateData.bathrooms !== undefined) property.bathrooms = Number(updateData.bathrooms) || 0;
    if (updateData.parking !== undefined) property.parking = Number(updateData.parking) || 0;
    if (updateData.furnishing !== undefined) property.furnishing = updateData.furnishing;
    if (updateData.amenities !== undefined) {
      property.amenities = Array.isArray(updateData.amenities) ? updateData.amenities : [];
    }

    if (updateData.ownerName || updateData.ownerPhone || updateData.ownerEmail) {
      property.owner = {
        userId: property.owner?.userId || user.id,
        name: (updateData.ownerName || property.owner?.name || user.fullName || 'Property Owner').trim(),
        email: (updateData.ownerEmail || property.owner?.email || user.email || '').trim().toLowerCase(),
        phone: (updateData.ownerPhone || property.owner?.phone || user.phone || '').trim().replace(/[\s-]/g, ''),
      };
    }

    if (updateData.listingType !== undefined || updateData.sellerListingType !== undefined) {
      const lt = (updateData.listingType || updateData.sellerListingType || '').trim().toLowerCase();
      if (lt === 'owner') {
        property.listingType = 'owner';
        property.listingTypeLabel = 'Direct Owner';
      } else if (lt === 'brokerage') {
        property.listingType = 'brokerage';
        property.listingTypeLabel = 'Brokerage';
      }
    }

    if (updateData.address !== undefined || updateData.privateAddress !== undefined) {
      property.privateAddress = (updateData.address || updateData.privateAddress || '').trim();
    }

    if (validation.validatedAssets && validation.validatedAssets.length > 0) {
      property.cloudinaryAssets = validation.validatedAssets;
      const { imageUrl, images } = resolveImagesFromAssets(validation.validatedAssets);
      property.imageUrl = imageUrl;
      property.images = images;
    }

    await property.save();
    return serializeSellerOwnedProperty(property);
  }

  // In-memory fallback
  const mockDoc = inMemorySubmissionStore.get(draftId);
  if (!mockDoc) {
    const error = new Error('Property draft not found.');
    error.statusCode = 404;
    throw error;
  }

  if (mockDoc.owner?.userId !== user.id) {
    const error = new Error('Unauthorized to modify this property draft.');
    error.statusCode = 403;
    throw error;
  }

  if (!mockDoc.isDraft && mockDoc.availabilityStatus !== 'draft' && mockDoc.availabilityStatus !== 'changes_requested') {
    const error = new Error(
      'This listing has already been submitted for verification and cannot be edited directly.'
    );
    error.statusCode = 400;
    throw error;
  }

  const updatedOwner = (updateData.ownerName || updateData.ownerPhone || updateData.ownerEmail) ? {
    userId: mockDoc.owner?.userId || user.id,
    name: (updateData.ownerName || mockDoc.owner?.name || user.fullName || 'Property Owner').trim(),
    email: (updateData.ownerEmail || mockDoc.owner?.email || user.email || '').trim().toLowerCase(),
    phone: (updateData.ownerPhone || mockDoc.owner?.phone || user.phone || '').trim().replace(/[\s-]/g, ''),
  } : mockDoc.owner;

  const rawLt = (updateData.listingType || updateData.sellerListingType || mockDoc.listingType || '').trim().toLowerCase();
  const fallbackLt = rawLt === 'owner' ? 'owner' : 'brokerage';
  const fallbackLtLabel = fallbackLt === 'owner' ? 'Direct Owner' : 'Brokerage';

  const updated = {
    ...mockDoc,
    ...updateData,
    listingType: fallbackLt,
    listingTypeLabel: fallbackLtLabel,
    owner: updatedOwner,
    privateAddress: updateData.address || updateData.privateAddress || mockDoc.privateAddress || '',
    updatedAt: new Date().toISOString(),
  };

  if (validation.validatedAssets && validation.validatedAssets.length > 0) {
    updated.cloudinaryAssets = validation.validatedAssets;
    const { imageUrl, images } = resolveImagesFromAssets(validation.validatedAssets);
    updated.imageUrl = imageUrl;
    updated.images = images;
  }

  if (updated.price) {
    updated.priceFormatted = formatIndianPrice(Number(updated.price));
  }

  inMemorySubmissionStore.set(draftId, updated);
  return serializeSellerOwnedProperty(updated);
}

/**
 * 3. Fetch a single property draft/listing owned by the authenticated user.
 */
export async function getOwnedPropertyById(user, draftId) {
  if (isDatabaseConnected()) {
    const isObjectId = mongoose.Types.ObjectId.isValid(draftId);
    const filter = isObjectId ? { _id: draftId } : { slug: draftId };
    const property = await Property.findOne(filter).select('+owner +privateAddress +moderation');

    if (!property) {
      const error = new Error('Property listing not found.');
      error.statusCode = 404;
      throw error;
    }

    const ownerUserId = property.owner?.userId?.toString();
    if (ownerUserId && ownerUserId !== user.id) {
      const error = new Error('Unauthorized to view this listing.');
      error.statusCode = 403;
      throw error;
    }

    return serializeSellerOwnedProperty(property);
  }

  // In-memory fallback
  const mockDoc = inMemorySubmissionStore.get(draftId);
  if (!mockDoc) {
    const error = new Error('Property listing not found.');
    error.statusCode = 404;
    throw error;
  }

  if (mockDoc.owner?.userId !== user.id) {
    const error = new Error('Unauthorized to view this listing.');
    error.statusCode = 403;
    throw error;
  }

  return serializeSellerOwnedProperty(mockDoc);
}

/**
 * 4. Submit draft for admin review.
 * Performs rigorous final validation across all steps before state transition.
 */
export async function submitDraftForReview(user, draftId, optionalPayload = {}) {
  let property;

  if (isDatabaseConnected()) {
    const isObjectId = mongoose.Types.ObjectId.isValid(draftId);
    const filter = isObjectId ? { _id: draftId } : { slug: draftId };
    property = await Property.findOne(filter).select('+owner');
  } else {
    property = inMemorySubmissionStore.get(draftId);
  }

  if (!property) {
    const error = new Error('Property draft not found.');
    error.statusCode = 404;
    throw error;
  }

  // Ownership verification
  const ownerUserId = isDatabaseConnected()
    ? property.owner?.userId?.toString()
    : property.owner?.userId;

  if (ownerUserId && ownerUserId !== user.id) {
    const error = new Error('Unauthorized to submit this property.');
    error.statusCode = 403;
    throw error;
  }

  // Check state: prevent duplicate submission
  if (property.availabilityStatus === 'pending_review') {
    return {
      success: true,
      message: 'This property has already been submitted and is currently in the verification queue.',
      property: serializePublicProperty(property),
    };
  }

  if (property.availabilityStatus === 'available') {
    const error = new Error('This property is already verified and published on the portal.');
    error.statusCode = 400;
    throw error;
  }

  // Merge optional updates before final validation
  const cumulativeData = {
    title: optionalPayload?.title || property.title,
    category: optionalPayload?.category || property.category,
    description: optionalPayload?.description || property.description,
    city: optionalPayload?.city || property.city,
    locality: optionalPayload?.locality || property.locality,
    state: optionalPayload?.state || property.state,
    pincode: optionalPayload?.pincode || property.pincode,
    price: optionalPayload?.price !== undefined ? optionalPayload.price : property.price,
    area: optionalPayload?.area !== undefined ? optionalPayload.area : property.area,
    listingType:
      optionalPayload?.listingType ||
      optionalPayload?.sellerListingType ||
      property.listingType ||
      'brokerage',
    cloudinaryAssets:
      optionalPayload?.cloudinaryAssets || property.cloudinaryAssets || [],
    images: optionalPayload?.images || property.images || [],
    ownerName: optionalPayload?.ownerName || property.owner?.name || user?.fullName,
    ownerPhone: optionalPayload?.ownerPhone || property.owner?.phone || user?.phone,
    ownerEmail: optionalPayload?.ownerEmail || property.owner?.email || user?.email,
    agreedToDeclaration: optionalPayload?.agreedToDeclaration,
  };

  const validation = validateSubmissionInput(cumulativeData);
  if (!validation.isValid) {
    const error = new Error('Property submission validation failed. Please complete all required steps.');
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  if (isDatabaseConnected()) {
    property.isDraft = false;
    property.availabilityStatus = 'pending_review';
    property.availabilityLabel = 'Verification Pending';
    property.submittedAt = new Date();
    property.submissionNotes = (optionalPayload?.submissionNotes || '').trim();

    if (optionalPayload?.listingType || optionalPayload?.sellerListingType) {
      const lt = (optionalPayload.listingType || optionalPayload.sellerListingType).trim().toLowerCase();
      if (lt === 'owner') {
        property.listingType = 'owner';
        property.listingTypeLabel = 'Direct Owner';
      } else if (lt === 'brokerage') {
        property.listingType = 'brokerage';
        property.listingTypeLabel = 'Brokerage';
      }
    }

    if (optionalPayload?.ownerName || optionalPayload?.ownerPhone || optionalPayload?.ownerEmail) {
      property.owner = {
        userId: property.owner?.userId || user.id,
        name: (optionalPayload.ownerName || property.owner?.name || user.fullName || 'Property Owner').trim(),
        email: (optionalPayload.ownerEmail || property.owner?.email || user.email || '').trim().toLowerCase(),
        phone: (optionalPayload.ownerPhone || property.owner?.phone || user.phone || '').trim().replace(/[\s-]/g, ''),
      };
    }
    if (optionalPayload?.address !== undefined || optionalPayload?.privateAddress !== undefined) {
      property.privateAddress = (optionalPayload.address || optionalPayload.privateAddress || '').trim();
    }

    if (validation.validatedAssets && validation.validatedAssets.length > 0) {
      property.cloudinaryAssets = validation.validatedAssets;
      const { imageUrl, images } = resolveImagesFromAssets(validation.validatedAssets);
      property.imageUrl = imageUrl;
      property.images = images;
    }

    await property.save();
    return {
      success: true,
      message: 'Your property has been submitted for review. MasterJi advisors will inspect and verify your listing.',
      property: serializeSellerOwnedProperty(property),
    };
  }

  // In-memory fallback
  const submitLt = (optionalPayload?.listingType || optionalPayload?.sellerListingType || property.listingType || '').trim().toLowerCase();
  const resolvedSubmitLt = submitLt === 'owner' ? 'owner' : 'brokerage';
  const resolvedSubmitLtLabel = resolvedSubmitLt === 'owner' ? 'Direct Owner' : 'Brokerage';

  const updatedMock = {
    ...property,
    listingType: resolvedSubmitLt,
    listingTypeLabel: resolvedSubmitLtLabel,
    isDraft: false,
    availabilityStatus: 'pending_review',
    availabilityLabel: 'Verification Pending',
    submittedAt: new Date().toISOString(),
    submissionNotes: (optionalPayload?.submissionNotes || '').trim(),
    owner: (optionalPayload?.ownerName || optionalPayload?.ownerPhone || optionalPayload?.ownerEmail) ? {
      userId: property.owner?.userId || user.id,
      name: (optionalPayload.ownerName || property.owner?.name || user.fullName || 'Property Owner').trim(),
      email: (optionalPayload.ownerEmail || property.owner?.email || user.email || '').trim().toLowerCase(),
      phone: (optionalPayload.ownerPhone || property.owner?.phone || user.phone || '').trim().replace(/[\s-]/g, ''),
    } : property.owner,
    privateAddress: optionalPayload?.address || optionalPayload?.privateAddress || property.privateAddress || '',
    updatedAt: new Date().toISOString(),
  };

  inMemorySubmissionStore.set(draftId, updatedMock);

  return {
    success: true,
    message: 'Your property has been submitted for review. MasterJi advisors will inspect and verify your listing.',
    property: serializeSellerOwnedProperty(updatedMock),
  };
}

/**
 * 5. Safe withdrawal of an owned listing.
 */
export async function withdrawUserListing(user, listingId) {
  let property;

  if (isDatabaseConnected()) {
    const isObjectId = mongoose.Types.ObjectId.isValid(listingId);
    const filter = isObjectId ? { _id: listingId } : { slug: listingId };
    property = await Property.findOne(filter).select('+owner');
  } else {
    property = inMemorySubmissionStore.get(listingId);
  }

  if (!property) {
    const error = new Error('Property listing not found.');
    error.statusCode = 404;
    throw error;
  }

  const ownerUserId = isDatabaseConnected()
    ? property.owner?.userId?.toString()
    : property.owner?.userId;

  if (ownerUserId && ownerUserId !== user.id) {
    const error = new Error('Unauthorized to withdraw this listing.');
    error.statusCode = 403;
    throw error;
  }

  if (property.availabilityStatus === 'sold') {
    const error = new Error('Sold properties cannot be withdrawn.');
    error.statusCode = 400;
    throw error;
  }

  if (isDatabaseConnected()) {
    property.availabilityStatus = 'withdrawn';
    property.availabilityLabel = 'Withdrawn';
    await property.save();
    return {
      success: true,
      message: 'Property listing has been withdrawn.',
      property: serializePublicProperty(property),
    };
  }

  const updated = {
    ...property,
    availabilityStatus: 'withdrawn',
    availabilityLabel: 'Withdrawn',
    updatedAt: new Date().toISOString(),
  };
  inMemorySubmissionStore.set(listingId, updated);

  return {
    success: true,
    message: 'Property listing has been withdrawn.',
    property: serializePublicProperty(updated),
  };
}

/**
 * 6. Get all owned listings and drafts for the user.
 */
export async function getUserListingsAndDrafts(user) {
  if (isDatabaseConnected()) {
    const userObjectId = mongoose.Types.ObjectId.isValid(user.id)
      ? new mongoose.Types.ObjectId(user.id)
      : user.id;

    const docs = await Property.find({
      $or: [
        { 'owner.userId': userObjectId },
        { 'owner.userId': user.id },
        { 'owner.email': user.email?.toLowerCase() },
      ],
    })
      .select('+owner +privateAddress +moderation')
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    return docs.map(serializeSellerOwnedProperty);
  }

  // In-memory fallback
  const list = [];
  for (const item of inMemorySubmissionStore.values()) {
    if (item.owner?.userId === user.id || item.owner?.email === user.email?.toLowerCase()) {
      list.push(serializeSellerOwnedProperty(item));
    }
  }

  list.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  return list;
}

