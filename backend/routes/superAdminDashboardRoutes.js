const express = require("express");

const {
  getSuperAdminDashboard,
} = require("../controllers/superAdminDashboardController");

const protectSuperAdmin = require("../middleware/superAdminAuthMiddleware");

const router = express.Router();

router.get("/", protectSuperAdmin, getSuperAdminDashboard);

module.exports = router;
