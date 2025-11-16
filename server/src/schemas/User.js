import mongoose from "mongoose";
import { hashPassword, validatePasswordStrength } from "../utils/security.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/.+@.+\..+/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      validate: {
        validator(v) {
          return !v || /^\+?\d{7,15}$/.test(v);
        },
        message:
          "Phone number must be between 7-15 digits, optionally starting with +",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: {
        values: ["student", "club_admin", "college_admin", "super_admin"],
        message:
          "Role must be one of: student, club_admin, college_admin, super_admin",
      },
      default: "student",
      index: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: [true, "College is required"],
      index: true,
    },
    profilePicUrl: String,
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    blocked: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastSeenAt: Date,
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
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
    lastRefreshToken: {
      type: String,
      select: false,
    },
    refreshTokenVersion: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  {
    timestamps: true,
    indexes: [
      { key: { location: "2dsphere" } },
      { key: { email: 1 }, unique: true },
      { key: { collegeId: 1 } },
    ],
  }
);

// Pre-save hook to hash password if modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (!validatePasswordStrength(this.password)) {
    const error = new Error(
      "Password must contain at least 8 characters, including uppercase, lowercase, number, and special character (@$!%*?&)"
    );
    error.code = "WEAK_PASSWORD";
    return next(error);
  }

  try {
    this.password = await hashPassword(this.password);
    next();
  } catch (error) {
    next(error);
  }
});

// Virtual for user's initials
userSchema.virtual("initials").get(function () {
  return this.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

// Method to hide sensitive fields
userSchema.methods.toJSON = function () {
  const userObject = this.toObject({ virtuals: true });
  delete userObject.password;
  if (userObject.collegeId && typeof userObject.collegeId === "object") {
    userObject.college = userObject.collegeId;
  }
  return userObject;
};

// Static method to find by email with password
userSchema.statics.findByEmailWithPassword = function (email) {
  return this.findOne({ email: email.toLowerCase() }).select("+password");
};

const User = mongoose.model("User", userSchema);

export default User;
