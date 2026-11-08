import { validateEnquiryInput } from '../validators/enquiryValidator.js';
import { createEnquiry } from '../services/enquiryService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Controller: Submit customer property enquiry.
 * POST /api/enquiries
 */
export async function submitEnquiry(req, res, next) {
  try {
    const validation = validateEnquiryInput(req.body);
    if (!validation.isValid) {
      return errorResponse(res, 'Validation failed for enquiry submission', 400, validation.errors);
    }

    const result = await createEnquiry({
      ...req.body,
      userId: req.user?.id || null,
    });

    return successResponse(
      res,
      result,
      'Your enquiry has been received successfully. A MasterJi property advisor will contact you within 24 hours.',
      201
    );
  } catch (error) {
    return next(error);
  }
}

