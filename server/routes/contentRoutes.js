import { Router } from 'express';
import {
  submitContact,
  getCompany,
  getServices,
  getFaqs,
  getLegal,
} from '../controllers/contentController.js';
import { contactLimiter } from '../middleware/rateLimiter.js';
import { csrfProvider, verifyCsrfToken } from '../middleware/csrf.js';

const router = Router();

// CSRF cookie provider for clients accessing public content/contact
router.use(csrfProvider);

// Public Content Endpoints
router.get('/company', getCompany);
router.get('/services', getServices);
router.get('/faqs', getFaqs);
router.get('/legal/:pageType', getLegal);

// Public Contact Form Submission (with rate limiting and double-submit CSRF verification)
router.post('/contact', contactLimiter, verifyCsrfToken, submitContact);

export default router;

