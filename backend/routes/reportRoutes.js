const express = require("express");

const {
  getRevenueReport,
  getMembershipReport,
  getAttendanceReport,
  getMemberReport,
} = require("../controllers/reportController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const checkGymSubscription = require("../middleware/gymSubscriptionMiddleware");

const router = express.Router();

router.use(protect);
router.use(checkGymSubscription);

router.get(
  "/revenue",
  authorizeRoles("admin"),
  getRevenueReport,
);

router.get(
  "/memberships",
  authorizeRoles("admin"),
  getMembershipReport,
);

router.get(
  "/attendance",
  authorizeRoles("admin", "trainer"),
  getAttendanceReport,
);

router.get(
  "/members",
  authorizeRoles("admin"),
  getMemberReport,
);

module.exports = router;