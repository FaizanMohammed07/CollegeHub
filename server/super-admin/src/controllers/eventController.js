import mongoose from "mongoose";
import Event from "../../../src/schemas/Event.js";
import Registration from "../../../src/schemas/Registration.js";
import Report from "../schemas/Report.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const buildQuery = (filter) => {
  const now = new Date();
  switch (filter) {
    case "live":
      return {
        status: "published",
        startAt: { $lte: now },
        endAt: { $gte: now },
      };
    case "upcoming":
      return { status: "published", startAt: { $gt: now } };
    case "trending":
      return { status: "published" };
    case "cancelled":
      return { status: "cancelled" };
    default:
      return {};
  }
};

export const listEvents = asyncHandler(async (req, res) => {
  const { filter, search } = req.query;
  const query = buildQuery(filter);
  if (search) {
    query.title = { $regex: search, $options: "i" };
  }
  const events = await Event.find(query)
    .populate("collegeId", "name")
    .populate("clubId", "name")
    .sort({ startAt: -1 })
    .limit(200)
    .lean();

  if (filter === "flagged") {
    const flaggedIds = await Report.find({
      targetType: "event",
      status: "pending",
    }).distinct("targetId");
    res.json({
      success: true,
      data: events.filter((evt) => flaggedIds.some((id) => id.equals(evt._id))),
    });
    return;
  }

  res.json({ success: true, data: events });
});

export const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate("collegeId", "name")
    .populate("clubId", "name")
    .lean();
  if (!event) {
    return res.status(404).json({ success: false, error: "Event not found" });
  }

  const registrations = await Registration.find({ eventId: event._id })
    .populate("userId", "name email role")
    .lean();

  res.json({
    success: true,
    data: {
      event,
      analytics: {
        totalRegistrations: registrations.length,
        checkedIn: registrations.filter((r) => r.status === "checked-in")
          .length,
        cancelled: registrations.filter((r) => r.status === "cancelled").length,
      },
      registrations,
    },
  });
});

export const updateEventStatus = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  const allowed = ["published", "cancelled", "completed"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, error: "Invalid status" });
  }
  const update = { status };
  if (status === "cancelled") {
    update.cancellationReason = reason;
    update.cancelledAt = new Date();
  }
  const event = await Event.findByIdAndUpdate(req.params.id, update, {
    new: true,
  });
  res.json({ success: true, data: event });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  await Event.findByIdAndUpdate(req.params.id, { removed: true });
  res.json({ success: true });
});

export const resolveFlaggedEvent = asyncHandler(async (req, res) => {
  const report = await Report.findByIdAndUpdate(
    req.params.reportId,
    {
      status: "resolved",
      resolvedAt: new Date(),
      resolvedBy: req.superAdmin.email,
    },
    { new: true }
  );
  res.json({ success: true, data: report });
});

export const getEventAnalytics = asyncHandler(async (req, res) => {
  const eventId = new mongoose.Types.ObjectId(req.params.id);
  const timeline = await Registration.aggregate([
    { $match: { eventId } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        registrations: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const byStatus = await Registration.aggregate([
    { $match: { eventId } },
    {
      $group: {
        _id: "$status",
        total: { $sum: 1 },
      },
    },
  ]);

  res.json({ success: true, data: { timeline, byStatus } });
});
