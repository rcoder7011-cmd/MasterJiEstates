import { Router } from 'express';
import {
  getProperties,
  getPropertyById,
  getPropertyBySlug,
} from '../controllers/propertyController.js';

const router = Router();

// GET /api/properties
router.get('/', getProperties);

// GET /api/properties/slug/:slug (placed before :id or handled cleanly)
router.get('/slug/:slug', getPropertyBySlug);

// GET /api/properties/:id
router.get('/:id', getPropertyById);

export default router;

