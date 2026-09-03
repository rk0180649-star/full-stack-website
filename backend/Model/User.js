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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);