const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const friendController = require("../Controllers/friendController");

// Safe Auth Middleware (Google & Email dono ke liye)
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "You need to log in first." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.decode(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token format." });
    }

    req.user = {
      id: decoded.id || decoded._id || decoded.user_id || decoded.sub,
      email: decoded.email,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: `Invalid token: ${err.message}` });
  }
};

// Routes
router.post("/request", auth, friendController.sendRequest);
router.post("/respond", auth, friendController.respondRequest);
router.get("/list", auth, friendController.getMyFriends);
router.post("/users/:targetUserId/toggle-follow", auth, friendController.toggleFollow);
router.delete("/remove/:targetUserId", auth, friendController.removeFriend);

module.exports = router;