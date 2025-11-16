import eventRepository from "../repositories/eventRepository.js";
import registrationRepository from "../repositories/registrationRepository.js";
import clubRepository from "../repositories/clubRepository.js";
import mapService from "./mapService.js";
import { AppError, ERROR_CODES } from "../utils/AppError.js";
import logger from "../utils/logger.js";

/**
 * Event Service
 * Handles event creation, updates, and validations
 * CRITICAL BUSINESS RULES:
 * - Events must have startAt < endAt
 * - Start time must be in future
 * - If capacity set, enforce limits with atomic operations
 * - Support ETA computation and scheduling
 */
export class EventService {
  /**
   * Create event
   * Club admin or super admin only
   */
  async createEvent(userId, eventData, clubId) {
    const {
      title,
      description,
      startAt,
      endAt,
      location,
      capacity = 0,
      isPaid = false,
      priceInPaise = 0,
      coHosts = [],
      status = "draft",
      tags = [],
    } = eventData;

    try {
      // Get club to verify ownership
      const club = await clubRepository.findById(clubId);
      if (!club) {
        throw new AppError(
          ERROR_CODES.RESOURCE_NOT_FOUND,
          "Club not found",
          404
        );
      }

      // Verify user is admin
      const isAdmin = club.admins.some((id) => id.toString() === userId);
      if (!isAdmin) {
        throw new AppError(
          ERROR_CODES.INSUFFICIENT_ROLE,
          "You do not have permission to create events for this club",
          403
        );
      }

      // Validate times
      const startDate = new Date(startAt);
      const endDate = new Date(endAt);
      const now = new Date();

      if (startDate >= endDate) {
        throw new AppError(
          ERROR_CODES.INVALID_TIME_WINDOW,
          "Event start time must be before end time",
          400
        );
      }

      if (startDate <= now && status === "published") {
        throw new AppError(
          ERROR_CODES.EVENT_TIME_IN_PAST,
          "Cannot publish event with start time in the past",
          400
        );
      }

      // Validate capacity
      if (capacity < 0) {
        throw new AppError(
          ERROR_CODES.VALIDATION_ERROR,
          "Capacity cannot be negative",
          400
        );
      }

      // Validate pricing
      if (isPaid && priceInPaise < 0) {
        throw new AppError(
          ERROR_CODES.VALIDATION_ERROR,
          "Price cannot be negative",
          400
        );
      }

      // Process location and geocode if needed
      let eventLocation = { coords: { type: "Point", coordinates: [0, 0] } };

      if (location) {
        eventLocation = {
          name: location.name,
          address: location.address,
          coords: {
            type: "Point",
            coordinates: [0, 0],
          },
        };

        // Geocode address if provided
        if (location.address && !location.coords) {
          try {
            const geocoded = await mapService.geocode(location.address);
            eventLocation.coords.coordinates = [geocoded.lng, geocoded.lat];
          } catch (error) {
            logger.warn(
              { error, address: location.address },
              "Geocoding failed, using default"
            );
            // Continue with default coords
          }
        } else if (location.coords) {
          eventLocation.coords.coordinates = [
            location.coords.lng,
            location.coords.lat,
          ];
        }
      }

      // Validate co-hosts belong to same college
      if (coHosts.length > 0) {
        for (const coHostId of coHosts) {
          const coHost = await clubRepository.findById(coHostId);
          if (
            !coHost ||
            coHost.collegeId.toString() !== club.collegeId.toString()
          ) {
            throw new AppError(
              ERROR_CODES.CONFLICT,
              "All co-hosting clubs must belong to the same college",
              400
            );
          }
        }
      }

      // Create event
      const event = await eventRepository.create({
        title,
        description,
        clubId,
        collegeId: club.collegeId,
        coHosts,
        startAt: startDate,
        endAt: endDate,
        location: eventLocation,
        capacity,
        isPaid,
        priceInPaise,
        status,
        tags,
        createdBy: userId,
      });

      logger.info(
        { userId, eventId: event._id, clubId, status },
        "Event created"
      );

      const eventData = event.toObject({ virtuals: true });
      if (eventData.collegeId && typeof eventData.collegeId === "object") {
        eventData.college = eventData.collegeId;
      }

      return eventData;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ error, userId }, "Failed to create event");
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to create event",
        500
      );
    }
  }

  /**
   * Get event details
   */
  async getEventDetails(eventId) {
    try {
      const event = await eventRepository.findById(eventId);

      if (!event) {
        throw new AppError(
          ERROR_CODES.RESOURCE_NOT_FOUND,
          "Event not found",
          404
        );
      }

      if (event.removed) {
        throw new AppError(
          ERROR_CODES.RESOURCE_NOT_FOUND,
          "Event has been deleted",
          404
        );
      }

      return event;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ error, eventId }, "Failed to get event");
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to fetch event",
        500
      );
    }
  }

  /**
   * Update event
   * Owner only can update, with time validations
   */
  async updateEvent(eventId, userId, updates) {
    try {
      const event = await eventRepository.findById(eventId);

      if (!event) {
        throw new AppError(
          ERROR_CODES.RESOURCE_NOT_FOUND,
          "Event not found",
          404
        );
      }

      // Verify ownership
      if (event.createdBy.toString() !== userId) {
        throw new AppError(
          ERROR_CODES.INSUFFICIENT_ROLE,
          "You do not have permission to update this event",
          403
        );
      }

      // Validate time updates
      if (updates.startAt || updates.endAt) {
        const startDate = new Date(updates.startAt || event.startAt);
        const endDate = new Date(updates.endAt || event.endAt);

        if (startDate >= endDate) {
          throw new AppError(
            ERROR_CODES.INVALID_TIME_WINDOW,
            "Start time must be before end time",
            400
          );
        }

        // Warn if editing published event's time
        if (event.status === "published" && event.attendeesCount > 0) {
          logger.warn(
            {
              eventId,
              previousStart: event.startAt,
              newStart: updates.startAt,
            },
            "Event time edited with existing attendees"
          );
          // In production: send notifications to attendees
        }
      }

      // Prevent certain fields from being updated
      const forbiddenFields = [
        "attendeesCount",
        "createdBy",
        "createdAt",
        "clubId",
      ];
      for (const field of forbiddenFields) {
        delete updates[field];
      }

      const updated = await eventRepository.update(eventId, updates);

      logger.info({ eventId, userId }, "Event updated");

      return updated;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ error, eventId }, "Failed to update event");
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to update event",
        500
      );
    }
  }

  /**
   * Get events with filters
   * Supports geo-filtering, date range, pagination
   */
  async getEvents(filters = {}) {
    const {
      latitude,
      longitude,
      radiusMeters = 5000,
      startDate,
      endDate,
      limit = 20,
      skip = 0,
    } = filters;

    try {
      let events;

      if (latitude !== undefined && longitude !== undefined) {
        // Geo-filtered query
        events = await eventRepository.findNearby(
          latitude,
          longitude,
          radiusMeters,
          startDate,
          endDate
        );
      } else if (startDate && endDate) {
        // Date range filtered
        events = await eventRepository.findByDateRange(startDate, endDate);
      } else {
        // Default: upcoming events
        events = await eventRepository.findUpcoming(limit, skip);
      }

      // Apply pagination
      const paginated = events.slice(skip, skip + limit);

      return {
        total: events.length,
        count: paginated.length,
        events: paginated,
      };
    } catch (error) {
      logger.error({ error }, "Failed to fetch events");
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to fetch events",
        500
      );
    }
  }

  /**
   * Cancel event
   * Owner only; refunds paid registrations
   * Notifies attendees
   */
  async cancelEvent(eventId, userId, reason = "Event cancelled by organizer") {
    try {
      const event = await eventRepository.findById(eventId);

      if (!event) {
        throw new AppError(
          ERROR_CODES.RESOURCE_NOT_FOUND,
          "Event not found",
          404
        );
      }

      if (event.createdBy.toString() !== userId) {
        throw new AppError(
          ERROR_CODES.INSUFFICIENT_ROLE,
          "You do not have permission to cancel this event",
          403
        );
      }

      const updated = await eventRepository.cancel(eventId, reason);

      logger.info({ eventId, userId, reason }, "Event cancelled");

      // TODO: In production, notify attendees and handle refunds
      if (event.attendeesCount > 0) {
        logger.info(
          { eventId, attendeeCount: event.attendeesCount },
          "Should notify attendees of cancellation"
        );
      }

      return updated;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ error, eventId }, "Failed to cancel event");
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to cancel event",
        500
      );
    }
  }

  /**
   * Search events
   */
  async searchEvents(query, limit = 20) {
    if (!query || query.trim().length < 2) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        "Search query must be at least 2 characters",
        400
      );
    }

    try {
      const events = await eventRepository.search(query, limit);
      return events;
    } catch (error) {
      logger.error({ error, query }, "Event search failed");
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to search events",
        500
      );
    }
  }
}

export default new EventService();
