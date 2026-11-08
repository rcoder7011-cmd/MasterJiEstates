import rateLimit from 'express-rate-limit';

/**
 * Standard JSON payload when rate limit is exceeded.
 */
function createRateLimitHandler(message) {
  return (req, res) => {
    res.status(429).json({
      success: false,
      statusCode: 429,
      message,
      errors: [
        {
          field: 'rateLimit',
          message: 'Too many requests from this IP address. Please wait before trying again.',
        },
      ],
    });
  };
}

/**
 * Login Rate Limiter: Max 10 attempts per 15 minutes per IP.
 * Mitigates online credential stuffing and brute force attacks.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    'Too many login attempts. Your IP has been temporarily throttled for 15 minutes for account security.'
  ),
  skip: () => process.env.NODE_ENV === 'test', // Skip in automated tests
});

/**
 * Registration Rate Limiter: Max 5 accounts created per hour per IP.
 * Prevents automated account generation bots.
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    'Too many accounts created from this IP address. Please try again after 1 hour.'
  ),
  skip: () => process.env.NODE_ENV === 'test',
});

/**
 * Password Reset Rate Limiter: Max 5 requests per hour per IP.
 * Prevents email flooding and enumeration abuse.
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    'Too many password reset requests. Please check your email or wait 1 hour.'
  ),
  skip: () => process.env.NODE_ENV === 'test',
});

/**
 * Contact Submission Rate Limiter: Max 10 messages per 15 minutes per IP.
 * Mitigates spam flooding on the public contact form.
 */
export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    'Too many contact messages submitted from this IP address. Please wait a few minutes before sending another inquiry.'
  ),
  skip: () => process.env.NODE_ENV === 'test',
});


