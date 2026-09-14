const express = require("express");

const {
  getMemberDashboard,
  getMyMembership,
  getAvailablePackages,
  getMyWorkoutPlans,
  getMyProgress,
  getMyAttendance,
  getMyPayments,
} = require("../controllers/memberPortalController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/dashboard", protect, authorizeRoles("member"), getMemberDashboard);

router.get("/membership", protect, authorizeRoles("member"), getMyMembership);

router.get(
  "/packages",
  protect,
  authorizeRoles("member"),
  getAvailablePackages,
);

router.get(
  "/workout-plans",
  protect,
  authorizeRoles("member"),
  getMyWorkoutPlans,
);

router.get("/progress", protect, authorizeRoles("member"), getMyProgress);

router.get("/attendance", protect, authorizeRoles("member"), getMyAttendance);

router.get("/payments", protect, authorizeRoles("member"), getMyPayments);

module.exports = router;
