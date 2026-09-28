// server/Model/LoginLog.js
const mongoose = require("mongoose");

const loginLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Agar user exist na kare tab bhi log record ho
  },
  email: { type: String, required: true },
  ipAddress: { type: String, required: true },
  browserName: { type: String, default: "Unknown" },
  browserVersion: { type: String, default: "Unknown" },
  os: { type: String, default: "Unknown" },
  deviceType: { type: String, default: "desktop" }, // desktop, mobile, tablet
  deviceModel: { type: String, default: "Generic" },
  city: { type: String, default: "Unknown" },
  country: { type: String, default: "Unknown" },
  status: {
    type: String,
    enum: ["SUCCESS", "FAILED", "BLOCKED", "OTP_PENDING"],
    required: true,
  },
  failureReason: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LoginLog", loginLogSchema);