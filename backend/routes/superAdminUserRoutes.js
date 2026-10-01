const express = require("express");

const {
  createGymAdmin,
  getAdminUsers,
  assignAdminToGym,
  removeAdminFromGym,
} = require("../controllers/superAdminUserController");

const protectSuperAdmin = require("../middleware/superAdminAuthMiddleware");

const router = express.Router();

router.get("/admins", protectSuperAdmin, getAdminUsers);

router.post("/admins/create", protectSuperAdmin, createGymAdmin);

router.patch("/gyms/:gymId/assign-admin", protectSuperAdmin, assignAdminToGym);

router.patch(
  "/admins/:userId/remove-gym",
  protectSuperAdmin,
  removeAdminFromGym,
);

module.exports = router;
