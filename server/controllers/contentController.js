import * as contentService from '../services/contentService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * 1. Submit Public Contact Form Message
 * POST /api/content/contact
 */
export async function submitContact(req, res, next) {
  try {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const result = await contentService.submitContactMessage(req.body, clientIp);
    return successResponse(
      res,
      result,
      'Your inquiry has been received. Our advisory team will contact you shortly.',
      201
    );
  } catch (error) {
    return next(error);
  }
}

/**
 * 2. Get Public Company Profile Information
 * GET /api/content/company
 */
export async function getCompany(req, res, next) {
  try {
    const data = await contentService.getCompanyContent();
    return successResponse(res, data, 'Company profile retrieved successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 3. Get Public Real Estate & Allied Services
 * GET /api/content/services
 */
export async function getServices(req, res, next) {
  try {
    const { category } = req.query;
    const services = await contentService.getServicesContent({ category, onlyActive: true });
    return successResponse(res, services, 'Services retrieved successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 4. Get Categorized FAQs
 * GET /api/content/faqs
 */
export async function getFaqs(req, res, next) {
  try {
    const { category, search } = req.query;
    const faqs = await contentService.getFaqsContent({ category, search });
    return successResponse(res, faqs, 'Frequently Asked Questions retrieved successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 5. Get Legal Page Draft
 * GET /api/content/legal/:pageType
 */
export async function getLegal(req, res, next) {
  try {
    const { pageType } = req.params;
    const legalDoc = await contentService.getLegalContent(pageType);
    return successResponse(res, legalDoc, 'Legal content retrieved successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 6. Admin: Get All Content Sections
 * GET /api/admin/content
 */
export async function getAdminContent(req, res, next) {
  try {
    const allContent = await contentService.getAllAdminContent();
    return successResponse(res, allContent, 'All content sections retrieved successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 7. Admin: Update Content Section
 * PUT /api/admin/content/:section
 */
export async function updateAdminContent(req, res, next) {
  try {
    const { section } = req.params;
    const updated = await contentService.updateContentSection(req.user, section, req.body);
    return successResponse(res, updated, `Content section "${section}" updated successfully`);
  } catch (error) {
    return next(error);
  }
}

/**
 * 8. Admin: List Contact Messages
 * GET /api/admin/content/messages
 */
export async function getAdminContactMessages(req, res, next) {
  try {
    const { page, limit, status, search } = req.query;
    const messages = await contentService.getContactMessages({ page, limit, status, search });
    return successResponse(res, messages, 'Contact messages retrieved successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 9. Admin: Update Contact Message Status / Notes
 * PATCH /api/admin/content/messages/:id
 */
export async function updateAdminContactMessage(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await contentService.updateContactMessageStatus(req.user, id, req.body);
    return successResponse(res, updated, 'Contact message updated successfully');
  } catch (error) {
    return next(error);
  }
}

