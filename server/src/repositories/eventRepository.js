import Event from "../schemas/Event.js";
import mongoose from "mongoose";

const CLUB_PROJECTION = "name slug logoUrl";
const COLLEGE_PROJECTION = "name logoUrl address domain";

/**
 * Event Repository
 */
export class EventRepository {
  async findById(eventId) {
    return Event.findById(eventId)
      .populate("clubId", `${CLUB_PROJECTION} verified`)
      .populate("collegeId", COLLEGE_PROJECTION)
      .populate("coHosts", "name slug")
      .populate("createdBy", "name profilePicUrl");
  }

  async create(eventData) {
    const event = new Event(eventData);
    return event.save();
  }

  async update(eventId, updates) {
    return Event.findByIdAndUpdate(eventId, updates, {
      new: true,
      runValidators: true,
    });
  }

  async updateAttendeesCount(eventId, increment = 1) {
    return Event.findByIdAndUpdate(
      eventId,
      { $inc: { attendeesCount: increment } },
      { new: true }
    );
  }

  async findByClub(clubId, limit = 50, skip = 0, includeRemoved = false) {
    const query = { clubId, removed: false };
    if (!includeRemoved) {
      query.status = { $ne: "cancelled" };
    }

    return Event.find(query)
      .limit(limit)
      .skip(skip)
      .sort({ startAt: 1 })
      .populate("clubId", CLUB_PROJECTION)
      .populate("collegeId", COLLEGE_PROJECTION);
  }

  async findByStatus(status, limit = 50, skip = 0) {
    return Event.find({ status, removed: false })
      .limit(limit)
      .skip(skip)
      .sort({ startAt: -1 })
      .populate("clubId", CLUB_PROJECTION)
      .populate("collegeId", COLLEGE_PROJECTION);
  }

  async findUpcoming(limit = 20, skip = 0) {
    return Event.find({
      status: "published",
      removed: false,
      startAt: { $gt: new Date() },
    })
      .limit(limit)
      .skip(skip)
      .sort({ startAt: 1 })
      .populate("clubId", CLUB_PROJECTION)
      .populate("collegeId", COLLEGE_PROJECTION);
  }

  async findNearby(lat, lng, maxDistance = 5000, startDate, endDate) {
    const query = {
      "location.coords": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: maxDistance,
        },
      },
      status: "published",
      removed: false,
    };

    if (startDate && endDate) {
      query.startAt = { $gte: startDate, $lte: endDate };
    }

    return Event.find(query)
      .sort({ startAt: 1 })
      .populate("clubId", CLUB_PROJECTION)
      .populate("collegeId", COLLEGE_PROJECTION);
  }

  async findByDateRange(startDate, endDate, collegeId = null) {
    const query = {
      startAt: { $gte: startDate, $lte: endDate },
      status: "published",
      removed: false,
    };

    if (collegeId) {
      // This requires a virtual or we need to populate club -> college
      // For now, filter after population
    }

    return Event.find(query)
      .sort({ startAt: 1 })
      .populate("clubId", CLUB_PROJECTION)
      .populate("collegeId", COLLEGE_PROJECTION);
  }

  async search(query, limit = 20) {
    return Event.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
      status: "published",
      removed: false,
    })
      .limit(limit)
      .sort({ startAt: 1 })
      .populate("clubId", CLUB_PROJECTION)
      .populate("collegeId", COLLEGE_PROJECTION);
  }

  async cancel(eventId, reason) {
    return Event.findByIdAndUpdate(
      eventId,
      {
        status: "cancelled",
        cancellationReason: reason,
        cancelledAt: new Date(),
      },
      { new: true }
    );
  }

  async complete(eventId) {
    return Event.findByIdAndUpdate(
      eventId,
      { status: "completed" },
      { new: true }
    );
  }

  async softDelete(eventId) {
    return Event.findByIdAndUpdate(eventId, { removed: true }, { new: true });
  }

  async restore(eventId) {
    return Event.findByIdAndUpdate(eventId, { removed: false }, { new: true });
  }

  async delete(eventId) {
    return Event.findByIdAndDelete(eventId);
  }

  async findByCohost(clubId, limit = 50, skip = 0) {
    return Event.find({ coHosts: clubId, removed: false })
      .limit(limit)
      .skip(skip)
      .sort({ startAt: 1 });
  }

  async canAccommodate(eventId) {
    const event = await Event.findById(eventId);
    if (!event || event.capacity === 0) return true; // Unlimited capacity
    return event.attendeesCount < event.capacity;
  }

  /**
   * Atomic registration increment
   * Use MongoDB transaction for safety
   */
  async incrementAttendees(eventId) {
    return Event.findByIdAndUpdate(
      eventId,
      { $inc: { attendeesCount: 1 } },
      { new: true }
    );
  }

  /**
   * Atomic registration decrement
   */
  async decrementAttendees(eventId) {
    return Event.findByIdAndUpdate(
      eventId,
      { $inc: { attendeesCount: -1 } },
      { new: true }
    );
  }
}

export default new EventRepository();
