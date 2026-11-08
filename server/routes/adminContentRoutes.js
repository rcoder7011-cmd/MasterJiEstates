import { Router } from 'express';
import {
  getAdminContent,
  updateAdminContent,
  getAdminContactMessages,
  updateAdminContactMessage,
} from '../controllers/contentController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { csrfProvider, verifyCsrfToken } from '../middleware/csrf.js';

const router = Router();

// CSRF cookie provider
router.use(csrfProvider);

// STRICT ACCESS CONTROL: Only authorized administrators
router.use(authenticate);
router.use(authorizeRoles('admin'));

// Content Management
router.get('/', getAdminContent);
router.put('/:section', verifyCsrfToken, updateAdminContent);

// Contact Messages Inbox
router.get('/messages', getAdminContactMessages);
router.patch('/messages/:id', verifyCsrfToken, updateAdminContactMessage);

export default router;

