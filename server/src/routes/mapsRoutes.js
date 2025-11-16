import express from "express";
import * as mapsController from "../controllers/mapsController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// All map routes require authentication
router.use(authenticate);

/**
 * POST /api/maps/geocode
 * Geocode address to coordinates
 */
router.post("/geocode", mapsController.geocodeAddress);

/**
 * POST /api/maps/reverse-geocode
 * Reverse geocode coordinates to address
 */
router.post("/reverse-geocode", mapsController.reverseGeocode);

/**
 * POST /api/maps/route-estimate
 * Get route estimate between two locations
 */
router.post("/route-estimate", mapsController.getRouteEstimate);

/**
 * GET /api/maps/cache-stats
 * Get cache statistics (debugging)
 */
router.get("/cache-stats", mapsController.getCacheStats);

/**
 * POST /api/maps/cache/clear
 * Clear cache (admin only)
 */
router.post(
  "/cache/clear",
  authorize("super_admin", "college_admin"),
  mapsController.clearCache
);

export default router;
