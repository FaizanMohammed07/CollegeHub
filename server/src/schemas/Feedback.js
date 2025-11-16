import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      index: true,
    },
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      index: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    title: String,
    comment: {
      type: String,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      enum: ["general", "event", "club", "platform"],
    },
    status: {
      type: String,
      enum: ["submitted", "reviewed", "resolved", "closed"],
      default: "submitted",
      index: true,
    },
    attachments: [String],
    removed: {
      type: Boolean,
      default: false,
      index: true,
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    response: String,
    respondedAt: Date,
  },
  {
    timestamps: true,
    indexes: [
      { key: { userId: 1, createdAt: -1 } },
      { key: { status: 1, createdAt: -1 } },
      { key: { eventId: 1, rating: 1 } },
    ],
  }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
