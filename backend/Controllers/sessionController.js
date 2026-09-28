// server/Controllers/sessionController.js
const Session = require("../Model/Session");
const LoginLog = require("../Model/LoginLog");

// Active sessions fetch karna
exports.getActiveSessions = async (req, res) => {
 const userId = req.user?.id || req.query.userId;
const sessions = await Session.find({ userId: userId }).sort({ lastActiveAt: -1 });
  res.json({ success: true, sessions });
};


// 1. Active sessions fetch karna
exports.getActiveSessions = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const email = req.query.email;

    // userId ya email kisi se bhi search karein
    const query = userId ? { userId } : (email ? { email } : {});
    const sessions = await Session.find(query).sort({ lastActiveAt: -1 });

    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 2. Kisi specific session ko revoke karna
exports.revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    await Session.findByIdAndDelete(sessionId);
    res.json({ success: true, message: "Session revoked successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Current device ke alawa baaki sabhi devices ko logout karna
exports.logoutOtherSessions = async (req, res) => {
  const userId = req.user?.id || req.body.userId;
  const currentToken = req.headers.authorization?.replace("Bearer ", "");

  await Session.deleteMany({ userId, token: { $ne: currentToken } });
  res.json({ success: true, message: "Logged out from all other devices." });
};

// Login logs / history fetch karna
exports.getLoginHistory = async (req, res) => {
  try {
    const email = req.query.email;
    const logs = await LoginLog.find(email ? { email } : {}).sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};