import Registration from "../schemas/Registration.js";
import mongoose from "mongoose";

/**
 * Registration Repository
 */
export class RegistrationRepository {
  async findById(registrationId) {
    return Registration.findById(registrationId)
      .populate("eventId")
      .populate("userId", "name email profilePicUrl phone");
  }

  async create(registrationData) {
    const registration = new Registration(registrationData);
    return registration.save();
  }

  async update(registrationId, updates) {
    return Registration.findByIdAndUpdate(registrationId, updates, {
      new: true,
      runValidators: true,
    });
  }

  async findByEventAndUser(eventId, userId) {
    return Registration.findOne({ eventId, userId });
  }

  async findByEvent(eventId, limit = 100, skip = 0) {
    return Registration.find({ eventId })
      .populate("userId", "name email profilePicUrl")
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
  }

  async findByUser(userId, limit = 50, skip = 0) {
    return Registration.find({ userId })
      .populate({
        path: "eventId",
        select:
          "title name startAt endAt location venue isPaid clubId posterUrl slug",
        populate: { path: "clubId", select: "name logoUrl" },
      })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
  }

  async findByUserAndStatus(userId, status, limit = 50, skip = 0) {
    return Registration.find({ userId, status })
      .populate({
        path: "eventId",
        select:
          "title name startAt endAt location venue isPaid clubId posterUrl slug",
        populate: { path: "clubId", select: "name logoUrl" },
      })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
  }

  async findByEventAndStatus(eventId, status) {
    return Registration.find({ eventId, status }).populate(
      "userId",
      "name email"
    );
  }

  async findCheckedIn(eventId) {
    return Registration.find({
      eventId,
      status: "checked-in",
    }).populate("userId", "name email");
  }

  async findNoShows(eventId) {
    return Registration.find({
      eventId,
      status: "no-show",
    }).populate("userId", "name email");
  }

  async updateStatus(registrationId, status, metadata = {}) {
    const updates = { status, ...metadata };

    if (status === "checked-in") {
      updates.checkedInAt = new Date();
    }

    if (status === "cancelled") {
      updates.cancelled = true;
      updates.cancelledAt = new Date();
    }

    return Registration.findByIdAndUpdate(registrationId, updates, {
      new: true,
    });
  }

  async updateETA(registrationId, etaData) {
    return Registration.findByIdAndUpdate(
      registrationId,
      {
        eta: {
          ...etaData,
          lastUpdatedAt: new Date(),
        },
      },
      { new: true }
    );
  }

  async countByEvent(eventId, status = null) {
    const query = { eventId };
    if (status) {
      query.status = status;
    }
    return Registration.countDocuments(query);
  }

  async countByUser(userId, status = null) {
    const query = { userId };
    if (status) {
      query.status = status;
    }
    return Registration.countDocuments(query);
  }

  async isAlreadyRegistered(eventId, userId) {
    const count = await Registration.countDocuments({
      eventId,
      userId,
      status: { $ne: "cancelled" },
    });
    return count > 0;
  }

  async delete(registrationId) {
    return Registration.findByIdAndDelete(registrationId);
  }

  async findUpcomingForUser(userId, hoursAhead = 24) {
    const futureDate = new Date(Date.now() + hoursAhead * 60 * 60 * 1000);
    return Registration.find({
      userId,
      status: { $in: ["registered", "checked-in"] },
    })
      .populate({
        path: "eventId",
        match: {
          startAt: { $lte: futureDate },
        },
      })
      .sort({ "eventId.startAt": 1 });
  }

  /**
   * Atomic create with duplicate check
   * Returns error if already registered
   */
  async createIfNotExists(eventId, userId, registrationData) {
    // Check if already registered
    const existing = await Registration.findOne({
      eventId,
      userId,
      status: { $ne: "cancelled" },
    });

    if (existing) {
      throw new Error("User already registered for this event");
    }

    const registration = new Registration({
      eventId,
      userId,
      ...registrationData,
    });

    return registration.save();
  }
}

export default new RegistrationRepository();
