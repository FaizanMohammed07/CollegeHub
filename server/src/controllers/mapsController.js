import mapService from "../services/mapService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Maps Controller
 * Handles map operations like geocoding and route estimation
 */

/**
 * POST /api/maps/geocode
 * Geocode an address to coordinates
 */
export const geocodeAddress = asyncHandler(async (req, res) => {
  const { address } = req.body;

  const result = await mapService.geocode(address);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/maps/reverse-geocode
 * Reverse geocode coordinates to address
 */
export const reverseGeocode = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;

  const result = await mapService.reverseGeocode(latitude, longitude);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/maps/route-estimate
 * Get route estimate between two locations
 */
export const getRouteEstimate = asyncHandler(async (req, res) => {
  const { from, to, mode = "driving" } = req.body;

  const result = await mapService.getRouteEstimate(from, to, mode);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * GET /api/maps/cache-stats
 * Get map service cache statistics (debugging)
 */
export const getCacheStats = asyncHandler(async (req, res) => {
  const stats = mapService.getCacheStats();

  res.status(200).json({
    success: true,
    data: stats,
  });
});

/**
 * POST /api/maps/cache/clear
 * Clear map service cache (admin only)
 */
export const clearCache = asyncHandler(async (req, res) => {
  mapService.clearCache();

  res.status(200).json({
    success: true,
    data: { message: "Cache cleared" },
  });
});
