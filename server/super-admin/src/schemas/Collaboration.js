import mongoose from "mongoose";

const collaborationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    hostColleges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "College",
      },
    ],
    participatingClubs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club",
      },
    ],
    sponsor: String,
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected", "live"],
      default: "pending",
    },
    schedule: {
      startAt: Date,
      endAt: Date,
    },
    notes: String,
  },
  { timestamps: true }
);

const Collaboration = mongoose.model("Collaboration", collaborationSchema);

export default Collaboration;
