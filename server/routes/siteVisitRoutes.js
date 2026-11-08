import { Router } from 'express';
import { scheduleSiteVisit } from '../controllers/siteVisitController.js';
import { optionalAuthenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/site-visits (supports guest or authenticated user)
router.post('/', optionalAuthenticate, scheduleSiteVisit);

export default router;

