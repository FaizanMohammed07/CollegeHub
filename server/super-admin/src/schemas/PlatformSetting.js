import mongoose from "mongoose";

const platformSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    description: String,
    category: {
      type: String,
      default: "general",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const PlatformSetting = mongoose.model(
  "PlatformSetting",
  platformSettingSchema
);

export default PlatformSetting;
