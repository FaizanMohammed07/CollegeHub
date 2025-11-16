import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["registered", "checked-in", "cancelled", "no-show"],
        message:
          "Status must be one of: registered, checked-in, cancelled, no-show",
      },
      default: "registered",
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}, // Stores dynamic form responses
    },
    paymentId: String,
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    seatNumber: String,
    eta: {
      requestedAt: Date,
      estimatedArriveAt: Date,
      provider: String,
      reliabilityScore: {
        type: Number,
        min: 0,
        max: 1,
      },
      distanceMeters: Number,
      etaSeconds: Number,
      polyline: String,
      lastUpdatedAt: Date,
      route: mongoose.Schema.Types.Mixed,
      providerMeta: mongoose.Schema.Types.Mixed,
    },
    checkedInAt: Date,
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancelled: {
      type: Boolean,
      default: false,
    },
    cancellationReason: String,
    cancelledAt: Date,
  },
  {
    timestamps: true,
    indexes: [
      // Prevent duplicate registrations
      { key: { eventId: 1, userId: 1 }, unique: true },
      { key: { eventId: 1, status: 1 } },
      { key: { userId: 1, eventId: 1 } },
      { key: { userId: 1, status: 1 } },
    ],
  }
);

const Registration = mongoose.model("Registration", registrationSchema);

export default Registration;
