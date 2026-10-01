const express = require("express");

const {
  createGym,
  getGyms,
  getGymById,
  updateGym,
  activateGym,
  deactivateGym,
  deleteGym,
} = require("../controllers/superAdminGymController");

const protectSuperAdmin = require("../middleware/superAdminAuthMiddleware");

const router = express.Router();

router.use(protectSuperAdmin);

// Create gym
router.post("/", createGym);

// Get all gyms
router.get("/", getGyms);

// Get single gym
router.get("/:id", getGymById);

// Update gym
router.put("/:id", updateGym);

// Activate gym
router.patch("/:id/activate", activateGym);

// Deactivate gym
router.patch("/:id/deactivate", deactivateGym);

// Delete gym
router.delete("/:id", deleteGym);

module.exports = router;
