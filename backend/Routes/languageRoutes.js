const express = require("express");
const router = express.Router();
const { sendLanguageOtp, verifyLanguageOtp } = require("../Controllers/languageController");

router.post("/send-language-otp", sendLanguageOtp);
router.post("/verify-language-otp", verifyLanguageOtp);

module.exports = router;