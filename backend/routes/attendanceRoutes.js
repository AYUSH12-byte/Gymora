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

// Get today's attendance
router.get("/today", protect, authorizeRoles("admin"), getTodayAttendance);

// Get attendance by member
router.get(
  "/member/:memberId",
  protect,
  authorizeRoles("admin"),
  getMemberAttendance,
);

// Manual check-in
router.post("/check-in", protect, authorizeRoles("admin"), checkIn);

// Manual check-out
router.post("/check-out", protect, authorizeRoles("admin"), checkOut);

// Member scans QR to check-in
router.post("/qr-check-in", protect, authorizeRoles("member"), checkInByQR);

// Member scans QR to check-out
router.post("/qr-check-out", protect, authorizeRoles("member"), checkOutByQR);

// Get all attendance
router.get("/", protect, authorizeRoles("admin"), getAttendance);

// Get attendance by ID
router.get("/:id", protect, authorizeRoles("admin"), getAttendanceById);

module.exports = router;
