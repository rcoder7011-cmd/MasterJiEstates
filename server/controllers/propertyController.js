import { sanitizePropertyQuery } from '../validators/propertyValidator.js';
import {
  listProperties,
  getPropertyById as fetchPropertyById,
  getPropertyBySlug as fetchPropertyBySlug,
} from '../services/propertyService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Controller: Get paginated, filtered, and sorted properties catalogue.
 * GET /api/properties
 */
export async function getProperties(req, res, next) {
  try {
    const cleanParams = sanitizePropertyQuery(req.query);
    const result = await listProperties(cleanParams);

    return successResponse(
      res,
      result.properties,
      'Properties retrieved successfully',
      200,
      result.meta
    );
  } catch (error) {
    return next(error);
  }
}

/**
 * Controller: Get single property by ID or demoId.
 * GET /api/properties/:id
 */
export async function getPropertyById(req, res, next) {
  try {
    const { id } = req.params;
    const property = await fetchPropertyById(id);

    if (!property) {
      return errorResponse(res, `Property not found with identifier "${id}"`, 404);
    }

    return successResponse(res, property, 'Property retrieved successfully', 200);
  } catch (error) {
    return next(error);
  }
}

/**
 * Controller: Get single property by canonical slug.
 * GET /api/properties/slug/:slug
 */
export async function getPropertyBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const property = await fetchPropertyBySlug(slug);

    if (!property) {
      return errorResponse(res, `Property not found with slug "${slug}"`, 404);
    }

    return successResponse(res, property, 'Property retrieved successfully', 200);
  } catch (error) {
    return next(error);
  }
}

