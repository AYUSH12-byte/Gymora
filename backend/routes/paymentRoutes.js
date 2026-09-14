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

router.post("/", protect, authorizeRoles("admin"), createPayment);

router.get("/", protect, authorizeRoles("admin", "trainer"), getPayments);

router.get(
  "/membership/:membershipId",
  protect,
  authorizeRoles("admin", "trainer", "member"),
  getMembershipPayments,
);

router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "trainer", "member"),
  getPaymentById,
);

module.exports = router;
