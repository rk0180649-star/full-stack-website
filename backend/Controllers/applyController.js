const express = require("express");
const router = express.Router();
const Application = require("../Model/Application");
const User = require("../Model/User");

// Candidate Apply Controller
exports.applyForOpportunity = async (req, res) => {
  try {
    const { company, category, coverLetter, user, Application: appData } = req.body;
      // candidate email nikalne ke baad:
      const candidateEmail = (
        req.body.email ||
        req.body.user?.email ||
        req.body.user?.user?.email ||
        ""
      ).toLowerCase().trim();

      if (!candidateEmail) {
        return res.status(400).json({
          success: false,
          message: "Candidate email is missing.",
        });
      }

// 1. Database me find karein
      let dbUser = await User.findOne({ email: candidateEmail });

      // 👉 MAGIC FIX: Agar Google user database me nahi hai, toh use Free plan me turant bana do!
      if (!dbUser) {
        dbUser = await User.create({
          name: req.body.user?.name || req.body.user?.displayName || "Google Candidate",
          email: candidateEmail,
          currentPlan: "FREE",
          planStatus: "ACTIVE",
          applicationQuota: 1,
          applicationsUsed: 0,
        });
        console.log("Auto-registered new Google user on Free apply:", candidateEmail);
      }
        // 2. Ab Quota check karein (ab kabhi "User not found" nahi aayega!)
        const isGold = dbUser.currentPlan === "GOLD";
        const quota = dbUser.applicationQuota || 1;
        const used = dbUser.applicationsUsed || 0;

        if (!isGold && used >= quota) {
          return res.status(403).json({
            success: false,
            limitReached: true,
            message: `Aapka monthly limit (${used}/${quota}) khatam ho chuka hai. Please plan upgrade karein!`,
          });
        }

    // 3. Save Application
    const newApplication = new Application({
      company,
      category,
      coverLetter,
      user,
      Application: appData,
      status: "pending",
    });
    const savedData = await newApplication.save();

    // 4. Quota Deduction (+1 count)
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