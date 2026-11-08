import { Router } from 'express';
import {
  getOverview,
  getModerationQueue,
  getModerationProperty,
  approveProperty,
  rejectProperty,
  requestPropertyChanges,
  getProperties,
  getPropertyById,
  updatePropertyStatus,
  createCompanyProperty,
  updateCompanyProperty,
  getUsers,
  updateUserStatus,
  getEnquiries,
  updateEnquiry,
  getSiteVisits,
  updateSiteVisit,
  getActivityLogs,
} from '../controllers/adminController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { csrfProvider, verifyCsrfToken } from '../middleware/csrf.js';

const router = Router();

// CSRF cookie provider for admin callers
router.use(csrfProvider);

// STRICT SECURITY: All admin routes require authenticated session with 'admin' role
router.use(authenticate);
router.use(authorizeRoles('admin'));

// 1. Dashboard Overview
router.get('/overview', getOverview);

// 2. Moderation Queue & Approval Workflow
router.get('/moderation', getModerationQueue);
router.get('/moderation/:id', getModerationProperty);
router.post('/moderation/:id/approve', verifyCsrfToken, approveProperty);
router.post('/moderation/:id/reject', verifyCsrfToken, rejectProperty);
router.post('/moderation/:id/request-changes', verifyCsrfToken, requestPropertyChanges);

// 3. Property Management (All Listings)
router.get('/properties', getProperties);
router.get('/properties/:id', getPropertyById);
router.patch('/properties/:id/status', verifyCsrfToken, updatePropertyStatus);

// 4. Company-Owned Property Management (Admin Only)
router.post('/properties/company', verifyCsrfToken, createCompanyProperty);
router.patch('/properties/company/:id', verifyCsrfToken, updateCompanyProperty);

// 5. User Directory & Account Management
router.get('/users', getUsers);
router.patch('/users/:id/status', verifyCsrfToken, updateUserStatus);

// 6. Enquiries Management (CRM)
router.get('/enquiries', getEnquiries);
router.patch('/enquiries/:id', verifyCsrfToken, updateEnquiry);

// 7. Site Visits Schedule & Dispatch
router.get('/site-visits', getSiteVisits);
router.patch('/site-visits/:id', verifyCsrfToken, updateSiteVisit);

// 8. Administrative Activity Logs (Append-Only Audit Trail)
router.get('/activity-logs', getActivityLogs);

export default router;

