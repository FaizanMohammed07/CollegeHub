import dayjs from "dayjs";
import Event from "../../../src/schemas/Event.js";
import Registration from "../../../src/schemas/Registration.js";
import Club from "../../../src/schemas/Club.js";
import User from "../../../src/schemas/User.js";
import PlatformAnnouncement from "../schemas/PlatformAnnouncement.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getPlatformAnalytics = asyncHandler(async (req, res) => {
  const [
    eventsPerDay,
    registrationsPerEvent,
    mostActiveClubs,
    fastestGrowingClubs,
    mostEngagingAnnouncements,
    bestColleges,
    dau,
    wau,
    mau,
  ] = await Promise.all([
    Event.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startAt" } },
          events: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Registration.aggregate([
      {
        $group: {
          _id: "$eventId",
          registrations: { $sum: 1 },
        },
      },
      { $sort: { registrations: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: "events",
          localField: "_id",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      {
        $project: {
          eventId: "$event._id",
          title: "$event.title",
          registrations: 1,
        },
      },
    ]),
    Event.aggregate([
      {
        $group: {
          _id: "$clubId",
          events: { $sum: 1 },
          attendees: { $sum: "$attendeesCount" },
        },
      },
      { $sort: { attendees: -1 } },
      { $limit: 10 },
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
          clubId: "$club._id",
          name: "$club.name",
          events: 1,
          attendees: 1,
        },
      },
    ]),
    Club.find({ verified: true })
      .sort({ membersCount: -1 })
      .limit(10)
      .select("name membersCount"),
    PlatformAnnouncementsAggregation(),
    Event.aggregate([
      {
        $group: {
          _id: "$collegeId",
          events: { $sum: 1 },
          attendees: { $sum: "$attendeesCount" },
        },
      },
      { $sort: { attendees: -1 } },
      { $limit: 10 },
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
          collegeId: "$college._id",
          name: "$college.name",
          events: 1,
          attendees: 1,
        },
      },
    ]),
    User.countDocuments({
      lastSeenAt: { $gte: dayjs().subtract(1, "day").toDate() },
    }),
    User.countDocuments({
      lastSeenAt: { $gte: dayjs().subtract(7, "day").toDate() },
    }),
    User.countDocuments({
      lastSeenAt: { $gte: dayjs().subtract(30, "day").toDate() },
    }),
  ]);

  res.json({
    success: true,
    data: {
      eventsPerDay,
      registrationsPerEvent,
      mostActiveClubs,
      fastestGrowingClubs,
      mostEngagingAnnouncements,
      bestColleges,
      users: {
        dau,
        wau,
        mau,
      },
    },
  });
});

const PlatformAnnouncementsAggregation = async () => {
  return PlatformAnnouncement.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select("title target createdAt")
    .lean();
};
