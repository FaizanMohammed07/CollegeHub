import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema(
  {
    superAdminEmail: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    targetType: String,
    targetId: mongoose.Schema.Types.ObjectId,
    metadata: mongoose.Schema.Types.Mixed,
    ipAddress: String,
  },
  { timestamps: true }
);

const AdminLog = mongoose.model("AdminLog", adminLogSchema);

export default AdminLog;
