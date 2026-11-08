import { successResponse, errorResponse } from '../utils/apiResponse.js';
import * as adminService from '../services/adminService.js';

/**
 * 1. Admin Dashboard Overview
 * GET /api/admin/overview
 */
export async function getOverview(req, res, next) {
  try {
    const data = await adminService.getAdminOverview();
    return successResponse(res, data, 'Admin overview metrics retrieved successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 2. Moderation Queue
 * GET /api/admin/moderation
 */
export async function getModerationQueue(req, res, next) {
  try {
    const data = await adminService.getModerationQueue(req.query);
    return successResponse(res, data, 'Moderation queue retrieved successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 3. Single Property for Moderation Inspection
 * GET /api/admin/moderation/:id
 */
export async function getModerationProperty(req, res, next) {
  try {
    const property = await adminService.getAdminPropertyById(req.params.id);
    if (!property) {
      return errorResponse(res, 'Property listing not found.', 404);
    }
    return successResponse(res, property, 'Property details retrieved for moderation');
  } catch (error) {
    return next(error);
  }
}

/**
 * 4. Approve Property
 * POST /api/admin/moderation/:id/approve
 */
export async function approveProperty(req, res, next) {
  try {
    const approved = await adminService.approveProperty(req.user, req.params.id, req.body);
    return successResponse(
      res,
      approved,
      `Property "${approved.title}" has been approved and is now active on the public catalogue.`
    );
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    return next(error);
  }
}

/**
 * 5. Reject Property
 * POST /api/admin/moderation/:id/reject
 */
export async function rejectProperty(req, res, next) {
  try {
    const { reason, internalNotes } = req.body;
    const rejected = await adminService.rejectProperty(req.user, req.params.id, {
      reason,
      internalNotes,
    });
    return successResponse(
      res,
      rejected,
      `Property "${rejected.title}" has been rejected. Feedback recorded for the seller.`
    );
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    return next(error);
  }
}

/**
 * 6. Request Changes for Property
 * POST /api/admin/moderation/:id/request-changes
 */
export async function requestPropertyChanges(req, res, next) {
  try {
    const { remarks, internalNotes } = req.body;
    const updated = await adminService.requestPropertyChanges(req.user, req.params.id, {
      remarks,
      internalNotes,
    });
    return successResponse(
      res,
      updated,
      `Change request sent for "${updated.title}". Seller can now revise and resubmit.`
    );
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    return next(error);
  }
}

/**
 * 7. All Properties Inventory Management
 * GET /api/admin/properties
 */
export async function getProperties(req, res, next) {
  try {
    const data = await adminService.getAdminProperties(req.query);
    return successResponse(res, data, 'Properties retrieved successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 8. Property Details (Admin Inspection)
 * GET /api/admin/properties/:id
 */
export async function getPropertyById(req, res, next) {
  try {
    const property = await adminService.getAdminPropertyById(req.params.id);
    if (!property) {
      return errorResponse(res, 'Property listing not found.', 404);
    }
    return successResponse(res, property, 'Property details retrieved');
  } catch (error) {
    return next(error);
  }
}

/**
 * 9. Update Property Availability Status
 * PATCH /api/admin/properties/:id/status
 */
export async function updatePropertyStatus(req, res, next) {
  try {
    const { status, reason } = req.body;
    const updated = await adminService.updatePropertyStatus(req.user, req.params.id, {
      status,
      reason,
    });
    return successResponse(
      res,
      updated,
      `Property status successfully transitioned to "${updated.availabilityStatus}".`
    );
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    return next(error);
  }
}

/**
 * 10. Create Company-Owned Property
 * POST /api/admin/properties/company
 */
export async function createCompanyProperty(req, res, next) {
  try {
    const property = await adminService.createCompanyProperty(req.user, req.body);
    return successResponse(
      res,
      property,
      `Company-owned property "${property.title}" onboarded successfully.`,
      201
    );
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    return next(error);
  }
}

/**
 * 11. Update Company-Owned Property
 * PATCH /api/admin/properties/company/:id
 */
export async function updateCompanyProperty(req, res, next) {
  try {
    const updated = await adminService.updateCompanyProperty(req.user, req.params.id, req.body);
    return successResponse(res, updated, `Company property "${updated.title}" updated successfully.`);
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    return next(error);
  }
}

/**
 * 12. User Directory
 * GET /api/admin/users
 */
export async function getUsers(req, res, next) {
  try {
    const data = await adminService.getAdminUsers(req.query);
    return successResponse(res, data, 'User directory retrieved successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 13. Update User Account Status (active / suspended)
 * PATCH /api/admin/users/:id/status
 */
export async function updateUserStatus(req, res, next) {
  try {
    const { status, reason } = req.body;
    const updated = await adminService.updateUserAccountStatus(req.user, req.params.id, {
      status,
      reason,
    });
    return successResponse(
      res,
      updated,
      `User account status updated to "${updated.accountStatus}".`
    );
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    return next(error);
  }
}

/**
 * 14. Enquiries Inbox
 * GET /api/admin/enquiries
 */
export async function getEnquiries(req, res, next) {
  try {
    const data = await adminService.getAdminEnquiries(req.query);
    return successResponse(res, data, 'Enquiries retrieved successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 15. Update Enquiry Status & Notes
 * PATCH /api/admin/enquiries/:id
 */
export async function updateEnquiry(req, res, next) {
  try {
    const { status, internalNotes } = req.body;
    const updated = await adminService.updateAdminEnquiry(req.user, req.params.id, {
      status,
      internalNotes,
    });
    return successResponse(res, updated, 'Enquiry updated successfully');
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    return next(error);
  }
}

/**
 * 16. Site Visits Calendar
 * GET /api/admin/site-visits
 */
export async function getSiteVisits(req, res, next) {
  try {
    const data = await adminService.getAdminSiteVisits(req.query);
    return successResponse(res, data, 'Site visits retrieved successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * 17. Update Site Visit Status / Schedule
 * PATCH /api/admin/site-visits/:id
 */
export async function updateSiteVisit(req, res, next) {
  try {
    const updated = await adminService.updateAdminSiteVisit(req.user, req.params.id, req.body);
    return successResponse(res, updated, 'Site visit updated successfully');
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    return next(error);
  }
}

/**
 * 18. Audit Activity Logs
 * GET /api/admin/activity-logs
 */
export async function getActivityLogs(req, res, next) {
  try {
    const data = await adminService.getAdminActivityLogs(req.query);
    return successResponse(res, data, 'Audit activity logs retrieved successfully');
  } catch (error) {
    return next(error);
  }
}

