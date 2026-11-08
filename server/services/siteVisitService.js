import SiteVisit from '../models/SiteVisit.js';
import { isDatabaseConnected } from '../config/database.js';
import { getPropertyById } from './propertyService.js';
import { recordInMemorySiteVisit, inMemorySiteVisits } from './dashboardService.js';

export { inMemorySiteVisits };

/**
 * Generate a unique booking reference code for physical property tours.
 * E.g., VISIT-20261107-5821
 */
function generateVisitReference() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `VISIT-${dateStr}-${randomSuffix}`;
}

/**
 * Schedule a physical site visit request.
 *
 * @param {object} visitData
 * @returns {Promise<object>} Created site visit booking payload
 */
export async function createSiteVisit(visitData) {
  const { propertyId, name, email, phone, preferredDate, preferredTimeSlot, notes, userId } = visitData;

  // Resolve property title snapshot
  let propertyTitle = visitData.propertyTitle || '';
  if (!propertyTitle && propertyId) {
    const prop = await getPropertyById(propertyId);
    if (prop) {
      propertyTitle = prop.title;
    }
  }

  const bookingReference = generateVisitReference();
  const cleanPhone = phone.replace(/[\s-]/g, '');
  const parsedDate = new Date(preferredDate);

  if (isDatabaseConnected()) {
    const visitDoc = await SiteVisit.create({
      propertyId,
      propertyTitle,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanPhone,
      preferredDate: parsedDate,
      preferredTimeSlot: preferredTimeSlot.trim(),
      notes: notes ? notes.trim() : '',
      status: 'requested',
      bookingReference,
      userId: userId || null,
    });

    return {
      bookingReference: visitDoc.bookingReference,
      propertyId: visitDoc.propertyId,
      propertyTitle: visitDoc.propertyTitle,
      name: visitDoc.name,
      email: visitDoc.email,
      phone: visitDoc.phone,
      preferredDate: visitDoc.preferredDate,
      preferredTimeSlot: visitDoc.preferredTimeSlot,
      status: visitDoc.status,
      createdAt: visitDoc.createdAt,
    };
  }

  // Graceful fallback for offline / development demonstration mode
  console.warn(
    `[MasterJiEstates Visits] Database disconnected. Logged visit in memory: Ref=${bookingReference}, Property="${propertyTitle}", Contact=${name} (${cleanPhone}), Date=${preferredDate} [${preferredTimeSlot}]`
  );

  const mockRecord = {
    id: `vis_${Date.now()}`,
    bookingReference,
    propertyId,
    propertyTitle,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: cleanPhone,
    preferredDate: parsedDate.toISOString(),
    preferredTimeSlot: preferredTimeSlot.trim(),
    notes: notes ? notes.trim() : '',
    status: 'requested',
    createdAt: new Date().toISOString(),
    userId: userId || null,
    isDemoRecorded: true,
  };

  recordInMemorySiteVisit(mockRecord);
  return mockRecord;
}

