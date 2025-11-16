import express from "express";
import * as clubController from "../controllers/clubController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  validateCreateClub,
  validateObjectId,
} from "../middleware/validation.js";

const router = express.Router();

// All club routes require authentication
router.use(authenticate);

/**
 * POST /api/clubs - Create new club
 * GET /api/clubs - List all clubs with pagination and filtering
 */
router.post(
  "/",
  authorize("club_admin", "college_admin", "super_admin"),
  validateCreateClub,
  clubController.createClub
);

router.get("/", clubController.listClubs);

/**
 * GET /api/clubs/search
 * Search clubs (must come before /:id route)
 */
router.get("/search", clubController.searchClubs);

/**
 * GET /api/clubs/college/:collegeId
 * Get clubs for a college (must come before /:id route)
 */
router.get(
  "/college/:collegeId",
  validateObjectId("collegeId"),
  clubController.getCollegeClubs
);

/**
 * GET /api/clubs/:id
 * Get club details
 */
router.get("/:id", validateObjectId("id"), clubController.getClub);

/**
 * PUT /api/clubs/:id
 * Update club (admin only)
 */
router.put("/:id", validateObjectId("id"), clubController.updateClub);

/**
 * POST /api/clubs/:id/join
 * Join club as member
 */
router.post("/:id/join", validateObjectId("id"), clubController.joinClub);

/**
 * POST /api/clubs/:id/leave
 * Leave club
 */
router.post("/:id/leave", validateObjectId("id"), clubController.leaveClub);

/**
 * GET /api/clubs/:id/members
 * Get club members
 */
router.get(
  "/:id/members",
  validateObjectId("id"),
  clubController.getClubMembers
);

/**
 * POST /api/clubs/:id/admins
 * Add admin to club (club admin only)
 */
router.post("/:id/admins", validateObjectId("id"), clubController.addClubAdmin);

/**
 * DELETE /api/clubs/:id/admins/:userId
 * Remove admin from club (club admin only)
 */
router.delete(
  "/:id/admins/:userId",
  validateObjectId("id"),
  validateObjectId("userId"),
  clubController.removeClubAdmin
);

export default router;
