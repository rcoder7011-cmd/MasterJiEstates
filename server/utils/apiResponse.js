/**
 * Standardized API success response envelope.
 *
 * @param {import('express').Response} res
 * @param {*} data - Payload data
 * @param {string} [message='Success'] - Human-readable success message
 * @param {number} [statusCode=200] - HTTP status code
 * @param {object} [meta=null] - Optional metadata (e.g., pagination)
 */
export function successResponse(res, data, message = 'Success', statusCode = 200, meta = null) {
  const payload = {
    success: true,
    statusCode,
    message,
    data,
  };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
}

/**
 * Standardized API error response envelope.
 *
 * @param {import('express').Response} res
 * @param {string} [message='Internal Server Error'] - Human-readable error message
 * @param {number} [statusCode=500] - HTTP status code
 * @param {*} [errors=null] - Validation error details or list
 */
export function errorResponse(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
  const payload = {
    success: false,
    statusCode,
    message,
  };

  if (errors) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
}

