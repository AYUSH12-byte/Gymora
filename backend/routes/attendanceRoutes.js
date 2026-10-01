const express = require("express");

const router = express.Router();

const {
  checkIn,
  checkInByQR,
  checkOut,
  checkOutByQR,
  getAttendance,
  getTodayAttendance,
  getMemberAttendance,
  getAttendanceById,
} = require("../controllers/attendanceController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const checkGymSubscription = require("../middleware/gymSubscriptionMiddleware");

// Get today's attendance
router.get(
  "/today",
  protect,
  checkGymSubscription,
  authorizeRoles("admin"),
  getTodayAttendance,
);

// Get attendance by member
router.get(
  "/member/:memberId",
  protect,
  checkGymSubscription,
  authorizeRoles("admin"),
  getMemberAttendance,
);

// Manual check-in
router.post(
  "/check-in",
  protect,
  checkGymSubscription,
  authorizeRoles("admin"),
  checkIn,
);

// Manual check-out
router.post(
  "/check-out",
  protect,
  checkGymSubscription,
  authorizeRoles("admin"),
  checkOut,
);

// Member scans QR to check-in
router.post(
  "/qr-check-in",
  protect,
  checkGymSubscription,
  authorizeRoles("member"),
  checkInByQR,
);

// Member scans QR to check-out
router.post(
  "/qr-check-out",
  protect,
  checkGymSubscription,
  authorizeRoles("member"),
  checkOutByQR,
);

// Get all attendance
router.get(
  "/",
  protect,
  checkGymSubscription,
  authorizeRoles("admin"),
  getAttendance,
);

// Get attendance by ID
router.get(
  "/:id",
  protect,
  checkGymSubscription,
  authorizeRoles("admin"),
  getAttendanceById,
);

module.exports = router;