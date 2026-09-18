const express = require("express");

const router = express.Router();

const {
  createMember,
  getMembers,
  getMemberById,
  getMemberQR,
} = require("../controllers/memberController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Create member
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createMember,
);

// Get all members
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getMembers,
);

// Get member QR
router.get(
  "/:id/qr",
  protect,
  authorizeRoles("admin"),
  getMemberQR,
);

// Get single member
router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  getMemberById,
);

module.exports = router;