const express = require("express");

const {
  createMembership,
  getMemberships,
  getMemberMemberships,
  getMembershipById,
  renewMembership,
  getExpiringMemberships,
} = require("../controllers/membershipController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const checkMemberOwnership = require("../middleware/memberOwnership");
const checkGymSubscription = require("../middleware/gymSubscriptionMiddleware");

const router = express.Router();

// Create membership
router.post(
  "/",
  protect,
  checkGymSubscription,
  authorizeRoles("admin"),
  createMembership,
);

// Renew membership
router.post(
  "/renew",
  protect,
  checkGymSubscription,
  authorizeRoles("admin"),
  renewMembership,
);

// Get all memberships
router.get(
  "/",
  protect,
  checkGymSubscription,
  authorizeRoles("admin", "trainer"),
  getMemberships,
);

// Get expiring memberships
router.get(
  "/expiring",
  protect,
  checkGymSubscription,
  authorizeRoles("admin", "trainer"),
  getExpiringMemberships,
);

// Get member memberships
router.get(
  "/member/:memberId",
  protect,
  checkGymSubscription,
  authorizeRoles("admin", "trainer"),
  checkMemberOwnership,
  getMemberMemberships,
);

// Get membership by ID
router.get(
  "/:id",
  protect,
  checkGymSubscription,
  authorizeRoles("admin", "trainer", "member"),
  getMembershipById,
);

module.exports = router;
