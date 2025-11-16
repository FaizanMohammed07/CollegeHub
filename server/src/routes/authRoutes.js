import express from "express";
import * as authController from "../controllers/authController.js";
import {
  validateSignup,
  validateLogin,
  validateResetPassword,
} from "../middleware/validation.js";
import { authenticate } from "../middleware/auth.js";
import { createRateLimiter } from "../middleware/security.js";

const router = express.Router();

// Rate limiting for auth endpoints
const loginRateLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW_MS || 900000),
  parseInt(process.env.RATE_LIMIT_LOGIN_MAX_ATTEMPTS || 5)
);

const registerRateLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_REGISTER_WINDOW_MS || 3600000),
  parseInt(process.env.RATE_LIMIT_REGISTER_MAX_ATTEMPTS || 3)
);

/**
 * POST /api/auth/signup
 * Create new user account
 */
router.post(
  "/signup",
  registerRateLimiter,
  validateSignup,
  authController.signup
);

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post("/login", loginRateLimiter, validateLogin, authController.login);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post("/refresh", authController.refresh);

/**
 * POST /api/auth/logout
 * Logout and revoke refresh token
 */
router.post("/logout", authenticate, authController.logout);

/**
 * POST /api/auth/forgot-password
 * Request password reset email
 */
router.post("/forgot-password", authController.forgotPassword);

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post(
  "/reset-password",
  validateResetPassword,
  authController.resetPassword
);

/**
 * POST /api/auth/request-verification
 * Request email verification
 */
router.post(
  "/request-verification",
  authenticate,
  authController.requestEmailVerification
);

/**
 * POST /api/auth/verify-email
 * Verify email with token
 */
router.post("/verify-email", authController.verifyEmail);

export default router;
