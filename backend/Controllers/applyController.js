const express = require("express");
const router = express.Router();
const Application = require("../Model/Application");
const User = require("../Model/User");

// Candidate Apply Controller
exports.applyForOpportunity = async (req, res) => {
  try {
    const { company, category, coverLetter, user, Application: appData } = req.body;

    // 1. User email / ID check
    const candidateEmail = (user?.email || user?.user?.email || "").toLowerCase().trim();
    const candidateId = user?._id || user?.uid;

    if (!candidateEmail && !candidateId) {
      return res.status(400).json({
        success: false,
        message: "User details missing. Please login first.",
      });
    }

    // 2. Database me user dhundhna
    let dbUser = null;
    if (candidateEmail) {
      dbUser = await User.findOne({ email: candidateEmail });
    } else if (candidateId) {
      dbUser = await User.findById(candidateId);
    }

    if (!dbUser) {
      return res.status(404).json({ success: false, message: "User not found. Register first." });
    }

    // 3. Quota check (Gold plan = Unlimited)
    const isGold = dbUser.currentPlan === "GOLD";
    const quota = dbUser.applicationQuota || 1;
    const used = dbUser.applicationsUsed || 0;

    if (!isGold && used >= quota) {
      return res.status(403).json({
        success: false,
        limitReached: true,
        message: `your monthly limit (${used}/${quota}) is over. Please upgrade your plan!`,
      });
    }

    // 4. Save Application
    const newApplication = new Application({
      company,
      category,
      coverLetter,
      user,
      Application: appData,
      status: "pending",
    });
    const savedData = await newApplication.save();

    // 5. Quota Deduction (+1 count)
    const updatedUser = await User.findByIdAndUpdate(
      dbUser._id,
      { $inc: { applicationsUsed: 1 } },
      { new: true }
    );

    console.log(`[QUOTA DEDUCTED via Controller] ${dbUser.email}: ${updatedUser.applicationsUsed}/${updatedUser.applicationQuota}`);

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
      data: savedData,
      remainingQuota: isGold ? "Unlimited" : (updatedUser.applicationQuota - updatedUser.applicationsUsed),
    });

  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};