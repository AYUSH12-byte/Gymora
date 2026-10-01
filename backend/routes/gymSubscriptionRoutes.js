const express = require("express");

const {
  assignSubscription,
  getSubscriptions,
  getSubscriptionById,
  getGymCurrentSubscription,
  renewSubscription,
  updateSubscriptionStatus,
  updatePaymentStatus,
} = require("../controllers/gymSubscriptionController");

const protectSuperAdmin = require("../middleware/superAdminAuthMiddleware");

const router = express.Router();

router.use(protectSuperAdmin);

router.post("/", assignSubscription);

router.get("/", getSubscriptions);

router.get("/gym/:gymId/current", getGymCurrentSubscription);

router.get("/:id", getSubscriptionById);

router.post("/:id/renew", renewSubscription);

router.patch("/:id/status", updateSubscriptionStatus);

router.patch("/:id/payment-status", updatePaymentStatus);

module.exports = router;