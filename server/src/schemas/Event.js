import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: [true, "Club ID is required"],
      index: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: [true, "College ID is required"],
      index: true,
    },
    coHosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club",
      },
    ],
    posterUrl: String,
    startAt: {
      type: Date,
      required: [true, "Start time is required"],
    },
    endAt: {
      type: Date,
      required: [true, "End time is required"],
    },
    location: {
      name: String,
      address: String,
      coords: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: [true, "Event coordinates are required"],
          validate: {
            validator(v) {
              return (
                v.length === 2 &&
                v[0] >= -180 &&
                v[0] <= 180 &&
                v[1] >= -90 &&
                v[1] <= 90
              );
            },
            message: "Invalid GeoJSON coordinates",
          },
        },
      },
    },
    capacity: {
      type: Number,
      default: 0,
      min: [0, "Capacity cannot be negative"],
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    priceInPaise: {
      type: Number,
      min: [0, "Price cannot be negative"],
      required: function () {
        return this.isPaid;
      },
    },
    attendeesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: {
        values: ["draft", "published", "cancelled", "completed"],
        message:
          "Status must be one of: draft, published, cancelled, completed",
      },
      default: "draft",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    removed: {
      type: Boolean,
      default: false, // Soft delete
      index: true,
    },
    cancellationReason: String,
    cancelledAt: Date,
    tags: [String],
    registrationDeadline: Date,
    requiresApproval: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    indexes: [
      { key: { location: "2dsphere" } },
      { key: { clubId: 1, startAt: 1 } },
      { key: { collegeId: 1, startAt: 1 } },
    ],
  }
);

// Pre-save validation
eventSchema.pre("save", function (next) {
  // Validate startAt < endAt
  if (this.startAt >= this.endAt) {
    const error = new Error("Start time must be before end time");
    error.code = "INVALID_TIME_WINDOW";
    return next(error);
  }

  // Validate startAt is in future (only on creation)
  if (this.isNew && this.startAt <= new Date()) {
    const error = new Error("Event start time must be in the future");
    error.code = "EVENT_TIME_IN_PAST";
    return next(error);
  }

  next();
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
