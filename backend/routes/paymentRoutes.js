const express = require("express");

const {
  createPayment,
  getPayments,
  getMembershipPayments,
  getPaymentById,
} = require("../controllers/paymentController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Record payment
router.post("/", protect, authorizeRoles("admin"), createPayment);

// All payments
router.get("/", protect, authorizeRoles("admin", "trainer"), getPayments);

// Payments of a membership
router.get(
  "/membership/:membershipId",
  protect,
  authorizeRoles("admin", "trainer", "member"),
  getMembershipPayments,
);

// Single payment
router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "trainer", "member"),
  getPaymentById,
);

module.exports = router;
