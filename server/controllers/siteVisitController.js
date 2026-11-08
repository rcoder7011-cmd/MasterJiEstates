import { validateSiteVisitInput } from '../validators/siteVisitValidator.js';
import { createSiteVisit } from '../services/siteVisitService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Controller: Schedule an escorted physical site visit.
 * POST /api/site-visits
 */
export async function scheduleSiteVisit(req, res, next) {
  try {
    const validation = validateSiteVisitInput(req.body);
    if (!validation.isValid) {
      return errorResponse(
        res,
        'Validation failed for site visit scheduling',
        400,
        validation.errors
      );
    }

    const result = await createSiteVisit({
      ...req.body,
      userId: req.user?.id || null,
    });

    return successResponse(
      res,
      result,
      'Your site visit request has been scheduled successfully. Our field advisor will coordinate entry and escort.',
      201
    );
  } catch (error) {
    return next(error);
  }
}

