const express = require("express");
const router = express.Router();
const {
  sendResumeOtp,
  verifyResumeOtp,
  createOrder,
  verifyPaymentAndGenerate,
} = require("../Controllers/resumeController");

router.post("/send-otp", sendResumeOtp);
router.post("/verify-otp", verifyResumeOtp);
router.post("/create-order", createOrder);
router.post("/verify-and-generate", verifyPaymentAndGenerate);

module.exports = router;