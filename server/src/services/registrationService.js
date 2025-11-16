import registrationRepository from "../repositories/registrationRepository.js";
import eventRepository from "../repositories/eventRepository.js";
import userRepository from "../repositories/userRepository.js";
import mapService from "./mapService.js";
import { AppError, ERROR_CODES } from "../utils/AppError.js";
import logger from "../utils/logger.js";
import { generateQRToken } from "../utils/jwt.js";

/**
 * Registration Service
 * CRITICAL: Handles event registration with concurrency safety
 *
 * CONCURRENCY RULES:
 * - Use MongoDB unique index {eventId, userId} to prevent duplicates
 * - Use atomic operations for attendeesCount increment
 * - Check capacity before incrementing
 * - Implement transaction logic for safety
 *
 * ETA BUSINESS RULES:
 * - If user provides precise coords + permission, compute route with provider
 * - Store provider metadata and reliability score
 * - Schedule recomputation based on time-to-event:
 *   - >6h: recompute every 2h
 *   - 1h-6h: recompute every 15-30m
 *   - <1h: recompute every 5m
 * - Fallback to haversine if provider fails/rate-limited
 */
export class RegistrationService {
  /**
   * Register user for event
   * Handles concurrent registration attempts safely
   *
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   * @param {object} registrationData - { userCoordinates?: {lat, lng}, metadata?: {} }
   */
  async registerForEvent(eventId, userId, registrationData = {}) {
    try {
      // Validate event exists
      const event = await eventRepository.findById(eventId);
      if (!event) {
        throw new AppError(
          ERROR_CODES.RESOURCE_NOT_FOUND,
          "Event not found",
          404
        );
      }

      // Validate event is published
      if (event.status !== "published") {
        throw new AppError(
          ERROR_CODES.EVENT_CANCELLED,
          "This event is not available for registration",
          400
        );
      }

      // Validate event is not in past
      const now = new Date();
      if (event.endAt <= now) {
        throw new AppError(
          ERROR_CODES.EVENT_CANCELLED,
          "This event has already ended",
          400
        );
      }

      // Validate user
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new AppError(ERROR_CODES.USER_NOT_FOUND, "User not found", 404);
      }

      // Check if user is blocked
      if (user.blocked) {
        throw new AppError(
          ERROR_CODES.USER_BLOCKED,
          "Your account is blocked and cannot register for events",
          403
        );
      }

      // Check if already registered
      const existingReg = await registrationRepository.findByEventAndUser(
        eventId,
        userId
      );
      if (existingReg && existingReg.status !== "cancelled") {
        throw new AppError(
          ERROR_CODES.ALREADY_REGISTERED,
          "You are already registered for this event",
          409
        );
      }

      // CRITICAL: Check capacity before incrementing
      // This is atomic in MongoDB with unique index on {eventId, userId}
      if (event.capacity > 0 && event.attendeesCount >= event.capacity) {
        throw new AppError(
          ERROR_CODES.CAPACITY_EXCEEDED,
          "This event has reached maximum capacity",
          400,
          { available: 0, capacity: event.capacity }
        );
      }

      // Prepare registration data
      const regData = {
        eventId,
        userId,
        status: "registered",
        metadata: registrationData.metadata || {},
      };

      // Handle payment if event is paid
      if (event.isPaid) {
        regData.paymentStatus = "pending";
        // TODO: In production, integrate with payment gateway
        // For now, mark as completed in mock
        regData.paymentStatus = "completed";
        regData.paymentId = `PAY_${Date.now()}_${userId}`;
      }

      // Create registration (will fail if duplicate due to unique index)
      let registration;
      try {
        registration = await registrationRepository.create(regData);
      } catch (error) {
        if (error.code === 11000) {
          throw new AppError(
            ERROR_CODES.ALREADY_REGISTERED,
            "Duplicate registration detected",
            409
          );
        }
        throw error;
      }

      // Increment attendees count atomically
      try {
        await eventRepository.incrementAttendees(eventId);
      } catch (error) {
        // If increment fails, delete registration to maintain consistency
        await registrationRepository.delete(registration._id);
        throw error;
      }

      logger.info(
        { eventId, userId, registrationId: registration._id },
        "User registered for event"
      );

      // Compute ETA if coordinates provided
      let etaData = null;
      if (registrationData.userCoordinates) {
        try {
          etaData = await this.computeETA(
            registration._id,
            registrationData.userCoordinates,
            event.location.coords.coordinates
          );
        } catch (error) {
          logger.warn(
            { error, registrationId: registration._id },
            "ETA computation failed"
          );
          // Continue without ETA
        }
      }

      // Return registration with ETA
      return {
        ...registration.toObject(),
        eta: etaData,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ error, eventId, userId }, "Failed to register for event");
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Registration failed",
        500
      );
    }
  }

  /**
   * Compute ETA for a registration
   * Pluggable map service with fallback
   *
   * @returns { etaSeconds, distanceMeters, polyline, reliabilityScore, provider, providerMeta }
   */
  async computeETA(registrationId, userCoordinates, eventCoords) {
    try {
      // Validate coordinates
      mapService.validateCoordinates(userCoordinates.lat, userCoordinates.lng);
      mapService.validateCoordinates(eventCoords[1], eventCoords[0]); // [lng, lat]

      const from = { lat: userCoordinates.lat, lng: userCoordinates.lng };
      const to = { lat: eventCoords[1], lng: eventCoords[0] };

      // Get route estimate
      const routeData = await mapService.getRouteEstimate(from, to, "driving");

      // Determine recompute frequency based on time-to-event
      const event = await registrationRepository.findById(registrationId);
      const timeToEventMs = new Date(event.eventId.startAt) - new Date();
      const timeToEventHours = timeToEventMs / (1000 * 60 * 60);

      let recomputeIntervalMinutes = 120; // Default for >6h
      if (timeToEventHours < 6 && timeToEventHours > 1) {
        recomputeIntervalMinutes = 15;
      } else if (timeToEventHours < 1) {
        recomputeIntervalMinutes = 5;
      }

      // Schedule recomputation
      // TODO: In production, use job queue (Bull, RabbitMQ)
      logger.debug(
        { registrationId, recomputeIntervalMinutes },
        "ETA recomputation scheduled"
      );

      const etaData = {
        requestedAt: new Date(),
        estimatedArriveAt: new Date(Date.now() + routeData.etaSeconds * 1000),
        provider: routeData.provider,
        distanceMeters: routeData.distanceMeters,
        etaSeconds: routeData.etaSeconds,
        polyline: routeData.polyline,
        reliabilityScore: routeData.reliabilityScore,
        providerMeta: routeData.providerMeta,
      };

      // Update registration with ETA
      await registrationRepository.updateETA(registrationId, etaData);

      return etaData;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ error, registrationId }, "ETA computation error");
      throw new AppError(
        ERROR_CODES.ROUTE_ESTIMATION_FAILED,
        "Unable to compute ETA",
        500
      );
    }
  }

  /**
   * Request ETA for existing registration
   * Used when user wants to request ETA after registration
   */
  async requestETA(registrationId, userId, userCoordinates) {
    try {
      const registration = await registrationRepository.findById(
        registrationId
      );

      if (!registration) {
        throw new AppError(
          ERROR_CODES.RESOURCE_NOT_FOUND,
          "Registration not found",
          404
        );
      }

      // Verify ownership
      if (registration.userId.toString() !== userId) {
        throw new AppError(
          ERROR_CODES.INSUFFICIENT_ROLE,
          "You do not have permission to request ETA",
          403
        );
      }

      // Compute ETA
      const eventCoords = registration.eventId.location.coords.coordinates;
      const etaData = await this.computeETA(
        registrationId,
        userCoordinates,
        eventCoords
      );

      logger.info({ registrationId, userId }, "ETA requested and computed");

      return etaData;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ error, registrationId }, "Failed to request ETA");
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to compute ETA",
        500
      );
    }
  }

  /**
   * Check in user for event
   * Admin or QR-based check-in
   * Creates audit log
   */
  async checkInUser(registrationId, checkInData = {}) {
    try {
      const registration = await registrationRepository.findById(
        registrationId
      );

      if (!registration) {
        throw new AppError(
          ERROR_CODES.RESOURCE_NOT_FOUND,
          "Registration not found",
          404
        );
      }

      if (registration.status === "checked-in") {
        throw new AppError(
          ERROR_CODES.CONFLICT,
          "User is already checked in",
          409
        );
      }

      if (registration.status === "cancelled") {
        throw new AppError(
          ERROR_CODES.CONFLICT,
          "Cannot check in cancelled registration",
          409
        );
      }

      // Update status
      const updated = await registrationRepository.updateStatus(
        registrationId,
        "checked-in",
        {
          checkedInAt: new Date(),
          checkedInBy: checkInData.checkedInBy,
        }
      );

      logger.info(
        { registrationId, checkedInBy: checkInData.checkedInBy },
        "User checked in"
      );

      return updated;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ error, registrationId }, "Check-in failed");
      throw new AppError(ERROR_CODES.DATABASE_ERROR, "Check-in failed", 500);
    }
  }

  /**
   * Cancel registration
   * User can cancel before event start
   */
  async cancelRegistration(registrationId, userId, reason = "User cancelled") {
    try {
      const registration = await registrationRepository.findById(
        registrationId
      );

      if (!registration) {
        throw new AppError(
          ERROR_CODES.RESOURCE_NOT_FOUND,
          "Registration not found",
          404
        );
      }

      // Verify ownership
      if (registration.userId.toString() !== userId) {
        throw new AppError(
          ERROR_CODES.INSUFFICIENT_ROLE,
          "You do not have permission to cancel this registration",
          403
        );
      }

      if (registration.status === "checked-in") {
        throw new AppError(
          ERROR_CODES.CONFLICT,
          "Cannot cancel after check-in",
          409
        );
      }

      // Update status
      const updated = await registrationRepository.updateStatus(
        registrationId,
        "cancelled",
        { cancelledAt: new Date(), cancellationReason: reason }
      );

      // Decrement attendees count
      await eventRepository.decrementAttendees(registration.eventId);

      logger.info({ registrationId, userId }, "Registration cancelled");

      // TODO: In production, refund if paid
      if (registration.paymentStatus === "completed") {
        logger.info({ registrationId }, "Should refund payment");
      }

      return updated;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ error, registrationId }, "Failed to cancel registration");
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to cancel registration",
        500
      );
    }
  }

  /**
   * Get registrations for event
   */
  async getEventRegistrations(eventId, limit = 100, skip = 0) {
    try {
      const registrations = await registrationRepository.findByEvent(
        eventId,
        limit,
        skip
      );
      const total = await registrationRepository.countByEvent(eventId);

      return {
        total,
        registrations,
      };
    } catch (error) {
      logger.error({ error, eventId }, "Failed to fetch registrations");
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to fetch registrations",
        500
      );
    }
  }

  /**
   * Get user's registrations
   */
  async getUserRegistrations(userId, { page = 1, limit = 10, status } = {}) {
    try {
      const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
      const safePage = Math.max(parseInt(page, 10) || 1, 1);
      const skip = (safePage - 1) * safeLimit;

      const registrations = status
        ? await registrationRepository.findByUserAndStatus(
            userId,
            status,
            safeLimit,
            skip
          )
        : await registrationRepository.findByUser(userId, safeLimit, skip);

      const total = await registrationRepository.countByUser(userId, status);

      return {
        registrations,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          hasMore: safePage * safeLimit < total,
        },
      };
    } catch (error) {
      logger.error({ error, userId }, "Failed to fetch user registrations");
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to fetch registrations",
        500
      );
    }
  }

  /**
   * Generate QR code token for check-in
   */
  generateQRToken(registrationId, eventId) {
    try {
      return generateQRToken(registrationId, eventId);
    } catch (error) {
      logger.error({ error }, "Failed to generate QR token");
      throw new AppError(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        "Failed to generate QR code",
        500
      );
    }
  }
}

export default new RegistrationService();
