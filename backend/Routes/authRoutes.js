const express = require("express");
const router = express.Router();
const { sendOtp, register, login, forgotPasswordOtp, resetPassword  } = require("../Controllers/authController");

router.post("/send-otp", sendOtp);
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password-otp", forgotPasswordOtp);
router.post("/reset-password", resetPassword);

router.get("/test", (req, res) => {
  res.send("Auth route is working!");
});
module.exports = router;