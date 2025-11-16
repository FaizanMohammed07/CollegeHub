import mongoose from "mongoose";

const platformAnnouncementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    target: {
      type: String,
      enum: ["all", "colleges", "club_admins", "roles"],
      default: "all",
    },
    colleges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "College",
      },
    ],
    roles: [String],
    status: {
      type: String,
      enum: ["draft", "scheduled", "sent"],
      default: "draft",
    },
    scheduledAt: Date,
    sentAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const PlatformAnnouncement = mongoose.model(
  "PlatformAnnouncement",
  platformAnnouncementSchema
);

export default PlatformAnnouncement;
