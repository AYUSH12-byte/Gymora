const express = require("express");

const {
  getNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get all notifications
router.get("/", protect, getNotifications);

// Get unread notifications
router.get("/unread", protect, getUnreadNotifications);

// Mark all notifications as read
router.put("/read-all", protect, markAllAsRead);

// Mark notification as read
router.put("/:id/read", protect, markAsRead);

// Delete notification
router.delete("/:id", protect, deleteNotification);

module.exports = router;