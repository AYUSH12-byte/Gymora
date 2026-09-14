const express = require("express");

const {
  checkIn,
  checkInByQR,
  checkOut,
  getAttendance,
  getTodayAttendance,
  getMemberAttendance,
  getAttendanceById,
} = require("../controllers/attendanceController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const checkMemberOwnership = require("../middleware/memberOwnership");

const router = express.Router();

// Check in
router.post("/check-in", protect, authorizeRoles("admin", "trainer"), checkIn);

// Check in by QR code
router.post(
  "/qr-check-in",
  protect,
  authorizeRoles("admin", "trainer"),
  checkInByQR,
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

// Today's attendance
router.get(
  "/today",
  protect,
  authorizeRoles("admin", "trainer"),
  getTodayAttendance,
);

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
