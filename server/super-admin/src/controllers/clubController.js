import mongoose from "mongoose";
import Club from "../../../src/schemas/Club.js";
import Event from "../../../src/schemas/Event.js";
import Registration from "../../../src/schemas/Registration.js";
import User from "../../../src/schemas/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listClubs = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = { removed: { $ne: true } };
  if (status === "verified") query.verified = true;
  if (status === "unverified") query.verified = false;

  const clubs = await Club.find(query)
    .select("name collegeId category verified membersCount createdAt")
    .populate("collegeId", "name")
    .lean();

  res.json({ success: true, data: clubs });
});

export const getClub = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id)
    .populate("collegeId", "name")
    .lean();
  if (!club) {
    return res.status(404).json({ success: false, error: "Club not found" });
  }

  const [eventsHosted, registrations] = await Promise.all([
    Event.countDocuments({ clubId: club._id }),
    Registration.countDocuments({
      eventId: { $in: await Event.find({ clubId: club._id }).distinct("_id") },
    }),
  ]);

  res.json({
    success: true,
    data: {
      ...club,
      insights: {
        eventsHosted,
        registrations,
      },
    },
  });
});

export const setClubVerification = asyncHandler(async (req, res) => {
  const { verified } = req.body;
  const club = await Club.findByIdAndUpdate(
    req.params.id,
    { verified: Boolean(verified) },
    { new: true }
  );
  if (!club) {
    return res.status(404).json({ success: false, error: "Club not found" });
  }
  res.json({ success: true, data: club });
});

export const removeClub = asyncHandler(async (req, res) => {
  await Club.findByIdAndUpdate(req.params.id, { removed: true });
  res.json({ success: true });
});

export const suspendClubAdmin = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const user = await User.findByIdAndUpdate(
    userId,
    { role: "student" },
    { new: true }
  );
  res.json({ success: true, data: user });
});

export const assignClubAdmin = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const user = await User.findByIdAndUpdate(
    userId,
    { role: "club_admin" },
    { new: true }
  );
  await Club.findByIdAndUpdate(req.params.id, {
    $addToSet: { admins: user._id },
  });
  res.json({ success: true, data: user });
});

export const getClubInsights = asyncHandler(async (req, res) => {
  const pipeline = [
    { $match: { clubId: req.params.id } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$startAt" },
        },
        events: { $sum: 1 },
        attendees: { $sum: "$attendeesCount" },
      },
    },
    { $sort: { _id: 1 } },
  ];
  const weeklyEvents = await Event.aggregate(pipeline);

  const registrations = await Registration.aggregate([
    {
      $lookup: {
        from: "events",
        localField: "eventId",
        foreignField: "_id",
        as: "event",
      },
    },
    { $unwind: "$event" },
    {
      $match: {
        "event.clubId": new mongoose.Types.ObjectId(req.params.id),
      },
    },
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

  res.json({
    success: true,
    data: {
      weeklyEvents,
      registrations,
    },
  });
});
