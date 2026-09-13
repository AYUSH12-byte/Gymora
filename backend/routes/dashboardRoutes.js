const express = require("express");

const { getDashboardOverview } = require("../controllers/dashboardController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/overview", protect, authorizeRoles("admin"), getDashboardOverview);

module.exports = router;
