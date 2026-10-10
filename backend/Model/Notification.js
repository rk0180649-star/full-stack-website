const mongoose = require("mongoose");

// Notification Schema: Alerts aur activity ke liye
const notificationSchema = new mongoose.Schema(
  {
    // Jisko notification milega
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Jisne action perform kiya (like, comment, req bheja)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Notification kis type ka hai
    type: {
      type: String,
      enum: ["like", "comment", "friend_request", "friend_accept", "follow", "mention"],
      required: true,
    },
    // Kis post se related hai (optional, friend_request me nahi hoga)
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    // Read status
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);