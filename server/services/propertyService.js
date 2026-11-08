import mongoose from 'mongoose';
import Property from '../models/Property.js';
import { isDatabaseConnected } from '../config/database.js';
import { demoPropertiesData } from '../data/demoPropertiesData.js';
import { serializePublicProperty, serializePublicPropertyList } from '../utils/serializers.js';
import { inMemorySubmissionStore } from './propertySubmissionService.js';

/**
 * Filter in-memory demo dataset when database operates in disconnected mode.
 * Includes demo properties and any approved in-memory submissions.
 */
function filterInMemoryProperties(params) {
  const approvedMemorySubmissions = Array.from(inMemorySubmissionStore.values()).filter(
    (p) => !p.isDraft && ['available', 'under_negotiation', 'sold'].includes(p.availabilityStatus)
  );
  let list = [...demoPropertiesData, ...approvedMemorySubmissions];

  // City filter
  if (params.city && params.city !== 'all' && params.city !== 'All Cities') {
    list = list.filter((p) => p.city.toLowerCase() === params.city.toLowerCase());
  }

  // Locality filter
  if (params.locality) {
    const term = params.locality.toLowerCase();
    list = list.filter(
      (p) =>
        p.locality.toLowerCase().includes(term) ||
        (p.addressDisplay && p.addressDisplay.toLowerCase().includes(term))
    );
  }

  // Search term
  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.locality.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        (p.tagline && p.tagline.toLowerCase().includes(q))
    );
  }

  // Category
  if (params.category && params.category !== 'all') {
    list = list.filter((p) => p.category === params.category);
  }

  // Listing type
  if (params.listingType && params.listingType !== 'all') {
    list = list.filter((p) => p.listingType === params.listingType);
  }

  // Status
  if (params.status && params.status !== 'all') {
    list = list.filter((p) => p.availabilityStatus === params.status);
  }

  // Price range
  if (params.minPrice !== null && params.minPrice !== undefined) {
    list = list.filter((p) => p.price >= params.minPrice);
  }
  if (params.maxPrice !== null && params.maxPrice !== undefined) {
    list = list.filter((p) => p.price <= params.maxPrice);
  }

  // Area range
  if (params.minArea !== null && params.minArea !== undefined) {
    list = list.filter((p) => p.area >= params.minArea);
  }
  if (params.maxArea !== null && params.maxArea !== undefined) {
    list = list.filter((p) => p.area <= params.maxArea);
  }

  // Bedrooms
  if (params.bedrooms && params.bedrooms !== 'all') {
    if (params.bedrooms === '4+') {
      list = list.filter((p) => p.bedrooms >= 4);
    } else {
      const b = parseInt(params.bedrooms, 10);
      list = list.filter((p) => p.bedrooms === b);
    }
  }

  // Featured
  if (params.featured === true) {
    list = list.filter((p) => p.featured === true);
  }

  // Sorting
  switch (params.sort) {
    case 'price_asc':
      list.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      list.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
      list.reverse();
      break;
    case 'recommended':
    default:
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      break;
  }

  const total = list.length;
  const page = params.page || 1;
  const limit = params.limit || 12;
  const startIndex = (page - 1) * limit;
  const paginated = list.slice(startIndex, startIndex + limit);

  return {
    properties: serializePublicPropertyList(paginated),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasMore: startIndex + limit < total,
      source: 'memory_fallback',
      isDatabaseConnected: false,
    },
  };
}

/**
 * Service to fetch paginated, filtered, and sorted properties.
 */
export async function listProperties(params) {
  if (!isDatabaseConnected()) {
    return filterInMemoryProperties(params);
  }

  const query = {};

  // City filter
  if (params.city && params.city !== 'all') {
    query.city = new RegExp(`^${params.city.trim()}$`, 'i');
  }

  // Locality filter
  if (params.locality) {
    query.locality = new RegExp(params.locality.trim(), 'i');
  }

  // Property category
  if (params.category && params.category !== 'all') {
    query.category = params.category.trim();
  }

  // Listing type
  if (params.listingType && params.listingType !== 'all') {
    query.listingType = params.listingType.trim();
  }

  // Public Status Enforcement: Drafts and Pending Review are NEVER exposed to public catalogue
  const publicStatuses = ['available', 'under_negotiation', 'sold'];
  if (params.status && params.status !== 'all' && publicStatuses.includes(params.status.trim())) {
    query.availabilityStatus = params.status.trim();
  } else {
    query.availabilityStatus = { $in: publicStatuses };
  }
  query.isDraft = { $ne: true };

  // Price range
  if (params.minPrice !== null && params.minPrice !== undefined) {
    query.price = { ...(query.price || {}), $gte: params.minPrice };
  }
  if (params.maxPrice !== null && params.maxPrice !== undefined) {
    query.price = { ...(query.price || {}), $lte: params.maxPrice };
  }

  // Area range
  if (params.minArea !== null && params.minArea !== undefined) {
    query.area = { ...(query.area || {}), $gte: params.minArea };
  }
  if (params.maxArea !== null && params.maxArea !== undefined) {
    query.area = { ...(query.area || {}), $lte: params.maxArea };
  }

  // Bedrooms
  if (params.bedrooms && params.bedrooms !== 'all') {
    if (params.bedrooms === '4+') {
      query.bedrooms = { $gte: 4 };
    } else {
      const b = parseInt(params.bedrooms, 10);
      if (!isNaN(b)) query.bedrooms = b;
    }
  }

  // Featured flag
  if (params.featured === true) {
    query.featured = true;
  }

  // Search keyword (text index or regex fallback)
  if (params.search) {
    const s = params.search.trim();
    query.$or = [
      { title: new RegExp(s, 'i') },
      { locality: new RegExp(s, 'i') },
      { city: new RegExp(s, 'i') },
      { tagline: new RegExp(s, 'i') },
    ];
  }

  // Sorting
  let sortCriteria = { featured: -1, createdAt: -1 };
  if (params.sort === 'price_asc') {
    sortCriteria = { price: 1 };
  } else if (params.sort === 'price_desc') {
    sortCriteria = { price: -1 };
  } else if (params.sort === 'newest') {
    sortCriteria = { createdAt: -1 };
  }

  const page = params.page || 1;
  const limit = params.limit || 12;
  const skip = (page - 1) * limit;

  const [total, docs] = await Promise.all([
    Property.countDocuments(query),
    Property.find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  // If DB returns empty but demo records exist and no specific search was run, fallback to in-memory
  if (total === 0 && !params.search && !params.city && !params.category) {
    return filterInMemoryProperties(params);
  }

  return {
    properties: serializePublicPropertyList(docs),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasMore: skip + limit < total,
      source: 'mongodb',
      isDatabaseConnected: true,
    },
  };
}

/**
 * Fetch a single property by its identifier (MongoDB _id or demoId).
 * Hides drafts and pending review listings unless explicitly allowed (for owner/admin).
 */
export async function getPropertyById(id, { allowPrivate = false } = {}) {
  if (!id) return null;

  const HIDDEN_STATUSES = ['draft', 'pending_review', 'changes_requested', 'rejected', 'withdrawn'];

  if (isDatabaseConnected()) {
    let doc = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      doc = await Property.findById(id).lean();
    }
    if (!doc) {
      doc = await Property.findOne({ $or: [{ demoId: id }, { slug: id }] }).lean();
    }
    if (doc) {
      if (!allowPrivate && HIDDEN_STATUSES.includes(doc.availabilityStatus)) {
        return null;
      }
      return serializePublicProperty(doc);
    }
  }

  // Check in-memory submissions / company inventory first
  const memoryDoc = inMemorySubmissionStore.get(id);
  if (memoryDoc) {
    if (!allowPrivate && HIDDEN_STATUSES.includes(memoryDoc.availabilityStatus)) {
      return null;
    }
    return serializePublicProperty(memoryDoc);
  }

  // Fallback to in-memory demo records
  const demo = demoPropertiesData.find((p) => p.id === id || p.demoId === id || p.slug === id);
  if (demo) {
    if (!allowPrivate && HIDDEN_STATUSES.includes(demo.availabilityStatus)) {
      return null;
    }
    return serializePublicProperty(demo);
  }

  return null;
}

/**
 * Fetch a single property by its unique SEO slug.
 * Hides drafts and pending review listings unless explicitly allowed.
 */
export async function getPropertyBySlug(slug, { allowPrivate = false } = {}) {
  if (!slug) return null;

  const HIDDEN_STATUSES = ['draft', 'pending_review', 'changes_requested', 'rejected', 'withdrawn'];

  if (isDatabaseConnected()) {
    const doc = await Property.findOne({ slug: slug.toLowerCase() }).lean();
    if (doc) {
      if (!allowPrivate && HIDDEN_STATUSES.includes(doc.availabilityStatus)) {
        return null;
      }
      return serializePublicProperty(doc);
    }
  }

  // Check in-memory submissions / company inventory
  for (const item of inMemorySubmissionStore.values()) {
    if (item.slug && item.slug.toLowerCase() === slug.toLowerCase()) {
      if (!allowPrivate && HIDDEN_STATUSES.includes(item.availabilityStatus)) {
        return null;
      }
      return serializePublicProperty(item);
    }
  }

  const demo = demoPropertiesData.find((p) => p.slug && p.slug.toLowerCase() === slug.toLowerCase());
  if (demo) {
    if (!allowPrivate && HIDDEN_STATUSES.includes(demo.availabilityStatus)) {
      return null;
    }
    return serializePublicProperty(demo);
  }

  return null;
}

