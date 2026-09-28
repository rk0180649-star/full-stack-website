const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  email: { type: String, required: true }, // <-- Yeh zaroori hai
  token: { type: String, required: true, unique: true },
  deviceFingerprint: { type: String }, // required: true hata diya
  browser: { type: String },
  browserName: { type: String },
  os: { type: String },
  deviceType: { type: String },
  ipAddress: { type: String },
  location: { type: String },
  isTrusted: { type: Boolean, default: false },
  lastActiveAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// Database level par duplicate rokne ke liye Compound Unique Index:
sessionSchema.index({ email: 1, browser: 1, os: 1 }, { unique: true });

module.exports = mongoose.model("Session", sessionSchema);