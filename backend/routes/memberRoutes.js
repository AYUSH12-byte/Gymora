const express = require("express");

const router = express.Router();

const {
  createMember,
  getMembers,
  getMemberById,
  getMemberQR,
  deleteMember,
} = require("../controllers/memberController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const checkGymSubscription = require("../middleware/gymSubscriptionMiddleware");

// Create member
router.post(
  "/",
  protect,
  checkGymSubscription,
  authorizeRoles("admin"),
  createMember,
);

// Get all members
router.get(
  "/",
  protect,
  checkGymSubscription,
  authorizeRoles("admin"),
  getMembers,
);

// Get member QR
router.get(
  "/:id/qr",
  protect,
  checkGymSubscription,
  authorizeRoles("admin"),
  getMemberQR,
);

// Get single member
router.get(
  "/:id",
  protect,
  checkGymSubscription,
  authorizeRoles("admin"),
  getMemberById,
);

// Delete member
router.delete(
  "/:id",
  protect,
  checkGymSubscription,
  authorizeRoles("admin"),
  deleteMember,
);

module.exports = router;
