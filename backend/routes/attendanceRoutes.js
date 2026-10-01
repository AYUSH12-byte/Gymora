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
  authorizeRoles("admin"),
  checkGymSubscription,
  getTodayAttendance,
);

// Get attendance by member
router.get(
  "/member/:memberId",
  protect,
  authorizeRoles("admin"),
  checkGymSubscription,
  getMemberAttendance,
);

// Manual check-in
router.post(
  "/check-in",
  protect,
  authorizeRoles("admin"),
  checkGymSubscription,
  checkIn,
);

// Manual check-out
router.post(
  "/check-out",
  protect,
  authorizeRoles("admin"),
  checkGymSubscription,
  checkOut,
);

// Member scans QR to check-in
router.post(
  "/qr-check-in",
  protect,
  authorizeRoles("member"),
  checkGymSubscription,
  checkInByQR,
);

// Member scans QR to check-out
router.post(
  "/qr-check-out",
  protect,
  authorizeRoles("member"),
  checkGymSubscription,
  checkOutByQR,
);

// Get all attendance
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  checkGymSubscription,
  getAttendance,
);

// Get attendance by ID
router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  checkGymSubscription,
  getAttendanceById,
);

module.exports = router;