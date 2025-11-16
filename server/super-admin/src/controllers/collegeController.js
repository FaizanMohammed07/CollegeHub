import mongoose from "mongoose";
import College from "../../../src/schemas/College.js";
import Club from "../../../src/schemas/Club.js";
import Event from "../../../src/schemas/Event.js";
import User from "../../../src/schemas/User.js";
import CollegePolicy from "../schemas/CollegePolicy.js";
import ClubAdminRequest from "../schemas/ClubAdminRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const objectId = (id) => new mongoose.Types.ObjectId(id);

const attachMetrics = async (college) => {
  const [students, activeEvents, clubs, pendingVerifications] =
    await Promise.all([
      User.countDocuments({ collegeId: college._id }),
      Event.countDocuments({
        collegeId: college._id,
        startAt: { $gte: new Date() },
        status: "published",
      }),
      Club.countDocuments({ collegeId: college._id, removed: { $ne: true } }),
      ClubAdminRequest.countDocuments({
        collegeId: college._id,
        status: "pending",
      }),
    ]);

  const policy =
    (await CollegePolicy.findOne({ collegeId: college._id }).lean()) || {};

  return {
    ...college,
    metrics: {
      students,
      activeEvents,
      clubs,
      pendingVerifications,
    },
    policy,
  };
};

export const listColleges = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const query = {};
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }
  const colleges = await College.find(query).sort({ name: 1 }).lean();
  const enriched = await Promise.all(colleges.map(attachMetrics));
  res.json({ success: true, data: enriched });
});

export const createCollege = asyncHandler(async (req, res) => {
  const college = await College.create(req.body);
  res.status(201).json({ success: true, data: college });
});

export const getCollege = asyncHandler(async (req, res) => {
  const college = await College.findById(req.params.id).lean();
  if (!college) {
    return res.status(404).json({ success: false, error: "College not found" });
  }
  const enriched = await attachMetrics(college);
  res.json({ success: true, data: enriched });
});

export const updateCollege = asyncHandler(async (req, res) => {
  const college = await College.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!college) {
    return res.status(404).json({ success: false, error: "College not found" });
  }
  res.json({ success: true, data: college });
});

export const setCollegeStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const allowed = ["active", "disabled", "suspended"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, error: "Invalid status" });
  }
  const policy = await CollegePolicy.findOneAndUpdate(
    { collegeId: req.params.id },
    {
      status,
      notes,
      lastActionBy: req.superAdmin.email,
      lastActionAt: new Date(),
    },
    { upsert: true, new: true }
  );
  res.json({ success: true, data: policy });
});

export const getCollegeAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({
    collegeId: req.params.id,
    role: "college_admin",
  })
    .select("name email role")
    .lean();
  res.json({ success: true, data: admins });
});

export const addCollegeAdmin = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const user = await User.findByIdAndUpdate(
    userId,
    { role: "college_admin", collegeId: req.params.id },
    { new: true }
  );
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }
  await College.findByIdAndUpdate(req.params.id, {
    $addToSet: { admins: user._id },
  });
  res.json({ success: true, data: user });
});

export const listCollegeEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ collegeId: req.params.id })
    .sort({ startAt: -1 })
    .limit(100)
    .lean();
  res.json({ success: true, data: events });
});

export const listCollegeClubs = asyncHandler(async (req, res) => {
  const clubs = await Club.find({
    collegeId: req.params.id,
    removed: { $ne: true },
  })
    .sort({ name: 1 })
    .lean();
  res.json({ success: true, data: clubs });
});

export const deleteCollege = asyncHandler(async (req, res) => {
  await CollegePolicy.findOneAndUpdate(
    { collegeId: req.params.id },
    { status: "suspended", lastActionBy: req.superAdmin.email },
    { upsert: true }
  );
  res.json({ success: true });
});
