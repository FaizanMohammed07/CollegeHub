import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
      maxlength: [5000, "Content cannot exceed 5000 characters"],
    },
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: [true, "Club ID is required"],
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: String,
    status: {
      type: String,
      enum: {
        values: ["draft", "published", "archived", "moderation"],
        message:
          "Status must be one of: draft, published, archived, moderation",
      },
      default: "draft",
      index: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        content: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    commentsCount: {
      type: Number,
      default: 0,
    },
    tags: [String],
    removed: {
      type: Boolean,
      default: false, // Soft delete
      index: true,
    },
    moderationReason: String,
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    indexes: [
      { key: { clubId: 1, status: 1 } },
      { key: { createdBy: 1, status: 1 } },
      { key: { status: 1, createdAt: -1 } },
    ],
  }
);

// Text index for search
postSchema.index({ title: "text", content: "text", tags: "text" });

const Post = mongoose.model("Post", postSchema);

export default Post;
