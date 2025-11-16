import registrationService from "../services/registrationService.js";
import mapService from "../services/mapService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Registration Controller
 */

/**
 * GET /api/registrations
 * Get user's registrations or event registrations (with query params)
 */
export const getRegistrations = asyncHandler(async (req, res) => {
  const { eventId, userId, limit = 50, page = 1, status } = req.query;

  let registrations;

  if (eventId) {
    // Get registrations for event
    const result = await registrationService.getEventRegistrations(
      eventId,
      parseInt(limit),
      parseInt(skip)
    );
    registrations = result;
  } else {
    // Get user's registrations
    registrations = await registrationService.getUserRegistrations(
      userId || req.user.userId,
      {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        status,
      }
    );
  }

  res.status(200).json({
    success: true,
    data: registrations,
  });
});

/**
 * GET /api/registrations/me
 * Get currently authenticated user's registrations with pagination
 */
export const getMyRegistrations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const result = await registrationService.getUserRegistrations(
    req.user.userId,
    {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      status,
    }
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * PATCH /api/registrations/:id/status
 * Update registration status (admin only)
 */
export const updateRegistrationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const registration = await registrationService.updateStatus(
    req.params.id,
    status
  );

  res.status(200).json({
    success: true,
    data: registration,
  });
});

/**
 * POST /api/registrations/:id/cancel
 */
export const cancelRegistration = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const registration = await registrationService.cancelRegistration(
    req.params.id,
    req.user.userId,
    reason
  );

  res.status(200).json({
    success: true,
    data: registration,
  });
});

/**
 * POST /api/registrations/:id/request-eta
 * Request ETA for registration
 */
export const requestETA = asyncHandler(async (req, res) => {
  const { userCoordinates } = req.body;

  const etaData = await registrationService.requestETA(
    req.params.id,
    req.user.userId,
    userCoordinates
  );

  res.status(200).json({
    success: true,
    data: etaData,
  });
});

/**
 * POST /api/registrations/:id/qr-token
 * Generate QR token for check-in
 */
export const generateQRToken = asyncHandler(async (req, res) => {
  const registration = await registrationService.getRegistration(req.params.id);

  const token = registrationService.generateQRToken(
    req.params.id,
    registration.eventId
  );

  res.status(200).json({
    success: true,
    data: { qrToken: token },
  });
});
