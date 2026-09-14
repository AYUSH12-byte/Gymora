const express = require("express");

const {
  getAdminDashboard,
  getUsers,
  toggleUserStatus,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/dashboard", protect, authorizeRoles("admin"), getAdminDashboard);

router.get("/users", protect, authorizeRoles("admin"), getUsers);

router.put(
  "/users/:id/toggle-status",
  protect,
  authorizeRoles("admin"),
  toggleUserStatus,
);

module.exports = router;
