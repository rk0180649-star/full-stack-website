// server/Routes/authRoutes.js
const express = require("express");
const router = express.Router();

const { login, verifyOtp } = require("../Controllers/securityAuthController");
const {
  getActiveSessions,
  revokeSession,
  logoutOtherSessions,
  getLoginHistory,
} = require("../Controllers/sessionController");

// Auth Endpoints
router.post("/login", login);
router.post("/verify-otp", verifyOtp);

// Sessions & History Endpoints
router.get("/sessions", getActiveSessions);
router.delete("/sessions/:sessionId", revokeSession);
router.post("/sessions/logout-others", logoutOtherSessions);
router.get("/login-history", getLoginHistory);

module.exports = router;