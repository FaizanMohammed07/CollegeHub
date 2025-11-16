import userService from "../services/userService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * User Controller
 */

/**
 * GET /api/users/me
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserProfile(req.user.userId);

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * PUT /api/users/me
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, profilePicUrl } = req.body;

  const user = await userService.updateProfile(req.user.userId, {
    name,
    phone,
    profilePicUrl,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * PUT /api/users/me/location
 * Update user location
 */
export const updateLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;

  const user = await userService.updateLocation(
    req.user.userId,
    latitude,
    longitude
  );

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * GET /api/users/nearby
 * Find nearby users
 */
export const getNearbyUsers = asyncHandler(async (req, res) => {
  const { latitude, longitude, maxDistance = 5000 } = req.query;

  const users = await userService.findNearbyUsers(
    parseFloat(latitude),
    parseFloat(longitude),
    parseInt(maxDistance)
  );

  res.status(200).json({
    success: true,
    data: users,
  });
});

/**
 * GET /api/users/search
 * Search users
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const { q, limit = 20 } = req.query;

  const users = await userService.searchUsers(q, parseInt(limit));

  res.status(200).json({
    success: true,
    data: users,
  });
});

/**
 * GET /api/users/:id
 * Get user by ID
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * GET /api/users/:id/stats
 * Get user statistics
 */
export const getUserStats = asyncHandler(async (req, res) => {
  const stats = await userService.getUserStats(req.params.id);

  res.status(200).json({
    success: true,
    data: stats,
  });
});

/**
 * POST /api/users/:id/block (admin only)
 */
export const blockUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const result = await userService.blockUser(req.params.id, reason);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/users/:id/unblock (admin only)
 */
export const unblockUser = asyncHandler(async (req, res) => {
  const result = await userService.unblockUser(req.params.id);

  res.status(200).json({
    success: true,
    data: result,
  });
});
