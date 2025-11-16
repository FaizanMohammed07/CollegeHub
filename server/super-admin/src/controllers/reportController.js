import Report from "../schemas/Report.js";
import User from "../../../src/schemas/User.js";
import Club from "../../../src/schemas/Club.js";
import Event from "../../../src/schemas/Event.js";
import Post from "../../../src/schemas/Post.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const autoSuspend = async (report) => {
  const count = await Report.countDocuments({
    targetType: report.targetType,
    targetId: report.targetId,
    status: "resolved",
    autoSuspended: true,
  });

  if (count + 1 < 3) return;

  if (report.targetType === "user") {
    await User.findByIdAndUpdate(report.targetId, { blocked: true });
  }
  if (report.targetType === "club") {
    await Club.findByIdAndUpdate(report.targetId, { removed: true });
  }
  if (report.targetType === "event") {
    await Event.findByIdAndUpdate(report.targetId, { status: "cancelled" });
  }
  if (report.targetType === "post") {
    await Post.findByIdAndUpdate(report.targetId, { removed: true });
  }
};

export const listReports = asyncHandler(async (req, res) => {
  const { status, targetType } = req.query;
  const query = {};
  if (status) query.status = status;
  if (targetType) query.targetType = targetType;
  const reports = await Report.find(query)
    .populate("reporterId", "name email")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  res.json({ success: true, data: reports });
});

export const resolveReport = asyncHandler(async (req, res) => {
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    {
      status: "resolved",
      resolvedAt: new Date(),
      resolvedBy: req.superAdmin.email,
      actionTaken: req.body.action,
      autoSuspended: req.body.autoSuspend || false,
    },
    { new: true }
  );
  if (req.body.autoSuspend) {
    await autoSuspend(report);
  }
  res.json({ success: true, data: report });
});

export const rejectReport = asyncHandler(async (req, res) => {
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    {
      status: "rejected",
      resolvedAt: new Date(),
      resolvedBy: req.superAdmin.email,
      resolution: req.body.reason,
    },
    { new: true }
  );
  res.json({ success: true, data: report });
});
