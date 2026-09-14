const express = require("express");
const router = express.Router();

// Controller import kiya
const { applyForOpportunity } = require("../Controllers/applyController");

// Route ko controller function se connect kiya
router.post("/", applyForOpportunity);

module.exports = router;