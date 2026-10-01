const express = require("express");

const {
  createSubscriptionPlan,
  getSubscriptionPlans,
  getSubscriptionPlanById,
  updateSubscriptionPlan,
  activateSubscriptionPlan,
  deactivateSubscriptionPlan,
  deleteSubscriptionPlan,
} = require("../controllers/subscriptionPlanController");

const protectSuperAdmin = require("../middleware/superAdminAuthMiddleware");

const router = express.Router();

router.use(protectSuperAdmin);

router.post("/", createSubscriptionPlan);

router.get("/", getSubscriptionPlans);

router.get("/:id", getSubscriptionPlanById);

router.put("/:id", updateSubscriptionPlan);

router.patch("/:id/activate", activateSubscriptionPlan);

router.patch("/:id/deactivate", deactivateSubscriptionPlan);

router.delete("/:id", deleteSubscriptionPlan);

module.exports = router;
