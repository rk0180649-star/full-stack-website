const mongoose = require("mongoose");

const planHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.String,
    ref: "User",
  },
  email: {
    type: String,
    required: true,
  },
  planId: {
    type: String, // BRONZE, SILVER, GOLD
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  quota: {
    type: Number,
    required: true,
  },
  razorpayOrderId: {
    type: String,
    required: true,
  },
  razorpayPaymentId: {
    type: String,
    required: true,
  },
  planStartDate: {
    type: Date,
    default: Date.now,
  },
  planEndDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PlanHistory", planHistorySchema);