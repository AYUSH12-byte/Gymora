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

const router = express.Router();

// Create membership
router.post("/", protect, authorizeRoles("admin"), createMembership);

// Renew membership
router.post("/renew", protect, authorizeRoles("admin"), renewMembership);

// Get all memberships
router.get("/", protect, authorizeRoles("admin", "trainer"), getMemberships);

// Get expiring memberships
router.get(
  "/expiring",
  protect,
  authorizeRoles("admin", "trainer"),
  getExpiringMemberships,
);

// Get member memberships
router.get(
  "/member/:memberId",
  protect,
  authorizeRoles("admin", "trainer"),
  getMemberMemberships,
);

// Get membership by ID
router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "trainer", "member"),
  getMembershipById,
);

module.exports = router;
