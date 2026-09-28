const express = require("express");
const router = express.Router();
const { sendOtp, register, login, forgotPasswordOtp, resetPassword, recordEmailLoginSecurity  } = require("../Controllers/authController");
const User = require("../Model/User");

router.post("/send-otp", sendOtp);
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password-otp", forgotPasswordOtp);
router.post("/reset-password", resetPassword);

// Google Login SUCCESS log aur Session record karne ke liye:
router.post("/record-login", async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = { email, _id: undefined };
    }

    await recordEmailLoginSecurity(req, user);

    return res.status(200).json({ success: true, message: "Google login recorded" });
  } catch (error) {
    console.error("Google record-login error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});


router.get("/test", (req, res) => {
  res.send("Auth route is working!");
});
module.exports = router;

