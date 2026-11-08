import mongoose from 'mongoose';
import Property from '../models/Property.js';
import User from '../models/User.js';
import Enquiry from '../models/Enquiry.js';
import SiteVisit from '../models/SiteVisit.js';
import AuditLog from '../models/AuditLog.js';
import { isDatabaseConnected } from '../config/database.js';
import {
  serializeAdminProperty,
  serializeAdminPropertyList,
  formatIndianPrice,
} from '../utils/serializers.js';
import { inMemorySubmissionStore } from './propertySubmissionService.js';
import { inMemoryEnquiries } from './enquiryService.js';
import { inMemorySiteVisits } from './siteVisitService.js';
import { demoPropertiesData } from '../data/demoPropertiesData.js';

// In-Memory Fallback Stores for Offline / Testing Mode
export const inMemoryAuditLogs = [];
export const inMemoryUsers = [
  {
    id: 'usr_admin_001',
    _id: 'usr_admin_001',
    fullName: 'MasterJi SuperAdmin',
    email: 'admin@masterjiestates.in',
    phone: '9876543210',
    role: 'admin',
    accountStatus: 'active',
    tokenVersion: 1,
    createdAt: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'usr_seller_001',
    _id: 'usr_seller_001',
    fullName: 'Rajesh Sharma',
    email: 'rajesh.sharma@example.com',
    phone: '9811122233',
    role: 'user',
    accountStatus: 'active',
    tokenVersion: 1,
    createdAt: new Date('2026-02-15').toISOString(),
  },
  {
    id: 'usr_buyer_001',
    _id: 'usr_buyer_001',
    fullName: 'Priya Verma',
    email: 'priya.verma@example.com',
    phone: '9822233344',
    role: 'user',
    accountStatus: 'active',
    tokenVersion: 1,
    createdAt: new Date('2026-03-10').toISOString(),
  },
];

/**
 * Append-only Administrative Audit Logging Helper
 */
export async function logAdminActivity(adminUser, {
  action,
  targetType,
  targetId,
  targetTitle = '',
  reason = '',
  metadata = {},
}) {
  const logEntry = {
    adminId: adminUser.id,
    adminEmail: adminUser.email || 'admin@masterjiestates.in',
    adminName: adminUser.fullName || 'Administrator',
    action,
    targetType,
    targetId: targetId.toString(),
    targetTitle,
    reason,
    metadata,
    createdAt: new Date(),
  };

  if (isDatabaseConnected()) {
    try {
      await AuditLog.create(logEntry);
    } catch (err) {
      console.error('[AuditLog] Failed to persist audit event to MongoDB:', err.message);
    }
  }

  // Always keep in memory buffer for fast access and fallback
  inMemoryAuditLogs.unshift({
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    ...logEntry,
    createdAt: logEntry.createdAt.toISOString(),
  });

  // Keep in-memory buffer bounded to 500 items
  if (inMemoryAuditLogs.length > 500) {
    inMemoryAuditLogs.pop();
  }
}

/**
 * 1. Admin Dashboard Overview Metrics
 */
export async function getAdminOverview() {
  const dbOnline = isDatabaseConnected();

  if (dbOnline) {
    const [
      totalProperties,
      pendingApprovals,
      publishedProperties,
      rejectedProperties,
      withdrawnProperties,
      totalUsers,
      totalEnquiries,
      upcomingSiteVisits,
      recentSubmissionsDocs,
      recentAuditDocs,
    ] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ availabilityStatus: 'pending_review' }),
      Property.countDocuments({ availabilityStatus: 'available' }),
      Property.countDocuments({ availabilityStatus: 'rejected' }),
      Property.countDocuments({ availabilityStatus: 'withdrawn' }),
      User.countDocuments(),
      Enquiry.countDocuments(),
      SiteVisit.countDocuments({
        preferredDate: { $gte: new Date() },
        status: { $in: ['requested', 'confirmed'] },
      }),
      Property.find({ availabilityStatus: 'pending_review' })
        .sort({ submittedAt: -1, createdAt: -1 })
        .limit(5)
        .select('+owner'),
      AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    return {
      databaseConnected: true,
      metrics: {
        totalProperties,
        pendingApprovals,
        publishedProperties,
        rejectedProperties,
        withdrawnProperties,
        totalUsers,
        totalEnquiries,
        upcomingSiteVisits,
      },
      recentSubmissions: serializeAdminPropertyList(recentSubmissionsDocs),
      recentActivities: recentAuditDocs.map((doc) => doc.toObject()),
    };
  }

  // Fallback metrics from in-memory stores and demo data
  const allInMemoryProps = [
    ...Array.from(inMemorySubmissionStore.values()),
    ...demoPropertiesData,
  ];

  const pendingSubmissions = allInMemoryProps.filter(
    (p) => p.availabilityStatus === 'pending_review'
  );
  const published = allInMemoryProps.filter((p) => p.availabilityStatus === 'available');
  const rejected = allInMemoryProps.filter((p) => p.availabilityStatus === 'rejected');
  const withdrawn = allInMemoryProps.filter((p) => p.availabilityStatus === 'withdrawn');

  const upcomingVisits = inMemorySiteVisits.filter(
    (v) => ['requested', 'confirmed'].includes(v.status)
  );

  return {
    databaseConnected: false,
    metrics: {
      totalProperties: allInMemoryProps.length,
      pendingApprovals: pendingSubmissions.length,
      publishedProperties: published.length,
      rejectedProperties: rejected.length,
      withdrawnProperties: withdrawn.length,
      totalUsers: inMemoryUsers.length,
      totalEnquiries: inMemoryEnquiries.length,
      upcomingSiteVisits: upcomingVisits.length,
    },
    recentSubmissions: serializeAdminPropertyList(pendingSubmissions.slice(0, 5)),
    recentActivities: inMemoryAuditLogs.slice(0, 10),
  };
}

/**
 * 2. Property Moderation Queue
 */
export async function getModerationQueue({
  page = 1,
  limit = 10,
  search = '',
  category = '',
  city = '',
  sortBy = 'newest',
} = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (p - 1) * l;

  if (isDatabaseConnected()) {
    const query = { availabilityStatus: 'pending_review' };

    if (category) query.category = category;
    if (city) query.city = new RegExp(`^${city}$`, 'i');

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { title: new RegExp(s, 'i') },
        { locality: new RegExp(s, 'i') },
        { 'owner.name': new RegExp(s, 'i') },
        { 'owner.email': new RegExp(s, 'i') },
        { demoId: s },
      ];
    }

    const sortOrder = sortBy === 'oldest' ? { submittedAt: 1, createdAt: 1 } : { submittedAt: -1, createdAt: -1 };

    const [total, docs] = await Promise.all([
      Property.countDocuments(query),
      Property.find(query)
        .sort(sortOrder)
        .skip(skip)
        .limit(l)
        .select('+owner +moderation +submissionNotes'),
    ]);

    return {
      items: serializeAdminPropertyList(docs),
      pagination: {
        page: p,
        limit: l,
        total,
        totalPages: Math.ceil(total / l) || 1,
      },
    };
  }

  // In-memory queue fallback
  let items = Array.from(inMemorySubmissionStore.values()).filter(
    (item) => item.availabilityStatus === 'pending_review'
  );

  if (category) {
    items = items.filter((item) => item.category === category);
  }
  if (city) {
    items = items.filter((item) => item.city?.toLowerCase() === city.toLowerCase());
  }
  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    items = items.filter(
      (item) =>
        item.title?.toLowerCase().includes(s) ||
        item.locality?.toLowerCase().includes(s) ||
        item.owner?.name?.toLowerCase().includes(s) ||
        item.owner?.email?.toLowerCase().includes(s)
    );
  }

  items.sort((a, b) => {
    const timeA = new Date(a.submittedAt || a.createdAt).getTime();
    const timeB = new Date(b.submittedAt || b.createdAt).getTime();
    return sortBy === 'oldest' ? timeA - timeB : timeB - timeA;
  });

  const total = items.length;
  const paginated = items.slice(skip, skip + l);

  return {
    items: serializeAdminPropertyList(paginated),
    pagination: {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l) || 1,
    },
  };
}

/**
 * 3. Retrieve Single Property for Admin Review
 */
export async function getAdminPropertyById(id) {
  if (isDatabaseConnected()) {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const filter = isObjectId ? { _id: id } : { $or: [{ slug: id }, { demoId: id }] };

    const property = await Property.findOne(filter).select(
      '+owner +moderation +acquisitionCost +acquisitionDate +internalNotes +privateAddress +submissionNotes'
    );

    if (property) {
      return serializeAdminProperty(property);
    }
  }

  // Fallback in memory
  const memoryDoc = inMemorySubmissionStore.get(id);
  if (memoryDoc) {
    return serializeAdminProperty(memoryDoc);
  }

  const demoMatch = demoPropertiesData.find((p) => p.id === id || p.demoId === id || p.slug === id);
  if (demoMatch) {
    return serializeAdminProperty(demoMatch);
  }

  return null;
}

/**
 * 4. Approve Property Listing (pending_review -> available)
 */
export async function approveProperty(adminUser, id, { notes = '' } = {}) {
  let property;

  if (isDatabaseConnected()) {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const filter = isObjectId ? { _id: id } : { $or: [{ slug: id }, { demoId: id }] };
    property = await Property.findOne(filter).select('+owner +moderation');
  } else {
    property =
      inMemorySubmissionStore.get(id) ||
      demoPropertiesData.find((p) => p.id === id || p.demoId === id || p.slug === id);
  }

  if (!property) {
    const error = new Error('Property listing not found.');
    error.statusCode = 404;
    throw error;
  }

  if (property.availabilityStatus !== 'pending_review') {
    const error = new Error(
      `Cannot approve listing in '${property.availabilityStatus}' status. Only listings in 'pending_review' are eligible for approval.`
    );
    error.statusCode = 400;
    throw error;
  }

  const reviewedAt = new Date();

  if (isDatabaseConnected()) {
    property.availabilityStatus = 'available';
    property.availabilityLabel = 'Available';
    property.isDraft = false;
    property.moderation = {
      status: 'approved',
      reviewedBy: adminUser.id,
      reviewedAt,
      internalAdminNotes: notes.trim(),
      rejectionReason: '',
      changeRequestRemarks: '',
    };
    await property.save();
  } else {
    property.availabilityStatus = 'available';
    property.availabilityLabel = 'Available';
    property.isDraft = false;
    property.moderation = {
      status: 'approved',
      reviewedBy: adminUser.id,
      reviewedAt,
      internalAdminNotes: notes.trim(),
      rejectionReason: '',
      changeRequestRemarks: '',
    };
    property.updatedAt = reviewedAt.toISOString();
    inMemorySubmissionStore.set(id, property);
  }

  // Record audit log
  await logAdminActivity(adminUser, {
    action: 'property_approved',
    targetType: 'property',
    targetId: property.id || id,
    targetTitle: property.title,
    metadata: { notes },
  });

  return serializeAdminProperty(property);
}

/**
 * 5. Reject Property Listing (pending_review -> rejected)
 */
export async function rejectProperty(adminUser, id, { reason = '', internalNotes = '' } = {}) {
  const cleanReason = (reason || '').trim();
  if (!cleanReason || cleanReason.length < 5) {
    const error = new Error('A clear rejection reason (at least 5 characters) is required.');
    error.statusCode = 400;
    throw error;
  }

  let property;
  if (isDatabaseConnected()) {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const filter = isObjectId ? { _id: id } : { $or: [{ slug: id }, { demoId: id }] };
    property = await Property.findOne(filter).select('+owner +moderation');
  } else {
    property =
      inMemorySubmissionStore.get(id) ||
      demoPropertiesData.find((p) => p.id === id || p.demoId === id || p.slug === id);
  }

  if (!property) {
    const error = new Error('Property listing not found.');
    error.statusCode = 404;
    throw error;
  }

  if (property.availabilityStatus !== 'pending_review') {
    const error = new Error(
      `Cannot reject listing in '${property.availabilityStatus}' status. Must be in 'pending_review'.`
    );
    error.statusCode = 400;
    throw error;
  }

  const reviewedAt = new Date();

  if (isDatabaseConnected()) {
    property.availabilityStatus = 'rejected';
    property.availabilityLabel = 'Rejected';
    property.isDraft = false;
    property.moderation = {
      status: 'rejected',
      reviewedBy: adminUser.id,
      reviewedAt,
      rejectionReason: cleanReason,
      internalAdminNotes: internalNotes.trim(),
      changeRequestRemarks: '',
    };
    await property.save();
  } else {
    property.availabilityStatus = 'rejected';
    property.availabilityLabel = 'Rejected';
    property.isDraft = false;
    property.moderation = {
      status: 'rejected',
      reviewedBy: adminUser.id,
      reviewedAt,
      rejectionReason: cleanReason,
      internalAdminNotes: internalNotes.trim(),
      changeRequestRemarks: '',
    };
    property.updatedAt = reviewedAt.toISOString();
    inMemorySubmissionStore.set(id, property);
  }

  // Record audit log
  await logAdminActivity(adminUser, {
    action: 'property_rejected',
    targetType: 'property',
    targetId: property.id || id,
    targetTitle: property.title,
    reason: cleanReason,
    metadata: { internalNotes },
  });

  return serializeAdminProperty(property);
}

/**
 * 6. Request Changes for Property Listing (pending_review -> changes_requested)
 */
export async function requestPropertyChanges(adminUser, id, { remarks = '', internalNotes = '' } = {}) {
  const cleanRemarks = (remarks || '').trim();
  if (!cleanRemarks || cleanRemarks.length < 5) {
    const error = new Error('Clear change request remarks (at least 5 characters) are required.');
    error.statusCode = 400;
    throw error;
  }

  let property;
  if (isDatabaseConnected()) {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const filter = isObjectId ? { _id: id } : { $or: [{ slug: id }, { demoId: id }] };
    property = await Property.findOne(filter).select('+owner +moderation');
  } else {
    property =
      inMemorySubmissionStore.get(id) ||
      demoPropertiesData.find((p) => p.id === id || p.demoId === id || p.slug === id);
  }

  if (!property) {
    const error = new Error('Property listing not found.');
    error.statusCode = 404;
    throw error;
  }

  if (property.availabilityStatus !== 'pending_review') {
    const error = new Error(
      `Cannot request changes for listing in '${property.availabilityStatus}' status. Must be in 'pending_review'.`
    );
    error.statusCode = 400;
    throw error;
  }

  const reviewedAt = new Date();

  if (isDatabaseConnected()) {
    property.availabilityStatus = 'changes_requested';
    property.availabilityLabel = 'Changes Requested';
    property.isDraft = true; // Allow seller to edit again
    property.moderation = {
      status: 'changes_requested',
      reviewedBy: adminUser.id,
      reviewedAt,
      changeRequestRemarks: cleanRemarks,
      internalAdminNotes: internalNotes.trim(),
      rejectionReason: '',
    };
    await property.save();
  } else {
    property.availabilityStatus = 'changes_requested';
    property.availabilityLabel = 'Changes Requested';
    property.isDraft = true;
    property.moderation = {
      status: 'changes_requested',
      reviewedBy: adminUser.id,
      reviewedAt,
      changeRequestRemarks: cleanRemarks,
      internalAdminNotes: internalNotes.trim(),
      rejectionReason: '',
    };
    property.updatedAt = reviewedAt.toISOString();
    inMemorySubmissionStore.set(id, property);
  }

  // Record audit log
  await logAdminActivity(adminUser, {
    action: 'property_changes_requested',
    targetType: 'property',
    targetId: property.id || id,
    targetTitle: property.title,
    reason: cleanRemarks,
    metadata: { internalNotes },
  });

  return serializeAdminProperty(property);
}

/**
 * 7. Admin Property Inventory Management (All Listings)
 */
export async function getAdminProperties({
  page = 1,
  limit = 10,
  search = '',
  status = '',
  category = '',
  listingType = '',
  sortBy = 'newest',
} = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (p - 1) * l;

  if (isDatabaseConnected()) {
    const query = {};
    if (status) query.availabilityStatus = status;
    if (category) query.category = category;
    if (listingType) query.listingType = listingType;

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { title: new RegExp(s, 'i') },
        { locality: new RegExp(s, 'i') },
        { city: new RegExp(s, 'i') },
        { demoId: s },
      ];
    }

    const sortOrder = sortBy === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

    const [total, docs] = await Promise.all([
      Property.countDocuments(query),
      Property.find(query)
        .sort(sortOrder)
        .skip(skip)
        .limit(l)
        .select('+owner +moderation +acquisitionCost +internalNotes +privateAddress'),
    ]);

    return {
      items: serializeAdminPropertyList(docs),
      pagination: {
        page: p,
        limit: l,
        total,
        totalPages: Math.ceil(total / l) || 1,
      },
    };
  }

  // Fallback combined list
  let all = [
    ...Array.from(inMemorySubmissionStore.values()),
    ...demoPropertiesData,
  ];

  if (status) all = all.filter((item) => item.availabilityStatus === status);
  if (category) all = all.filter((item) => item.category === category);
  if (listingType) all = all.filter((item) => item.listingType === listingType);
  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    all = all.filter(
      (item) =>
        item.title?.toLowerCase().includes(s) ||
        item.locality?.toLowerCase().includes(s) ||
        item.city?.toLowerCase().includes(s)
    );
  }

  all.sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return sortBy === 'oldest' ? timeA - timeB : timeB - timeA;
  });

  const total = all.length;
  const paginated = all.slice(skip, skip + l);

  return {
    items: serializeAdminPropertyList(paginated),
    pagination: {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l) || 1,
    },
  };
}

/**
 * 8. Update Property Availability Status
 */
export async function updatePropertyStatus(adminUser, id, { status, reason = '' } = {}) {
  const VALID_STATUSES = ['available', 'under_negotiation', 'sold', 'withdrawn'];
  if (!VALID_STATUSES.includes(status)) {
    const error = new Error(`Invalid target status. Must be one of [${VALID_STATUSES.join(', ')}].`);
    error.statusCode = 400;
    throw error;
  }

  let property;
  if (isDatabaseConnected()) {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const filter = isObjectId ? { _id: id } : { $or: [{ slug: id }, { demoId: id }] };
    property = await Property.findOne(filter).select('+owner +moderation');
  } else {
    property =
      inMemorySubmissionStore.get(id) ||
      demoPropertiesData.find((p) => p.id === id || p.demoId === id || p.slug === id);
  }

  if (!property) {
    const error = new Error('Property listing not found.');
    error.statusCode = 404;
    throw error;
  }

  const previousStatus = property.availabilityStatus;
  const STATUS_LABELS = {
    available: 'Available',
    under_negotiation: 'Under Negotiation',
    sold: 'Sold',
    withdrawn: 'Withdrawn',
  };

  property.availabilityStatus = status;
  property.availabilityLabel = STATUS_LABELS[status] || status;

  if (isDatabaseConnected()) {
    await property.save();
  } else {
    property.updatedAt = new Date().toISOString();
    inMemorySubmissionStore.set(id, property);
  }

  // Record audit log
  await logAdminActivity(adminUser, {
    action: 'property_status_changed',
    targetType: 'property',
    targetId: property.id || id,
    targetTitle: property.title,
    reason,
    metadata: { previousStatus, newStatus: status },
  });

  return serializeAdminProperty(property);
}

/**
 * 9. Create Company-Owned Property Record (Admin Only)
 */
export async function createCompanyProperty(adminUser, payload = {}) {
  const title = (payload.title || '').trim();
  if (!title || title.length < 5) {
    const error = new Error('Valid property title (min 5 characters) is required.');
    error.statusCode = 400;
    throw error;
  }

  const category = payload.category || 'apartment';
  const price = Number(payload.price) || 0;
  const area = Number(payload.area) || 0;
  const city = (payload.city || 'Gurugram').trim();
  const locality = (payload.locality || '').trim();

  if (!locality) {
    const error = new Error('Locality is required for property record.');
    error.statusCode = 400;
    throw error;
  }

  // Generate unique slug
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

  const companyDoc = {
    title,
    slug: uniqueSlug,
    description: (payload.description || 'Exclusive company-owned real estate asset curated by MasterJiEstates.').trim(),
    category,
    categoryLabel: category.replace(/_/g, ' ').toUpperCase(),
    listingType: 'company_owned',
    listingTypeLabel: 'MasterJi Direct',
    price,
    priceFormatted: price > 0 ? formatIndianPrice(price) : 'Price on Request',
    priceNegotiable: payload.priceNegotiable !== false,
    city,
    locality,
    state: payload.state || 'Haryana',
    pincode: payload.pincode || '',
    landmark: payload.landmark || '',
    addressDisplay: `${locality}, ${city}`,
    privateAddress: payload.privateAddress || '',
    area,
    areaUnit: payload.areaUnit || 'sqft',
    bedrooms: Number(payload.bedrooms) || 0,
    bathrooms: Number(payload.bathrooms) || 0,
    parking: Number(payload.parking) || 0,
    furnishing: payload.furnishing || 'Semi-Furnished',
    floor: payload.floor || '',
    facing: payload.facing || 'East',
    availabilityStatus: payload.availabilityStatus || 'available',
    availabilityLabel: 'Available',
    isDraft: false,
    featured: Boolean(payload.featured),
    imageUrl: payload.imageUrl || (payload.images && payload.images[0]) || '',
    images: Array.isArray(payload.images) ? payload.images : [],
    cloudinaryAssets: Array.isArray(payload.cloudinaryAssets) ? payload.cloudinaryAssets : [],
    amenities: Array.isArray(payload.amenities) ? payload.amenities : [],
    tagline: payload.tagline || 'MasterJi Direct Asset',
    // Private company fields
    acquisitionCost: Number(payload.acquisitionCost) || 0,
    acquisitionDate: payload.acquisitionDate ? new Date(payload.acquisitionDate) : new Date(),
    internalNotes: payload.internalNotes || '',
    owner: {
      name: 'MasterJiEstates Direct',
      email: 'acquisitions@masterjiestates.in',
      phone: '0124-400-MASTER',
    },
    isDemo: false,
  };

  let saved;
  if (isDatabaseConnected()) {
    saved = await Property.create(companyDoc);
  } else {
    const mockId = `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    saved = {
      ...companyDoc,
      id: mockId,
      _id: mockId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemorySubmissionStore.set(mockId, saved);
  }

  // Record audit log
  await logAdminActivity(adminUser, {
    action: 'company_property_created',
    targetType: 'property',
    targetId: saved.id || saved._id,
    targetTitle: saved.title,
    metadata: {
      acquisitionCost: saved.acquisitionCost,
      listingType: 'company_owned',
    },
  });

  return serializeAdminProperty(saved);
}

/**
 * 10. Update Company-Owned Property Record
 */
export async function updateCompanyProperty(adminUser, id, updateData = {}) {
  let property;

  if (isDatabaseConnected()) {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const filter = isObjectId ? { _id: id } : { $or: [{ slug: id }, { demoId: id }] };
    property = await Property.findOne(filter).select(
      '+acquisitionCost +acquisitionDate +internalNotes +privateAddress +owner'
    );
  } else {
    property =
      inMemorySubmissionStore.get(id) ||
      demoPropertiesData.find((p) => p.id === id || p.demoId === id || p.slug === id);
  }

  if (!property) {
    const error = new Error('Company property listing not found.');
    error.statusCode = 404;
    throw error;
  }

  if (property.listingType !== 'company_owned') {
    const error = new Error('This listing is not a company-owned asset.');
    error.statusCode = 400;
    throw error;
  }

  // Update fields
  if (updateData.title !== undefined) property.title = updateData.title.trim();
  if (updateData.description !== undefined) property.description = updateData.description.trim();
  if (updateData.price !== undefined) {
    property.price = Number(updateData.price) || 0;
    property.priceFormatted = formatIndianPrice(property.price);
  }
  if (updateData.acquisitionCost !== undefined) {
    property.acquisitionCost = Number(updateData.acquisitionCost) || 0;
  }
  if (updateData.acquisitionDate !== undefined) {
    property.acquisitionDate = updateData.acquisitionDate ? new Date(updateData.acquisitionDate) : null;
  }
  if (updateData.internalNotes !== undefined) {
    property.internalNotes = updateData.internalNotes.trim();
  }
  if (updateData.privateAddress !== undefined) {
    property.privateAddress = updateData.privateAddress.trim();
  }
  if (updateData.availabilityStatus !== undefined) {
    property.availabilityStatus = updateData.availabilityStatus;
  }
  if (updateData.featured !== undefined) {
    property.featured = Boolean(updateData.featured);
  }

  if (isDatabaseConnected()) {
    await property.save();
  } else {
    property.updatedAt = new Date().toISOString();
    inMemorySubmissionStore.set(id, property);
  }

  // Record audit log
  await logAdminActivity(adminUser, {
    action: 'company_property_updated',
    targetType: 'property',
    targetId: property.id || id,
    targetTitle: property.title,
    metadata: { updateKeys: Object.keys(updateData) },
  });

  return serializeAdminProperty(property);
}

/**
 * 11. User Management (List Users)
 */
export async function getAdminUsers({ page = 1, limit = 10, search = '', role = '', status = '' } = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (p - 1) * l;

  if (isDatabaseConnected()) {
    const query = {};
    if (role) query.role = role;
    if (status) query.accountStatus = status;

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { fullName: new RegExp(s, 'i') },
        { email: new RegExp(s, 'i') },
        { phone: new RegExp(s, 'i') },
      ];
    }

    const [total, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l)
        .select('fullName email phone role accountStatus createdAt isEmailVerified isPhoneVerified'),
    ]);

    // Attach property count for each user
    const usersWithCounts = await Promise.all(
      users.map(async (u) => {
        const count = await Property.countDocuments({ 'owner.userId': u._id });
        return {
          id: u._id.toString(),
          fullName: u.fullName,
          email: u.email,
          phone: u.phone,
          role: u.role,
          accountStatus: u.accountStatus,
          createdAt: u.createdAt,
          submittedPropertiesCount: count,
        };
      })
    );

    return {
      items: usersWithCounts,
      pagination: {
        page: p,
        limit: l,
        total,
        totalPages: Math.ceil(total / l) || 1,
      },
    };
  }

  // Fallback in-memory users
  let list = [...inMemoryUsers];
  if (role) list = list.filter((u) => u.role === role);
  if (status) list = list.filter((u) => u.accountStatus === status);
  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    list = list.filter(
      (u) =>
        u.fullName.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        u.phone.includes(s)
    );
  }

  const total = list.length;
  const paginated = list.slice(skip, skip + l).map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    role: u.role,
    accountStatus: u.accountStatus,
    createdAt: u.createdAt,
    submittedPropertiesCount: Array.from(inMemorySubmissionStore.values()).filter(
      (p) => p.owner?.userId === u.id
    ).length,
  }));

  return {
    items: paginated,
    pagination: {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l) || 1,
    },
  };
}

/**
 * 12. Update User Account Status (active / suspended)
 */
export async function updateUserAccountStatus(adminUser, targetUserId, { status, reason = '' } = {}) {
  if (!['active', 'suspended'].includes(status)) {
    const error = new Error("Invalid status. Allowed values are 'active' or 'suspended'.");
    error.statusCode = 400;
    throw error;
  }

  // Security Protection: Admin CANNOT suspend their own active session
  if (adminUser.id === targetUserId.toString()) {
    const error = new Error('Security policy violation: Administrators cannot suspend their own active account.');
    error.statusCode = 403;
    throw error;
  }

  let userDoc;

  if (isDatabaseConnected()) {
    userDoc = await User.findById(targetUserId).select('+accountStatus +tokenVersion');
    if (!userDoc) {
      const error = new Error('User account not found.');
      error.statusCode = 404;
      throw error;
    }

    userDoc.accountStatus = status;
    if (status === 'suspended') {
      userDoc.incrementTokenVersion(); // Invalidate all active JWT tokens instantly
    }
    await userDoc.save();
  } else {
    userDoc = inMemoryUsers.find((u) => u.id === targetUserId || u._id === targetUserId);
    if (!userDoc) {
      const error = new Error('User account not found.');
      error.statusCode = 404;
      throw error;
    }
    userDoc.accountStatus = status;
    if (status === 'suspended') {
      userDoc.tokenVersion = (userDoc.tokenVersion || 0) + 1;
    }
  }

  // Record audit log
  await logAdminActivity(adminUser, {
    action: 'user_status_changed',
    targetType: 'user',
    targetId: targetUserId.toString(),
    targetTitle: userDoc.fullName || userDoc.email,
    reason,
    metadata: { newStatus: status },
  });

  return {
    id: targetUserId,
    email: userDoc.email,
    fullName: userDoc.fullName,
    accountStatus: status,
  };
}

/**
 * 13. Admin Enquiry Inbox
 */
export async function getAdminEnquiries({ page = 1, limit = 10, search = '', status = '' } = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (p - 1) * l;

  if (isDatabaseConnected()) {
    const query = {};
    if (status) query.status = status;

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: new RegExp(s, 'i') },
        { email: new RegExp(s, 'i') },
        { phone: new RegExp(s, 'i') },
        { referenceCode: new RegExp(s, 'i') },
        { propertyTitle: new RegExp(s, 'i') },
      ];
    }

    const [total, docs] = await Promise.all([
      Enquiry.countDocuments(query),
      Enquiry.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l),
    ]);

    return {
      items: docs.map((d) => d.toObject()),
      pagination: {
        page: p,
        limit: l,
        total,
        totalPages: Math.ceil(total / l) || 1,
      },
    };
  }

  // Fallback in memory
  let list = [...inMemoryEnquiries];
  if (status) list = list.filter((e) => e.status === status);
  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    list = list.filter(
      (e) =>
        e.name?.toLowerCase().includes(s) ||
        e.email?.toLowerCase().includes(s) ||
        e.phone?.includes(s) ||
        e.referenceCode?.toLowerCase().includes(s) ||
        e.propertyTitle?.toLowerCase().includes(s)
    );
  }

  const total = list.length;
  const paginated = list.slice(skip, skip + l);

  return {
    items: paginated,
    pagination: {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l) || 1,
    },
  };
}

/**
 * 14. Update Enquiry Status & Internal Notes
 */
export async function updateAdminEnquiry(adminUser, id, { status, internalNotes = '' } = {}) {
  const VALID_STATUSES = ['new', 'contacted', 'follow_up', 'converted', 'closed'];
  if (status && !VALID_STATUSES.includes(status)) {
    const error = new Error(`Invalid enquiry status. Must be one of [${VALID_STATUSES.join(', ')}].`);
    error.statusCode = 400;
    throw error;
  }

  let enquiry;

  if (isDatabaseConnected()) {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const filter = isObjectId ? { _id: id } : { referenceCode: id };
    enquiry = await Enquiry.findOne(filter);
    if (!enquiry) {
      const error = new Error('Enquiry record not found.');
      error.statusCode = 404;
      throw error;
    }

    if (status) enquiry.status = status;
    if (internalNotes !== undefined) enquiry.internalNotes = internalNotes.trim();
    await enquiry.save();
  } else {
    enquiry = inMemoryEnquiries.find((e) => e.id === id || e.referenceCode === id);
    if (!enquiry) {
      const error = new Error('Enquiry record not found.');
      error.statusCode = 404;
      throw error;
    }

    if (status) enquiry.status = status;
    if (internalNotes !== undefined) enquiry.internalNotes = internalNotes.trim();
  }

  // Record audit log
  await logAdminActivity(adminUser, {
    action: 'enquiry_status_updated',
    targetType: 'enquiry',
    targetId: enquiry.referenceCode || id,
    targetTitle: `Enquiry from ${enquiry.name}`,
    metadata: { status, internalNotes },
  });

  return enquiry;
}

/**
 * 15. Admin Site Visits Calendar & Schedule
 */
export async function getAdminSiteVisits({ page = 1, limit = 10, status = '', date = '' } = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (p - 1) * l;

  if (isDatabaseConnected()) {
    const query = {};
    if (status) query.status = status;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.preferredDate = { $gte: start, $lte: end };
    }

    const [total, docs] = await Promise.all([
      SiteVisit.countDocuments(query),
      SiteVisit.find(query)
        .sort({ preferredDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(l),
    ]);

    return {
      items: docs.map((d) => d.toObject()),
      pagination: {
        page: p,
        limit: l,
        total,
        totalPages: Math.ceil(total / l) || 1,
      },
    };
  }

  // Fallback in memory
  let list = [...inMemorySiteVisits];
  if (status) list = list.filter((v) => v.status === status);

  const total = list.length;
  const paginated = list.slice(skip, skip + l);

  return {
    items: paginated,
    pagination: {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l) || 1,
    },
  };
}

/**
 * 16. Update Site Visit Status / Schedule
 */
export async function updateAdminSiteVisit(
  adminUser,
  id,
  { status, preferredDate, preferredTimeSlot, internalNotes = '', cancellationReason = '' } = {}
) {
  const VALID_STATUSES = ['requested', 'confirmed', 'completed', 'cancelled'];
  if (status && !VALID_STATUSES.includes(status)) {
    const error = new Error(`Invalid site visit status. Must be one of [${VALID_STATUSES.join(', ')}].`);
    error.statusCode = 400;
    throw error;
  }

  let visit;

  if (isDatabaseConnected()) {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const filter = isObjectId ? { _id: id } : { bookingReference: id };
    visit = await SiteVisit.findOne(filter);
    if (!visit) {
      const error = new Error('Site visit record not found.');
      error.statusCode = 404;
      throw error;
    }

    if (status) visit.status = status;
    if (preferredDate) visit.preferredDate = new Date(preferredDate);
    if (preferredTimeSlot) visit.preferredTimeSlot = preferredTimeSlot;
    if (internalNotes) visit.internalNotes = internalNotes.trim();
    if (cancellationReason) visit.cancellationReason = cancellationReason.trim();

    await visit.save();
  } else {
    visit = inMemorySiteVisits.find((v) => v.id === id || v.bookingReference === id);
    if (!visit) {
      const error = new Error('Site visit record not found.');
      error.statusCode = 404;
      throw error;
    }

    if (status) visit.status = status;
    if (preferredDate) visit.preferredDate = preferredDate;
    if (preferredTimeSlot) visit.preferredTimeSlot = preferredTimeSlot;
    if (internalNotes) visit.internalNotes = internalNotes.trim();
    if (cancellationReason) visit.cancellationReason = cancellationReason.trim();
  }

  // Record audit log
  await logAdminActivity(adminUser, {
    action: 'site_visit_status_updated',
    targetType: 'site_visit',
    targetId: visit.bookingReference || id,
    targetTitle: `Site visit for ${visit.propertyTitle || 'Property'}`,
    metadata: { status, internalNotes, cancellationReason },
  });

  return visit;
}

/**
 * 17. Retrieve Admin Activity Logs (Append-Only Audit Trail)
 */
export async function getAdminActivityLogs({ page = 1, limit = 20, action = '', targetType = '' } = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (p - 1) * l;

  if (isDatabaseConnected()) {
    const query = {};
    if (action) query.action = action;
    if (targetType) query.targetType = targetType;

    const [total, docs] = await Promise.all([
      AuditLog.countDocuments(query),
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l),
    ]);

    return {
      items: docs.map((d) => d.toObject()),
      pagination: {
        page: p,
        limit: l,
        total,
        totalPages: Math.ceil(total / l) || 1,
      },
    };
  }

  // Fallback from in-memory logs
  let list = [...inMemoryAuditLogs];
  if (action) list = list.filter((log) => log.action === action);
  if (targetType) list = list.filter((log) => log.targetType === targetType);

  const total = list.length;
  const paginated = list.slice(skip, skip + l);

  return {
    items: paginated,
    pagination: {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l) || 1,
    },
  };
}

