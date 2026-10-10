const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const postController = require("../Controllers/postController");
const Notification = require("../Model/Notification");

// Real Auth Middleware (Token decode karke req.user set karega)
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token missing hai." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 1. Token ko bina signature check ke decode karein
    const decoded = jwt.decode(token);

    if (!decoded) {
      return res.status(401).json({ error: "Invalid token format." });
    }

    // Google, Firebase ya Custom Email login sabki id handle ho jayegi
    req.user = { 
      id: decoded.id || decoded._id || decoded.user_id || decoded.sub,
      email: decoded.email 
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: `Auth Error: ${err.message}` });
  }
};

// Optional Auth: Token ho toh req.user set karega, nahi ho toh bhi block nahi karega
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const secret = process.env.JWT_SECRET || "mysecret";
      const decoded = jwt.verify(token, secret);
      req.user = { id: decoded.id };
    } catch (err) {
      // Invalid token ho toh bhi request block mat karo, guest ki tarah aage jane do
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};


// 1. SPECIFIC STATIC ROUTES (Hamesha Upar Rakhein)

// Create Post
router.post("/create", auth, postController.createPost);

// Feed Fetch (friends, trending, recent)
router.get("/feed", optionalAuth, postController.getFeed);

// Reported Posts List
router.get("/reports", auth, postController.getReportedPosts);

// Dismiss / Clear Report
router.put("/reports/:postId/dismiss", auth, postController.dismissReport);

// User Notifications List
router.get("/notifications", auth, async (req, res) => {
  try {
    const list = await Notification.find({ recipient: req.user.id })
      .populate("sender", "name email")
      .sort({ createdAt: -1 })
      .limit(30);
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Notifications Mark As Read
router.put("/notifications/mark-read", auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ message: "Marked all as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 2. DYNAMIC / PARAMETERIZED ROUTES (/:id)

// Like / Unlike Post
router.post("/:id/like", auth, postController.likePost);

// Comment on Post
router.post("/:id/comment", auth, postController.addComment);

// Report Post
router.post("/:id/report", auth, postController.reportPost);

// Edit Post (15-min limit)
router.put("/:id", auth, postController.editPost);

// Delete Post (15-min limit)
router.delete("/:id", auth, postController.deletePost);

module.exports = router;