import crypto from "crypto";
import User from "../../../src/schemas/User.js";
import Registration from "../../../src/schemas/Registration.js";
import Club from "../../../src/schemas/Club.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listUsers = asyncHandler(async (req, res) => {
  const { role, search, collegeId } = req.query;
  const query = {};
  if (role) query.role = role;
  if (collegeId) query.collegeId = collegeId;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(query)
    .select("name email role collegeId blocked isVerified createdAt")
    .populate("collegeId", "name")
    .limit(200)
    .lean();

  res.json({ success: true, data: users });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate("collegeId", "name")
    .lean();
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  const [registrations, clubs] = await Promise.all([
    Registration.find({ userId: user._id })
      .populate({ path: "eventId", select: "title startAt" })
      .lean(),
    Club.find({ members: user._id }).select("name").lean(),
  ]);

  res.json({
    success: true,
    data: {
      user,
      stats: {
        registrations: registrations.length,
        clubsJoined: clubs.length,
      },
      registrations,
      clubs,
    },
  });
});

export const banUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { blocked: true },
    { new: true }
  );
  res.json({ success: true, data: user });
});

export const unbanUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { blocked: false },
    { new: true }
  );
  res.json({ success: true, data: user });
});

export const changeRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  );
  res.json({ success: true, data: user });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const newPassword =
    req.body.newPassword || crypto.randomBytes(8).toString("hex");
  const user = await User.findById(req.params.id).select("password");
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, data: { tempPassword: newPassword } });
});
