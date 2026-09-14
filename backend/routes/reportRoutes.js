const express = require("express");

const {
  getRevenueReport,
  getMembershipReport,
  getAttendanceReport,
  getMemberReport,
} = require("../controllers/reportController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/revenue", protect, authorizeRoles("admin"), getRevenueReport);

router.get(
  "/memberships",
  protect,
  authorizeRoles("admin"),
  getMembershipReport,
);

router.get(
  "/attendance",
  protect,
  authorizeRoles("admin", "trainer"),
  getAttendanceReport,
);

router.get("/members", protect, authorizeRoles("admin"), getMemberReport);

module.exports = router;
