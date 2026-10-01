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
  getTrainerProfile,
  updateTrainerProfile,
} = require("../controllers/trainerController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const checkGymSubscription = require("../middleware/gymSubscriptionMiddleware");

const router = express.Router();

// Trainer dashboard
router.get(
  "/dashboard",
  protect,
  authorizeRoles("trainer"),
  checkGymSubscription,
  getTrainerDashboard,
);

// Get members assigned to logged-in trainer
router.get(
  "/my-members",
  protect,
  authorizeRoles("trainer"),
  checkGymSubscription,
  getTrainerMembers,
);

// Get workout plans assigned to logged-in trainer
router.get(
  "/my-workout-plans",
  protect,
  authorizeRoles("trainer"),
  checkGymSubscription,
  getTrainerWorkoutPlans,
);

// Get attendance records for members assigned to logged-in trainer
router.get(
  "/my-attendance",
  protect,
  authorizeRoles("trainer"),
  checkGymSubscription,
  getTrainerAttendance,
);

// Get trainer profile
router.get(
  "/profile",
  protect,
  authorizeRoles("trainer"),
  checkGymSubscription,
  getTrainerProfile,
);

// Update trainer profile
router.put(
  "/profile",
  protect,
  authorizeRoles("trainer"),
  checkGymSubscription,
  updateTrainerProfile,
);

// Admin creates trainer
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  checkGymSubscription,
  createTrainer,
);

// Admin and trainer can view trainers
router.get(
  "/",
  protect,
  authorizeRoles("admin", "trainer"),
  checkGymSubscription,
  getTrainers,
);

// Admin and trainer can view single trainer
router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "trainer"),
  checkGymSubscription,
  getTrainerById,
);

// Admin updates trainer
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  checkGymSubscription,
  updateTrainer,
);

// Admin deletes trainer
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  checkGymSubscription,
  deleteTrainer,
);

module.exports = router;