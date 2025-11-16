import mongoose from "mongoose";

const collegePolicySchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      unique: true,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "disabled", "suspended"],
      default: "active",
    },
    notes: String,
    lastActionBy: String,
    lastActionAt: Date,
  },
  { timestamps: true }
);

const CollegePolicy = mongoose.model("CollegePolicy", collegePolicySchema);

export default CollegePolicy;
