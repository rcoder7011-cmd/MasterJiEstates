import Enquiry from '../models/Enquiry.js';
import { isDatabaseConnected } from '../config/database.js';
import { getPropertyById } from './propertyService.js';
import { recordInMemoryEnquiry, inMemoryEnquiries } from './dashboardService.js';

export { inMemoryEnquiries };

/**
 * Generate a unique, professional reference code for an enquiry.
 * E.g., ENQ-20261107-7429
 */
function generateEnquiryReference() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ENQ-${dateStr}-${randomSuffix}`;
}

/**
 * Create a new customer enquiry record.
 *
 * @param {object} enquiryData
 * @returns {Promise<object>} Created enquiry confirmation payload
 */
export async function createEnquiry(enquiryData) {
  const { propertyId, name, email, phone, message, userId } = enquiryData;

  // Resolve property title for record snapshot
  let propertyTitle = enquiryData.propertyTitle || '';
  if (!propertyTitle && propertyId) {
    const prop = await getPropertyById(propertyId);
    if (prop) {
      propertyTitle = prop.title;
    }
  }

  const referenceCode = generateEnquiryReference();
  const cleanPhone = phone.replace(/[\s-]/g, '');

  if (isDatabaseConnected()) {
    const enquiryDoc = await Enquiry.create({
      propertyId,
      propertyTitle,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanPhone,
      message: message.trim(),
      status: 'new',
      referenceCode,
      userId: userId || null,
    });

    return {
      referenceCode: enquiryDoc.referenceCode,
      propertyId: enquiryDoc.propertyId,
      propertyTitle: enquiryDoc.propertyTitle,
      name: enquiryDoc.name,
      email: enquiryDoc.email,
      phone: enquiryDoc.phone,
      status: enquiryDoc.status,
      createdAt: enquiryDoc.createdAt,
    };
  }

  // Graceful fallback for offline / development demonstration mode
  console.warn(
    `[MasterJiEstates CRM] Database disconnected. Logged enquiry in memory: Ref=${referenceCode}, Property="${propertyTitle}", Contact=${name} (${cleanPhone})`
  );

  const mockRecord = {
    id: `enq_${Date.now()}`,
    referenceCode,
    propertyId,
    propertyTitle,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: cleanPhone,
    message: message.trim(),
    status: 'new',
    createdAt: new Date().toISOString(),
    userId: userId || null,
    isDemoRecorded: true,
  };

  recordInMemoryEnquiry(mockRecord);
  return mockRecord;
}

