const mongoose = require("mongoose");

// Post Schema: Clean and Optimized
const postSchema = new mongoose.Schema(
  {
    // Post create karne wala user
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Post content
    content: {
      type: String,
      trim: true,
    },

    // Media (image / video)
    mediaUrl: {
      type: String,
    },
    mediaType: {
      type: String,
      enum: ["image", "video", "text"],
      default: "text",
    },

    // Post create karte waqt friend count
    friendCountAtPosting: {
      type: Number,
      default: 0,
    },

    // Privacy setting
    privacy: {
      type: String,
      enum: ["public", "friends"],
      default: "public",
    },

    // Likes array
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Comments array
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Total views count
    viewsCount: {
      type: Number,
      default: 0,
    },

    // Reports array (Report Page ke data ke liye zaroori)
    reports: [
      {
        reportedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: {
          type: String,
          default: "Inappropriate Content",
        },
        reportedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);