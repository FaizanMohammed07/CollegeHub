import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "event_update",
        "registration_confirmed",
        "checkin_reminder",
        "event_cancelled",
        "comment_on_post",
        "post_published",
        "club_invitation",
        "system_alert",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: String,
    relatedId: mongoose.Schema.Types.ObjectId,
    relatedType: String,
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: Date,
    actionUrl: String,
  },
  {
    timestamps: true,
    indexes: [
      { key: { userId: 1, read: 1, createdAt: -1 } },
      { key: { userId: 1, createdAt: -1 } },
    ],
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
