const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
   mobile: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: true
  },
  lastPasswordReset: {
    type: Date,
    default: null
  },
  hasPurchasedResume: {
  type: Boolean,
  default: false,
},
purchasedResumeId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "ResumeHistory",
},
 currentPlan: {
    type: String,
    enum: ["FREE", "BRONZE", "SILVER", "GOLD"],
    default: "FREE",
  },
  planStatus: {
    type: String,
    enum: ["ACTIVE", "EXPIRED", "CANCELLED"],
    default: "ACTIVE",
  },
    applicationQuota: {
    type: Number,
    default: 1,
  },
  applicationsUsed: {
    type: Number,
    default: 0,
  },
  planStartDate: {
    type: Date,
  },
  planEndDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);