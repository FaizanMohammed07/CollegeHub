import express from "express";
import * as eventController from "../controllers/eventController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  validateCreateEvent,
  validateObjectId,
} from "../middleware/validation.js";

const router = express.Router();

// All event routes require authentication
router.use(authenticate);

/**
 * POST /api/events
 * Create event (club_admin only)
 */
router.post(
  "/",
  authorize("club_admin", "college_admin", "super_admin"),
  validateCreateEvent,
  eventController.createEvent
);

/**
 * GET /api/events
 * Get events with filters (geo, date range, pagination)
 */
router.get("/", eventController.getEvents);

/**
 * GET /api/events/:id
 * Get event details
 */
router.get("/:id", validateObjectId("id"), eventController.getEvent);

/**
 * PUT /api/events/:id
 * Update event (creator/owner only)
 */
router.put("/:id", validateObjectId("id"), eventController.updateEvent);

/**
 * POST /api/events/:id/cancel
 * Cancel event (creator/owner only)
 */
router.post("/:id/cancel", validateObjectId("id"), eventController.cancelEvent);

/**
 * GET /api/events/:id/registrations
 * Get event registrations (admin only)
 */
router.get(
  "/:id/registrations",
  validateObjectId("id"),
  authorize("club_admin", "college_admin", "super_admin"),
  eventController.getEventRegistrations
);

/**
 * POST /api/events/:id/register
 * Register user for event
 * CRITICAL: Handles concurrent registration with atomic operations
 */
router.post(
  "/:id/register",
  validateObjectId("id"),
  eventController.registerForEvent
);

/**
 * POST /api/events/:id/checkin
 * Check in user for event (admin or QR)
 */
router.post(
  "/:id/checkin",
  validateObjectId("id"),
  eventController.checkinUser
);

/**
 * GET /api/events/search
 * Search events
 */
router.get("/search", eventController.searchEvents);

export default router;
