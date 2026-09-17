const express = require("express");

const {
  createTrainer,
  getTrainers,
  getTrainerById,
  updateTrainer,
  deleteTrainer,
  getTrainerDashboard,
  getTrainerMembers,
  getTrainerWorkoutPlans,
  getTrainerAttendance,
} = require("../controllers/trainerController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Trainer dashboard
router.get(
  "/dashboard",
  protect,
  authorizeRoles("trainer"),
  getTrainerDashboard,
);

// Get members assigned to logged-in trainer
router.get(
  "/my-members",
  protect,
  authorizeRoles("trainer"),
  getTrainerMembers
);

// Get workout plans assigned to logged-in trainer
router.get(
  "/my-workout-plans",
  protect,
  authorizeRoles("trainer"),
  getTrainerWorkoutPlans
);

// Get attendance records for members assigned to logged-in trainer
router.get(
  "/my-attendance",
  protect,
  authorizeRoles("trainer"),
  getTrainerAttendance
);

// Admin creates trainer
router.post("/", protect, authorizeRoles("admin"), createTrainer);

// Admin and trainer can view trainers
router.get("/", protect, authorizeRoles("admin", "trainer"), getTrainers);

// Admin and trainer can view single trainer
router.get("/:id", protect, authorizeRoles("admin", "trainer"), getTrainerById);

// Admin updates trainer
router.put("/:id", protect, authorizeRoles("admin"), updateTrainer);

// Admin deletes trainer
router.delete("/:id", protect, authorizeRoles("admin"), deleteTrainer);

module.exports = router;
