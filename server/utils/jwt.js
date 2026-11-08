import jwt from 'jsonwebtoken';

const DEFAULT_SECRET = 'masterjiestates_dev_jwt_secret_must_be_set_in_production';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('Fatal Security Error: JWT_SECRET must be configured in production environment.');
  }
  return secret || DEFAULT_SECRET;
}

/**
 * Generate a signed JSON Web Token containing minimal identity claims.
 *
 * @param {object} user - User document or user info
 * @param {boolean} [rememberMe=false] - Whether to extend token validity to 7 days
 * @returns {string} Signed JWT
 */
export function generateToken(user, rememberMe = false) {
  const secret = getJwtSecret();
  const userId = user._id ? user._id.toString() : user.id;

  const payload = {
    id: userId,
    role: user.role || 'user',
    tokenVersion: user.tokenVersion ?? 0,
  };

  const expiresIn = rememberMe ? '7d' : '24h';

  return jwt.sign(payload, secret, {
    expiresIn,
    issuer: 'MasterJiEstates API',
    audience: 'MasterJiEstates Web Client',
  });
}

/**
 * Verify and decode an authentication token.
 *
 * @param {string} token
 * @returns {object} Decoded JWT payload
 */
export function verifyToken(token) {
  const secret = getJwtSecret();
  return jwt.verify(token, secret, {
    issuer: 'MasterJiEstates API',
    audience: 'MasterJiEstates Web Client',
  });
}

