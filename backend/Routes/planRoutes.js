const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getUserSubscription,
} = require("../Controllers/planController");

router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);
router.get("/subscription-status", getUserSubscription);

module.exports = router;