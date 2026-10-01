const express = require("express");

const {
  assignAdminToGym,
  getAdminUsers,
  removeAdminFromGym,
  createGymAdmin,
} = require("../controllers/superAdminUserController");

const protectSuperAdmin = require("../middleware/superAdminAuthMiddleware");

const router = express.Router();

router.use(protectSuperAdmin);

router.get("/admins", getAdminUsers);

router.post("/admins/create", createGymAdmin);

router.patch("/admins/:userId/remove-gym", removeAdminFromGym);

router.patch("/gyms/:gymId/assign-admin", assignAdminToGym);

module.exports = router;
