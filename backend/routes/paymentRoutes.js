const express = require("express");

const {
  createPayment,
  getPayments,
  getMembershipPayments,
  getPaymentById,
} = require("../controllers/paymentController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const checkGymSubscription = require("../middleware/gymSubscriptionMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  checkGymSubscription,
  authorizeRoles("admin"),
  createPayment,
);

router.get(
  "/",
  protect,
  checkGymSubscription,
  authorizeRoles("admin", "trainer"),
  getPayments,
);

router.get(
  "/membership/:membershipId",
  protect,
  checkGymSubscription,
  authorizeRoles("admin", "trainer", "member"),
  getMembershipPayments,
);

router.get(
  "/:id",
  protect,
  checkGymSubscription,
  authorizeRoles("admin", "trainer", "member"),
  getPaymentById,
);

module.exports = router;