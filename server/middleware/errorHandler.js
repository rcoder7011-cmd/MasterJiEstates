// Central Error Handling Middleware
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle Mongoose schema validation errors
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = 'Validation failed. Please check the provided information.';
    errors = Object.keys(err.errors).map((key) => ({
      field: key,
      message: err.errors[key].message || `Invalid ${key}`,
    }));
  }

  // Handle Mongoose CastError (e.g., malformed ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field ${err.path}`;
    errors = [{ field: err.path, message: `Invalid identifier: ${err.value}` }];
  }

  // Log error details for server diagnostics
  console.error(
    `[API Error] ${req.method} ${req.originalUrl} - Status ${statusCode}:`,
    message,
    errors || err.message
  );

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};


