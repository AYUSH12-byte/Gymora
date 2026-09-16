const express = require("express");

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
const checkMemberOwnership = require("../middleware/memberOwnership");

const router = express.Router();

// Today's attendance
router.get(
  "/today",
  protect,
  authorizeRoles("admin", "trainer"),
  getTodayAttendance,
);

// Check in
router.post("/check-in", protect, authorizeRoles("admin", "trainer"), checkIn);

// Check in by QR
router.post(
  "/qr-check-in",
  protect,
  authorizeRoles("admin", "trainer"),
  checkInByQR,
);

// Check out by QR
router.post(
  "/qr-check-out",
  protect,
  authorizeRoles("admin", "trainer"),
  checkOutByQR,
);

// Check out
router.post(
  "/check-out",
  protect,
  authorizeRoles("admin", "trainer"),
  checkOut,
);

// All attendance
router.get("/", protect, authorizeRoles("admin", "trainer"), getAttendance);

// Member attendance history
router.get(
  "/member/:memberId",
  protect,
  authorizeRoles("admin", "trainer", "member"),
  checkMemberOwnership,
  getMemberAttendance,
);

// Single attendance
router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "trainer", "member"),
  getAttendanceById,
);

module.exports = router;
