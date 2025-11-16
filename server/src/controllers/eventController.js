import eventService from "../services/eventService.js";
import registrationService from "../services/registrationService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Event Controller
 */

/**
 * POST /api/events
 * Create event (club_admin only)
 */
export const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    clubId,
    startAt,
    endAt,
    location,
    capacity,
    isPaid,
    priceInPaise,
    coHosts,
    status,
    tags,
  } = req.body;

  const event = await eventService.createEvent(
    req.user.userId,
    {
      title,
      description,
      startAt,
      endAt,
      location,
      capacity,
      isPaid,
      priceInPaise,
      coHosts,
      status,
      tags,
    },
    clubId
  );

  res.status(201).json({
    success: true,
    data: event,
  });
});

/**
 * GET /api/events
 * Get events with filters (geo, date range, pagination)
 */
export const getEvents = asyncHandler(async (req, res) => {
  const {
    latitude,
    longitude,
    radiusMeters,
    startDate,
    endDate,
    limit = 20,
    skip = 0,
  } = req.query;

  const result = await eventService.getEvents({
    latitude: latitude ? parseFloat(latitude) : undefined,
    longitude: longitude ? parseFloat(longitude) : undefined,
    radiusMeters: radiusMeters ? parseInt(radiusMeters) : 5000,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    limit: parseInt(limit),
    skip: parseInt(skip),
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * GET /api/events/:id
 */
export const getEvent = asyncHandler(async (req, res) => {
  const event = await eventService.getEventDetails(req.params.id);

  res.status(200).json({
    success: true,
    data: event,
  });
});

/**
 * PUT /api/events/:id
 */
export const updateEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    startAt,
    endAt,
    location,
    capacity,
    isPaid,
    priceInPaise,
    status,
    tags,
  } = req.body;

  const event = await eventService.updateEvent(req.params.id, req.user.userId, {
    title,
    description,
    startAt,
    endAt,
    location,
    capacity,
    isPaid,
    priceInPaise,
    status,
    tags,
  });

  res.status(200).json({
    success: true,
    data: event,
  });
});

/**
 * POST /api/events/:id/cancel
 */
export const cancelEvent = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const event = await eventService.cancelEvent(
    req.params.id,
    req.user.userId,
    reason
  );

  res.status(200).json({
    success: true,
    data: event,
  });
});

/**
 * GET /api/events/search
 */
export const searchEvents = asyncHandler(async (req, res) => {
  const { q, limit = 20 } = req.query;

  const events = await eventService.searchEvents(q, parseInt(limit));

  res.status(200).json({
    success: true,
    data: events,
  });
});

/**
 * POST /api/events/:id/register
 * Register user for event
 * CRITICAL: Handles concurrent registration with atomic operations
 */
export const registerForEvent = asyncHandler(async (req, res) => {
  const { userCoordinates, metadata } = req.body;

  const registration = await registrationService.registerForEvent(
    req.params.id,
    req.user.userId,
    {
      userCoordinates,
      metadata,
    }
  );

  res.status(201).json({
    success: true,
    data: registration,
  });
});

/**
 * GET /api/events/:id/registrations
 * Get event registrations (admin only)
 */
export const getEventRegistrations = asyncHandler(async (req, res) => {
  const { limit = 100, skip = 0 } = req.query;

  const result = await registrationService.getEventRegistrations(
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
 * POST /api/events/:id/checkin
 * Check in user (QR or admin)
 */
export const checkinUser = asyncHandler(async (req, res) => {
  const { registrationId, qrToken } = req.body;

  const registration = await registrationService.checkInUser(registrationId, {
    checkedInBy: req.user.userId,
  });

  res.status(200).json({
    success: true,
    data: registration,
  });
});
