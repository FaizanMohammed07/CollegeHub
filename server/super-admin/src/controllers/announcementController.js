import Post from "../../../src/schemas/Post.js";
import PlatformAnnouncement from "../schemas/PlatformAnnouncement.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listPosts = asyncHandler(async (req, res) => {
  const { status, clubId } = req.query;
  const query = { removed: { $ne: true } };
  if (status) query.status = status;
  if (clubId) query.clubId = clubId;
  const posts = await Post.find(query)
    .populate("clubId", "name")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  res.json({ success: true, data: posts });
});

export const flagPost = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { status: "moderation", moderationReason: req.body.reason },
    { new: true }
  );
  res.json({ success: true, data: post });
});

export const unflagPost = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { status: "published", moderationReason: null },
    { new: true }
  );
  res.json({ success: true, data: post });
});

export const deletePost = asyncHandler(async (req, res) => {
  await Post.findByIdAndUpdate(req.params.id, { removed: true });
  res.json({ success: true });
});

export const listAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await PlatformAnnouncement.find()
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: announcements });
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await PlatformAnnouncement.create({
    ...req.body,
    createdBy: req.superAdmin.email,
  });
  res.status(201).json({ success: true, data: announcement });
});
