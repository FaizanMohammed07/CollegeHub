import PlatformSetting from "../schemas/PlatformSetting.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listSettings = asyncHandler(async (req, res) => {
  const settings = await PlatformSetting.find().lean();
  res.json({ success: true, data: settings });
});

export const upsertSetting = asyncHandler(async (req, res) => {
  const { key, value, description, category } = req.body;
  const setting = await PlatformSetting.findOneAndUpdate(
    { key },
    { value, description, category, updatedBy: req.superAdmin.email },
    { upsert: true, new: true }
  );
  res.json({ success: true, data: setting });
});
