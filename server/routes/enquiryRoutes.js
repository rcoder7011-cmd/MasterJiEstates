import { Router } from 'express';
import { submitEnquiry } from '../controllers/enquiryController.js';
import { optionalAuthenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/enquiries (supports guest or authenticated user)
router.post('/', optionalAuthenticate, submitEnquiry);

export default router;

