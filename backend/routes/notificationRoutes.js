const express = require("express");

const {
  getNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const protect = require("../middleware/authMiddleware");
const checkGymSubscription = require("../middleware/gymSubscriptionMiddleware");

const router = express.Router();

router.use(protect);
router.use(checkGymSubscription);

// Get all notifications
router.get("/", getNotifications);

// Get unread notifications
router.get("/unread", getUnreadNotifications);

// Mark all notifications as read
router.put("/read-all", markAllAsRead);

// Mark notification as read
router.put("/:id/read", markAsRead);

// Delete notification
router.delete("/:id", deleteNotification);

module.exports = router;
