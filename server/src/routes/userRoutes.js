import express from "express";
import * as userController from "../controllers/userController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  validateUpdateProfile,
  validateUpdateLocation,
  validateObjectId,
} from "../middleware/validation.js";

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

/**
 * GET /api/users/me
 * Get current user profile
 */
router.get("/me", userController.getProfile);

/**
 * PUT /api/users/me
 * Update current user profile
 */
router.put("/me", validateUpdateProfile, userController.updateProfile);

/**
 * PUT /api/users/me/location
 * Update user location (geolocation)
 */
router.put(
  "/me/location",
  validateUpdateLocation,
  userController.updateLocation
);

/**
 * GET /api/users/nearby
 * Find users nearby
 */
router.get("/nearby", userController.getNearbyUsers);

/**
 * GET /api/users/search
 * Search users
 */
router.get("/search", userController.searchUsers);

/**
 * GET /api/users/:id
 * Get user by ID (public profile)
 */
router.get("/:id", validateObjectId("id"), userController.getUserById);

/**
 * GET /api/users/:id/stats
 * Get user statistics
 */
router.get("/:id/stats", validateObjectId("id"), userController.getUserStats);

/**
 * POST /api/users/:id/block
 * Block user (admin only)
 */
router.post(
  "/:id/block",
  validateObjectId("id"),
  authorize("super_admin", "college_admin"),
  userController.blockUser
);

/**
 * POST /api/users/:id/unblock
 * Unblock user (admin only)
 */
router.post(
  "/:id/unblock",
  validateObjectId("id"),
  authorize("super_admin", "college_admin"),
  userController.unblockUser
);

export default router;
