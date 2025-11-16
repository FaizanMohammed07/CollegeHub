import express from "express";
import * as registrationController from "../controllers/registrationController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateObjectId } from "../middleware/validation.js";

const router = express.Router();

// All registration routes require authentication
router.use(authenticate);

// Current user's registrations
router.get("/me", registrationController.getMyRegistrations);

/**
 * GET /api/registrations
 * Get user's registrations or event registrations (with query params)
 */
router.get("/", registrationController.getRegistrations);

/**
 * PATCH /api/registrations/:id/status
 * Update registration status (admin only)
 */
router.patch(
  "/:id/status",
  validateObjectId("id"),
  authorize("club_admin", "college_admin", "super_admin"),
  registrationController.updateRegistrationStatus
);

/**
 * POST /api/registrations/:id/cancel
 * Cancel registration
 */
router.post(
  "/:id/cancel",
  validateObjectId("id"),
  registrationController.cancelRegistration
);

/**
 * POST /api/registrations/:id/request-eta
 * Request ETA computation
 */
router.post(
  "/:id/request-eta",
  validateObjectId("id"),
  registrationController.requestETA
);

/**
 * POST /api/registrations/:id/qr-token
 * Generate QR code token for check-in
 */
router.post(
  "/:id/qr-token",
  validateObjectId("id"),
  authorize("club_admin", "college_admin", "super_admin"),
  registrationController.generateQRToken
);

export default router;
