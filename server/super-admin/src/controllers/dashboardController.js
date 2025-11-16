import dayjs from "dayjs";
import College from "../../../src/schemas/College.js";
import Club from "../../../src/schemas/Club.js";
import Event from "../../../src/schemas/Event.js";
import Registration from "../../../src/schemas/Registration.js";
import User from "../../../src/schemas/User.js";
import Report from "../schemas/Report.js";
import ClubAdminRequest from "../schemas/ClubAdminRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getOverview = asyncHandler(async (req, res) => {
  const [
    totalColleges,
    totalClubs,
    verifiedClubs,
    pendingRequests,
    totalEvents,
    liveEvents,
    totalUsers,
    dailyActiveUsers,
    pendingReports,
  ] = await Promise.all([
    College.countDocuments(),
    Club.countDocuments({ removed: { $ne: true } }),
    Club.countDocuments({ verified: true }),
    ClubAdminRequest.countDocuments({ status: "pending" }),
    Event.countDocuments({ removed: { $ne: true } }),
    Event.countDocuments({
      status: "published",
      startAt: { $lte: new Date() },
      endAt: { $gte: new Date() },
    }),
    User.countDocuments(),
    User.countDocuments({
      lastSeenAt: { $gte: dayjs().subtract(1, "day").toDate() },
    }),
    Report.countDocuments({ status: "pending" }),
  ]);

  const eventsPerDay = await Event.aggregate([
    {
      $match: {
        createdAt: { $gte: dayjs().subtract(13, "day").toDate() },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const registrationsThisWeek = await Registration.aggregate([
    {
      $match: {
        createdAt: { $gte: dayjs().subtract(6, "day").startOf("day").toDate() },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const mostActiveColleges = await Event.aggregate([
    {
      $group: {
        _id: "$collegeId",
        events: { $sum: 1 },
        attendees: { $sum: "$attendeesCount" },
      },
    },
    { $sort: { events: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "colleges",
        localField: "_id",
        foreignField: "_id",
        as: "college",
      },
    },
    { $unwind: "$college" },
    {
      $project: {
        _id: 0,
        collegeId: "$college._id",
        name: "$college.name",
        events: 1,
        attendees: 1,
      },
    },
  ]);

  const mostActiveClubs = await Event.aggregate([
    {
      $group: {
        _id: "$clubId",
        events: { $sum: 1 },
        attendees: { $sum: "$attendeesCount" },
      },
    },
    { $sort: { attendees: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "clubs",
        localField: "_id",
        foreignField: "_id",
        as: "club",
      },
    },
    { $unwind: "$club" },
    {
      $project: {
        _id: 0,
        clubId: "$club._id",
        name: "$club.name",
        events: 1,
        attendees: 1,
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      cards: {
        totalColleges,
        totalClubs,
        verifiedClubs,
        pendingClubAdminRequests: pendingRequests,
        totalEvents,
        liveEvents,
        totalUsers,
        dailyActiveUsers,
        pendingReports,
      },
      charts: {
        eventsPerDay,
        registrationsThisWeek,
        mostActiveColleges,
        mostActiveClubs,
      },
    },
  });
});
