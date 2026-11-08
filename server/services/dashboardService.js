import mongoose from 'mongoose';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Enquiry from '../models/Enquiry.js';
import SiteVisit from '../models/SiteVisit.js';
import { isDatabaseConnected } from '../config/database.js';
import { getPropertyById } from './propertyService.js';
import { serializePublicPropertyList, serializePublicProperty } from '../utils/serializers.js';
import { inMemorySubmissionStore } from './propertySubmissionService.js';

// In-memory fallback state for mock / offline demonstration mode
export const inMemoryStore = {
  favourites: new Map(), // userId -> Set of propertyIds
  recentlyViewed: new Map(), // userId -> Array of { propertyId, viewedAt }
  enquiries: [
    {
      id: 'enq_sample_001',
      referenceCode: 'ENQ-20261107-1001',
      propertyId: 'prop-1',
      propertyTitle: '4 BHK Luxury Penthouse in DLF Phase 5',
      name: 'Vikram Malhotra',
      email: 'vikram.m@example.com',
      phone: '9812345678',
      message: 'Interested in scheduling an in-person walkthrough this weekend.',
      status: 'new',
      internalNotes: '',
      createdAt: new Date('2026-11-06T10:00:00Z').toISOString(),
      userId: null,
    },
    {
      id: 'enq_sample_002',
      referenceCode: 'ENQ-20261107-1002',
      propertyId: 'prop-2',
      propertyTitle: '3 BHK High-Rise Apartment in Golf Course Ext Rd',
      name: 'Ananya Gupta',
      email: 'ananya.g@example.com',
      phone: '9876501234',
      message: 'Is the price negotiable for immediate registry?',
      status: 'contacted',
      internalNotes: 'Client called on Nov 6; interested in high floor units.',
      createdAt: new Date('2026-11-05T14:30:00Z').toISOString(),
      userId: null,
    },
  ], // Array of enquiry objects
  siteVisits: [
    {
      id: 'visit_sample_001',
      bookingReference: 'VISIT-20261107-2001',
      propertyId: 'prop-1',
      propertyTitle: '4 BHK Luxury Penthouse in DLF Phase 5',
      name: 'Rohan Mehra',
      email: 'rohan.m@example.com',
      phone: '9811199988',
      preferredDate: new Date('2026-11-10T11:00:00Z').toISOString(),
      preferredTimeSlot: '11:00 AM - 01:00 PM',
      notes: 'Please arrange building access pass.',
      status: 'requested',
      internalNotes: '',
      createdAt: new Date('2026-11-06T12:00:00Z').toISOString(),
      userId: null,
    },
    {
      id: 'visit_sample_002',
      bookingReference: 'VISIT-20261107-2002',
      propertyId: 'prop-3',
      propertyTitle: 'Ultra-Luxury Independent Villa in Sector 48',
      name: 'Sunita Rao',
      email: 'sunita.rao@example.com',
      phone: '9822211100',
      preferredDate: new Date('2026-11-12T15:00:00Z').toISOString(),
      preferredTimeSlot: '03:00 PM - 05:00 PM',
      notes: 'Family visit with architect.',
      status: 'confirmed',
      internalNotes: 'Confirmed with building security for VIP pass.',
      createdAt: new Date('2026-11-05T09:00:00Z').toISOString(),
      userId: null,
    },
  ], // Array of site visit objects
  userListings: new Map(), // userId -> Array of property objects
  userProfiles: new Map(), // userId -> { fullName, phone }
};

export const inMemoryEnquiries = inMemoryStore.enquiries;
export const inMemorySiteVisits = inMemoryStore.siteVisits;

/**
 * Record an enquiry in memory when database operates offline.
 */
export function recordInMemoryEnquiry(enquiry) {
  inMemoryStore.enquiries.unshift(enquiry);
}

/**
 * Record a site visit in memory when database operates offline.
 */
export function recordInMemorySiteVisit(visit) {
  inMemoryStore.siteVisits.unshift(visit);
}

/**
 * Helper to get property summary snippet for enquiry and site visit cards.
 */
async function getPropertySnippet(propertyId) {
  if (!propertyId) return null;
  const prop = await getPropertyById(propertyId);
  if (!prop) return null;
  return {
    id: prop.id,
    title: prop.title,
    slug: prop.slug,
    imageUrl: prop.imageUrl || (prop.images && prop.images[0]) || '',
    city: prop.city,
    locality: prop.locality,
    priceFormatted: prop.priceFormatted,
    categoryLabel: prop.categoryLabel,
    availabilityStatus: prop.availabilityStatus,
    availabilityLabel: prop.availabilityLabel,
  };
}

/**
 * 1. Fetch dashboard overview metrics and genuine recent activity.
 */
export async function getUserOverview(userId, userEmail) {
  const normalizedEmail = (userEmail || '').trim().toLowerCase();

  if (isDatabaseConnected()) {
    // Parallel counts for high efficiency
    const [enquiriesCount, visitsCount, userDoc, listingsCount, recentEnquiries, recentVisits] =
      await Promise.all([
        Enquiry.countDocuments({
          $or: [{ userId }, { email: normalizedEmail }],
        }),
        SiteVisit.countDocuments({
          $or: [{ userId }, { email: normalizedEmail }],
          status: { $in: ['requested', 'confirmed'] },
          preferredDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        }),
        User.findById(userId).select('favourites recentlyViewed'),
        Property.countDocuments({
          $or: [{ 'owner.userId': userId }, { 'owner.email': normalizedEmail }],
        }),
        Enquiry.find({
          $or: [{ userId }, { email: normalizedEmail }],
        })
          .sort({ createdAt: -1 })
          .limit(3)
          .lean(),
        SiteVisit.find({
          $or: [{ userId }, { email: normalizedEmail }],
        })
          .sort({ createdAt: -1 })
          .limit(3)
          .lean(),
      ]);

    const savedPropertiesCount = userDoc?.favourites?.length || 0;
    const recentlyViewedCount = userDoc?.recentlyViewed?.length || 0;

    // Build genuine recent activity list
    const activities = [];

    recentEnquiries.forEach((enq) => {
      activities.push({
        id: `act_enq_${enq._id}`,
        type: 'enquiry',
        title: `Enquiry submitted for "${enq.propertyTitle || 'Property'}"`,
        subtitle: `Ref: ${enq.referenceCode} • Status: ${enq.status.toUpperCase()}`,
        timestamp: enq.createdAt,
        link: `/properties/${enq.propertyId}`,
      });
    });

    recentVisits.forEach((vis) => {
      activities.push({
        id: `act_vis_${vis._id}`,
        type: 'site_visit',
        title: `Site visit requested for "${vis.propertyTitle || 'Property'}"`,
        subtitle: `Ref: ${vis.bookingReference} • Status: ${vis.status.toUpperCase()}`,
        timestamp: vis.createdAt,
        link: `/properties/${vis.propertyId}`,
      });
    });

    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      metrics: {
        totalEnquiries: enquiriesCount,
        upcomingSiteVisits: visitsCount,
        savedProperties: savedPropertiesCount,
        myListings: listingsCount,
        recentlyViewedCount,
      },
      recentActivity: activities.slice(0, 5),
    };
  }

  // Fallback dev mode mock metrics
  const favs = inMemoryStore.favourites.get(userId) || new Set();
  const rViewed = inMemoryStore.recentlyViewed.get(userId) || [];
  const userEnqs = inMemoryStore.enquiries.filter(
    (e) => e.userId === userId || (e.email && e.email.toLowerCase() === normalizedEmail)
  );
  const userVisits = inMemoryStore.siteVisits.filter(
    (v) => v.userId === userId || (v.email && v.email.toLowerCase() === normalizedEmail)
  );
  let userListings = inMemoryStore.userListings.get(userId) || [];
  for (const item of inMemorySubmissionStore.values()) {
    if (item.owner?.userId === userId || item.owner?.email?.toLowerCase() === normalizedEmail) {
      if (!userListings.some((p) => p.id === item.id)) {
        userListings = [...userListings, item];
      }
    }
  }

  const activities = [];
  userEnqs.slice(-3).forEach((e) => {
    activities.push({
      id: `act_${e.referenceCode}`,
      type: 'enquiry',
      title: `Enquiry for "${e.propertyTitle || 'Property'}"`,
      subtitle: `Ref: ${e.referenceCode}`,
      timestamp: e.createdAt,
      link: `/properties/${e.propertyId}`,
    });
  });

  return {
    metrics: {
      totalEnquiries: userEnqs.length,
      upcomingSiteVisits: userVisits.length,
      savedProperties: favs.size,
      myListings: userListings.length,
      recentlyViewedCount: rViewed.length,
    },
    recentActivity: activities,
  };
}

/**
 * 2. Fetch authenticated user's enquiries.
 */
export async function getUserEnquiries(userId, userEmail, { status = 'all' } = {}) {
  const normalizedEmail = (userEmail || '').trim().toLowerCase();

  if (isDatabaseConnected()) {
    const filter = {
      $or: [{ userId }, { email: normalizedEmail }],
    };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const docs = await Enquiry.find(filter)
      .select('-assignedTo -internalNotes') // Strictly strip internal fields
      .sort({ createdAt: -1 })
      .lean();

    // Enrich with safe property snippet
    const enriched = await Promise.all(
      docs.map(async (doc) => {
        const property = await getPropertySnippet(doc.propertyId);
        return {
          id: doc._id.toString(),
          referenceCode: doc.referenceCode,
          propertyId: doc.propertyId,
          propertyTitle: doc.propertyTitle || property?.title || 'Property',
          name: doc.name,
          email: doc.email,
          phone: doc.phone,
          message: doc.message,
          status: doc.status,
          createdAt: doc.createdAt,
          property,
        };
      })
    );

    return enriched;
  }

  // Fallback in-memory
  let list = inMemoryStore.enquiries.filter(
    (e) => e.userId === userId || (e.email && e.email.toLowerCase() === normalizedEmail)
  );
  if (status && status !== 'all') {
    list = list.filter((e) => e.status === status);
  }

  return Promise.all(
    list.map(async (doc) => ({
      ...doc,
      property: await getPropertySnippet(doc.propertyId),
    }))
  );
}

/**
 * 3. Fetch authenticated user's site visits.
 */
export async function getUserSiteVisits(userId, userEmail, { status = 'all' } = {}) {
  const normalizedEmail = (userEmail || '').trim().toLowerCase();

  if (isDatabaseConnected()) {
    const filter = {
      $or: [{ userId }, { email: normalizedEmail }],
    };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const docs = await SiteVisit.find(filter)
      .select('-assignedStaffId') // Strictly strip internal assignments
      .sort({ preferredDate: -1, createdAt: -1 })
      .lean();

    const now = new Date();
    const enriched = await Promise.all(
      docs.map(async (doc) => {
        const property = await getPropertySnippet(doc.propertyId);
        const visitDate = new Date(doc.preferredDate);
        return {
          id: doc._id.toString(),
          bookingReference: doc.bookingReference,
          propertyId: doc.propertyId,
          propertyTitle: doc.propertyTitle || property?.title || 'Property',
          name: doc.name,
          email: doc.email,
          phone: doc.phone,
          preferredDate: doc.preferredDate,
          preferredTimeSlot: doc.preferredTimeSlot,
          notes: doc.notes || '',
          status: doc.status,
          isUpcoming: visitDate >= now && ['requested', 'confirmed'].includes(doc.status),
          createdAt: doc.createdAt,
          property,
        };
      })
    );

    return enriched;
  }

  // In-memory fallback
  let list = inMemoryStore.siteVisits.filter(
    (v) => v.userId === userId || (v.email && v.email.toLowerCase() === normalizedEmail)
  );
  if (status && status !== 'all') {
    list = list.filter((v) => v.status === status);
  }

  const now = new Date();
  return Promise.all(
    list.map(async (doc) => {
      const property = await getPropertySnippet(doc.propertyId);
      const visitDate = new Date(doc.preferredDate);
      return {
        ...doc,
        isUpcoming: visitDate >= now && ['requested', 'confirmed'].includes(doc.status),
        property,
      };
    })
  );
}

/**
 * 4. Cancel a site visit belonging to the user.
 */
export async function cancelUserSiteVisit(userId, userEmail, visitIdentifier) {
  const normalizedEmail = (userEmail || '').trim().toLowerCase();

  if (isDatabaseConnected()) {
    const isId = mongoose.Types.ObjectId.isValid(visitIdentifier);
    const filter = {
      $and: [
        isId ? { _id: visitIdentifier } : { bookingReference: visitIdentifier },
        { $or: [{ userId }, { email: normalizedEmail }] },
      ],
    };

    const visit = await SiteVisit.findOne(filter);
    if (!visit) {
      const err = new Error('Site visit not found or unauthorized to modify.');
      err.statusCode = 404;
      throw err;
    }

    if (visit.status === 'completed') {
      const err = new Error('Completed site visits cannot be cancelled.');
      err.statusCode = 400;
      throw err;
    }

    if (visit.status === 'cancelled') {
      return { success: true, message: 'Site visit is already cancelled.', visit };
    }

    visit.status = 'cancelled';
    await visit.save();

    return {
      success: true,
      message: 'Site visit request has been successfully cancelled.',
      bookingReference: visit.bookingReference,
      status: 'cancelled',
    };
  }

  // Fallback in-memory
  const visit = inMemoryStore.siteVisits.find(
    (v) =>
      (v.id === visitIdentifier || v.bookingReference === visitIdentifier) &&
      (v.userId === userId || (v.email && v.email.toLowerCase() === normalizedEmail))
  );

  if (!visit) {
    const err = new Error('Site visit not found or unauthorized to modify.');
    err.statusCode = 404;
    throw err;
  }

  visit.status = 'cancelled';
  return {
    success: true,
    message: 'Site visit request has been successfully cancelled.',
    bookingReference: visit.bookingReference,
    status: 'cancelled',
  };
}

/**
 * 5. Fetch authenticated user's saved/favourite properties.
 */
export async function getUserFavourites(userId) {
  let favouriteIds = [];

  if (isDatabaseConnected()) {
    const user = await User.findById(userId).select('favourites');
    favouriteIds = user?.favourites || [];
  } else {
    const set = inMemoryStore.favourites.get(userId) || new Set();
    favouriteIds = Array.from(set);
  }

  if (favouriteIds.length === 0) {
    return [];
  }

  // Look up properties and filter out missing or unpublished
  const propertyPromises = favouriteIds.map((id) => getPropertyById(id));
  const properties = await Promise.all(propertyPromises);

  // Return non-null, serialized public properties
  return properties.filter(Boolean);
}

/**
 * 6. Add a property to user's saved/favourites.
 */
export async function addFavourite(userId, propertyId) {
  if (!propertyId || typeof propertyId !== 'string') {
    const err = new Error('Valid property identifier is required.');
    err.statusCode = 400;
    throw err;
  }

  // Verify property exists
  const property = await getPropertyById(propertyId.trim());
  if (!property) {
    const err = new Error('Property listing does not exist.');
    err.statusCode = 404;
    throw err;
  }

  const resolvedId = property.id; // Either demoId or stringified ObjectId

  if (isDatabaseConnected()) {
    const user = await User.findById(userId).select('favourites');
    if (!user) {
      const err = new Error('User account not found.');
      err.statusCode = 404;
      throw err;
    }

    if (user.favourites.length >= 100) {
      const err = new Error('Saved properties limit reached (maximum 100 properties).');
      err.statusCode = 400;
      throw err;
    }

    if (!user.favourites.includes(resolvedId)) {
      user.favourites.push(resolvedId);
      await user.save();
    }

    return {
      success: true,
      message: 'Property added to your saved collection.',
      favourites: user.favourites,
      propertyId: resolvedId,
    };
  }

  // In-memory fallback
  if (!inMemoryStore.favourites.has(userId)) {
    inMemoryStore.favourites.set(userId, new Set());
  }
  const set = inMemoryStore.favourites.get(userId);
  set.add(resolvedId);

  return {
    success: true,
    message: 'Property added to your saved collection.',
    favourites: Array.from(set),
    propertyId: resolvedId,
  };
}

/**
 * 7. Remove a property from user's saved/favourites.
 */
export async function removeFavourite(userId, propertyId) {
  if (!propertyId) {
    const err = new Error('Property identifier is required.');
    err.statusCode = 400;
    throw err;
  }

  const cleanId = propertyId.trim();

  if (isDatabaseConnected()) {
    const user = await User.findById(userId).select('favourites');
    if (!user) {
      const err = new Error('User account not found.');
      err.statusCode = 404;
      throw err;
    }

    user.favourites = user.favourites.filter(
      (id) => id !== cleanId && id.toLowerCase() !== cleanId.toLowerCase()
    );
    await user.save();

    return {
      success: true,
      message: 'Property removed from saved collection.',
      favourites: user.favourites,
    };
  }

  // In-memory fallback
  if (inMemoryStore.favourites.has(userId)) {
    const set = inMemoryStore.favourites.get(userId);
    set.delete(cleanId);
  }

  return {
    success: true,
    message: 'Property removed from saved collection.',
    favourites: Array.from(inMemoryStore.favourites.get(userId) || []),
  };
}

/**
 * 8. Fetch authenticated user's recently viewed properties.
 */
export async function getUserRecentlyViewed(userId) {
  let records = [];

  if (isDatabaseConnected()) {
    const user = await User.findById(userId).select('recentlyViewed');
    records = user?.recentlyViewed || [];
  } else {
    records = inMemoryStore.recentlyViewed.get(userId) || [];
  }

  if (records.length === 0) {
    return [];
  }

  // Sorted newest first
  records.sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt));

  // Resolve property data safely
  const resolved = await Promise.all(
    records.slice(0, 20).map(async (item) => {
      const prop = await getPropertyById(item.propertyId);
      if (!prop) return null;
      return {
        property: prop,
        viewedAt: item.viewedAt,
      };
    })
  );

  return resolved.filter(Boolean);
}

/**
 * 9. Record a property view for authenticated user.
 */
export async function recordRecentlyViewed(userId, propertyId) {
  if (!propertyId || typeof propertyId !== 'string') return null;

  const prop = await getPropertyById(propertyId.trim());
  if (!prop) return null;

  const targetId = prop.id;

  if (isDatabaseConnected()) {
    const user = await User.findById(userId).select('recentlyViewed');
    if (!user) return null;

    // Filter out previous view of the same property
    const filtered = (user.recentlyViewed || []).filter(
      (item) => item.propertyId !== targetId
    );

    // Unshift newest view and limit to 20
    filtered.unshift({ propertyId: targetId, viewedAt: new Date() });
    user.recentlyViewed = filtered.slice(0, 20);
    await user.save();

    return { success: true };
  }

  // In-memory fallback
  if (!inMemoryStore.recentlyViewed.has(userId)) {
    inMemoryStore.recentlyViewed.set(userId, []);
  }
  const list = inMemoryStore.recentlyViewed.get(userId);
  const updated = list.filter((i) => i.propertyId !== targetId);
  updated.unshift({ propertyId: targetId, viewedAt: new Date() });
  inMemoryStore.recentlyViewed.set(userId, updated.slice(0, 20));

  return { success: true };
}

/**
 * 10. Fetch properties submitted by authenticated user (Seller section).
 */
export async function getUserListings(userId, userEmail) {
  const normalizedEmail = (userEmail || '').trim().toLowerCase();

  if (isDatabaseConnected()) {
    const docs = await Property.find({
      $or: [{ 'owner.userId': userId }, { 'owner.email': normalizedEmail }],
    })
      .select('-privateAddress -acquisitionCost -internalNotes') // Strictly omit back-office financials
      .sort({ createdAt: -1 })
      .lean();

    return serializePublicPropertyList(docs);
  }

  // In-memory fallback
  const list = [...(inMemoryStore.userListings.get(userId) || [])];
  for (const item of inMemorySubmissionStore.values()) {
    if (item.owner?.userId === userId || item.owner?.email?.toLowerCase() === normalizedEmail) {
      if (!list.some((p) => p.id === item.id)) {
        list.push(item);
      }
    }
  }
  return serializePublicPropertyList(list);
}

/**
 * 11. Update user profile fields (fullName, phone).
 * Strictly rejects any role or security level escalation.
 */
export async function updateUserProfile(userId, { fullName, phone }) {
  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    const err = new Error('Full name must be at least 2 characters long.');
    err.statusCode = 400;
    throw err;
  }

  if (fullName.trim().length > 100) {
    const err = new Error('Full name cannot exceed 100 characters.');
    err.statusCode = 400;
    throw err;
  }

  const cleanPhone = (phone || '').replace(/[\s-]/g, '');
  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    const err = new Error('Please enter a valid 10-digit Indian mobile number.');
    err.statusCode = 400;
    throw err;
  }

  if (isDatabaseConnected()) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User account not found.');
      err.statusCode = 404;
      throw err;
    }

    user.fullName = fullName.trim();
    user.phone = cleanPhone;
    await user.save();

    return user.toSafeObject();
  }

  // In-memory fallback
  const profile = {
    id: userId,
    fullName: fullName.trim(),
    phone: cleanPhone,
    updatedAt: new Date().toISOString(),
  };
  inMemoryStore.userProfiles.set(userId, profile);
  return profile;
}
