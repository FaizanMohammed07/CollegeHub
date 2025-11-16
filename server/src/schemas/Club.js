import mongoose from "mongoose";

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Club name is required"],
      trim: true,
      minlength: [2, "Club name must be at least 2 characters"],
      maxlength: [100, "Club name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      index: true,
      validate: {
        validator(v) {
          return /^[a-z0-9-]+$/.test(v);
        },
        message:
          "Slug can only contain lowercase letters, numbers, and hyphens",
      },
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    logoUrl: String,
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: [true, "College ID is required"],
      index: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    removed: {
      type: Boolean,
      default: false, // Soft delete
      index: true,
    },
    membersCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    websiteUrl: String,
    socialLinks: {
      instagram: String,
      twitter: String,
      facebook: String,
      linkedin: String,
    },
    category: {
      type: String,
      enum: [
        "academic",
        "cultural",
        "sports",
        "technical",
        "professional",
        "hobby",
        "other",
      ],
    },
  },
  {
    timestamps: true,
    indexes: [{ key: { collegeId: 1, slug: 1 }, unique: true }],
  }
);

// Text index for search
clubSchema.index({ name: "text", description: "text" });

const Club = mongoose.model("Club", clubSchema);

export default Club;
