const express = require("express");

const {
  checkIn,
  checkOut,
  getAttendance,
  getTodayAttendance,
  getMemberAttendance,
  getAttendanceById,
} = require("../controllers/attendanceController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Check in
router.post("/check-in", protect, authorizeRoles("admin", "trainer"), checkIn);

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
