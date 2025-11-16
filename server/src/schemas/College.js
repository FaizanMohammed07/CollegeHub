import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "College name is required"],
      trim: true,
      unique: true,
      index: true,
    },
    domain: {
      type: String,
      lowercase: true,
      validate: {
        validator(v) {
          return !v || /^[a-z0-9.-]+\.[a-z]{2,}$/.test(v);
        },
        message: "Invalid email domain format",
      },
    },
    address: String,
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
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    logoUrl: String,
    websiteUrl: String,
    contactEmail: {
      type: String,
      validate: {
        validator(v) {
          return !v || /.+@.+\..+/.test(v);
        },
        message: "Invalid contact email",
      },
    },
    contactPhone: {
      type: String,
      validate: {
        validator(v) {
          return !v || /^\+?\d{7,15}$/.test(v);
        },
        message: "Invalid phone number",
      },
    },
  },
  {
    timestamps: true,
    indexes: [{ key: { location: "2dsphere" } }, { key: { domain: 1 } }],
  }
);

const College = mongoose.model("College", collegeSchema);

export default College;
