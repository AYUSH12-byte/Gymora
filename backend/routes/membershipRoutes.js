const express = require("express");

const {
  createMembership,
  getMemberships,
  getMemberMemberships,
  getMembershipById,
  renewMembership,
} = require("../controllers/membershipController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Create membership
router.post("/", protect, authorizeRoles("admin"), createMembership);

// Get all memberships
router.get("/", protect, authorizeRoles("admin", "trainer"), getMemberships);

// Get memberships of specific member
router.get(
  "/member/:memberId",
  protect,
  authorizeRoles("admin", "trainer"),
  getMemberMemberships,
);

// Get single membership
router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "trainer", "member"),
  getMembershipById,
);

router.post("/renew", protect, authorizeRoles("admin"), renewMembership);

module.exports = router;
