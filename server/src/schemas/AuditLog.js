import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, "Action is required"],
      index: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ["User", "Event", "Club", "Post", "Registration", "College"],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    changes: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed,
    },
    reason: String,
    ipAddress: String,
    userAgent: String,
    statusCode: Number,
  },
  {
    timestamps: true,
    indexes: [
      { key: { actorId: 1, createdAt: -1 } },
      { key: { targetType: 1, targetId: 1 } },
      { key: { action: 1, createdAt: -1 } },
    ],
  }
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
