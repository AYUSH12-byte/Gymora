const express = require("express");

const {
  getMyPaymentSummary,
  payMembershipBalance,
} = require("../controllers/memberPaymentController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Get logged-in member payment summary
router.get("/summary", protect, authorizeRoles("member"), getMyPaymentSummary);

// Pay membership balance
router.post(
  "/pay-balance",
  protect,
  authorizeRoles("member"),
  payMembershipBalance,
);

module.exports = router;
