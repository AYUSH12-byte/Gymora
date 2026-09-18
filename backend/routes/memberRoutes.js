const express = require("express");

const {
  createMember,
  getMembers,
  getMemberById,
  getMemberQR,
} = require("../controllers/memberController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin only
router.post("/", protect, authorizeRoles("admin"), createMember);

// Admin and trainer
router.get("/", protect, authorizeRoles("admin", "trainer"), getMembers);

// Admin and trainer
router.get(
  "/:id/qr",
  protect,
  authorizeRoles("admin", "trainer"),
  getMemberQR,
);

// Admin and trainer
router.get("/:id", protect, authorizeRoles("admin", "trainer"), getMemberById);

module.exports = router;
