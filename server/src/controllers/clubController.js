import clubService from "../services/clubService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Club Controller
 */

/**
 * POST /api/clubs
 * Create club (club_admin, college_admin, super_admin)
 */
export const createClub = asyncHandler(async (req, res) => {
  const { name, slug, description, category, logoUrl } = req.body;

  const club = await clubService.createClub(
    req.user.userId,
    {
      name,
      slug,
      description,
      category,
      logoUrl,
    },
    req.user.userDoc.collegeId
  );

  res.status(201).json({
    success: true,
    data: club,
  });
});

/**
 * GET /api/clubs
 * List all clubs with pagination and filtering
 */
export const listClubs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, collegeId } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const result = await clubService.listClubs(
    {
      category,
      collegeId: collegeId || req.user.userDoc?.collegeId,
    },
    parseInt(limit),
    skip
  );

  res.status(200).json({
    success: true,
    data: result.clubs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: result.total,
      pages: Math.ceil(result.total / parseInt(limit)),
    },
  });
});

/**
 * GET /api/clubs/:id
 */
export const getClub = asyncHandler(async (req, res) => {
  const club = await clubService.getClubDetails(req.params.id);

  res.status(200).json({
    success: true,
    data: club,
  });
});

/**
 * PUT /api/clubs/:id
 */
export const updateClub = asyncHandler(async (req, res) => {
  const { name, description, category, logoUrl, websiteUrl, socialLinks } =
    req.body;

  const club = await clubService.updateClub(req.params.id, req.user.userId, {
    name,
    description,
    category,
    logoUrl,
    websiteUrl,
    socialLinks,
  });

  res.status(200).json({
    success: true,
    data: club,
  });
});

/**
 * POST /api/clubs/:id/join
 * Join club as member
 */
export const joinClub = asyncHandler(async (req, res) => {
  const club = await clubService.joinClub(req.params.id, req.user.userId);

  res.status(200).json({
    success: true,
    data: club,
  });
});

/**
 * POST /api/clubs/:id/leave
 */
export const leaveClub = asyncHandler(async (req, res) => {
  const club = await clubService.leaveClub(req.params.id, req.user.userId);

  res.status(200).json({
    success: true,
    data: club,
  });
});

/**
 * GET /api/clubs/:id/members
 */
export const getClubMembers = asyncHandler(async (req, res) => {
  const { limit = 50, skip = 0 } = req.query;

  const result = await clubService.getClubMembers(
    req.params.id,
    parseInt(limit),
    parseInt(skip)
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/clubs/:id/admins
 * Add admin to club
 */
export const addClubAdmin = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const club = await clubService.addAdmin(
    req.params.id,
    req.user.userId,
    userId
  );

  res.status(200).json({
    success: true,
    data: club,
  });
});

/**
 * DELETE /api/clubs/:id/admins/:userId
 */
export const removeClubAdmin = asyncHandler(async (req, res) => {
  const club = await clubService.removeAdmin(
    req.params.id,
    req.user.userId,
    req.params.userId
  );

  res.status(200).json({
    success: true,
    data: club,
  });
});

/**
 * GET /api/clubs/college/:collegeId
 */
export const getCollegeClubs = asyncHandler(async (req, res) => {
  const { limit = 50, skip = 0 } = req.query;

  const result = await clubService.getCollegeClubs(
    req.params.collegeId,
    parseInt(limit),
    parseInt(skip)
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * GET /api/clubs/search
 */
export const searchClubs = asyncHandler(async (req, res) => {
  const { q, collegeId, limit = 20 } = req.query;

  const clubs = await clubService.searchClubs(q, collegeId, parseInt(limit));

  res.status(200).json({
    success: true,
    data: clubs,
  });
});
