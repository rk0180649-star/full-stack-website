const mongoose = require("mongoose");

// Friendship Schema: Request bhejne aur accept karne ke liye
const friendshipSchema = new mongoose.Schema(
  {
    // Request bhejne wala user
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Request pane wala user
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Friendship ka status
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Friendship", friendshipSchema);