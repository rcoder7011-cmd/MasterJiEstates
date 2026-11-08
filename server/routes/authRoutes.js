import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  getCsrf,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { csrfProvider, verifyCsrfToken } from '../middleware/csrf.js';
import {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
} from '../middleware/rateLimiter.js';

const router = Router();

// Apply CSRF provider so all auth routes have access to / issue CSRF cookies
router.use(csrfProvider);

// GET /api/auth/csrf — Provide CSRF token to client
router.get('/csrf', getCsrf);

// POST /api/auth/register — Create a unified user account
router.post('/register', registerLimiter, verifyCsrfToken, register);

// POST /api/auth/login — Authenticate user and issue HTTP-only cookie
router.post('/login', loginLimiter, verifyCsrfToken, login);

// POST /api/auth/logout — Terminate authenticated session
router.post('/logout', authenticate, verifyCsrfToken, logout);

// GET /api/auth/me — Return current authenticated user
router.get('/me', authenticate, getMe);

// PATCH /api/auth/change-password — Update password and invalidate other sessions
router.patch('/change-password', authenticate, verifyCsrfToken, changePassword);

// POST /api/auth/forgot-password — Request password reset
router.post('/forgot-password', passwordResetLimiter, verifyCsrfToken, forgotPassword);

// POST /api/auth/reset-password — Reset password using valid token
router.post('/reset-password', passwordResetLimiter, verifyCsrfToken, resetPassword);

export default router;

