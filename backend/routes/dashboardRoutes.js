const express = require("express");

const { getDashboardOverview } = require("../controllers/dashboardController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const checkGymSubscription = require("../middleware/gymSubscriptionMiddleware");

const router = express.Router();

router.get(
  "/overview",
  protect,
  checkGymSubscription,
  authorizeRoles("admin"),
  getDashboardOverview,
);

module.exports = router;
