import AdminLog from "../schemas/AdminLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listLogs = asyncHandler(async (req, res) => {
  const logs = await AdminLog.find().sort({ createdAt: -1 }).limit(200).lean();
  res.json({ success: true, data: logs });
});

export const recordLog = async (action, metadata, req) => {
  await AdminLog.create({
    superAdminEmail: req?.superAdmin?.email || "system",
    action,
    metadata,
    ipAddress: req?.ip,
  });
};
