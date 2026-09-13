const express = require("express");

const {
  createWorkoutPlan,
  getWorkoutPlans,
  getMemberWorkoutPlans,
  getTrainerWorkoutPlans,
  getWorkoutPlanById,
  updateWorkoutPlan,
  deleteWorkoutPlan,
} = require("../controllers/workoutPlanController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Create plan
router.post(
  "/",
  protect,
  authorizeRoles("admin", "trainer"),
  createWorkoutPlan,
);

// Get all plans
router.get("/", protect, authorizeRoles("admin", "trainer"), getWorkoutPlans);

// Get member plans
router.get(
  "/member/:memberId",
  protect,
  authorizeRoles("admin", "trainer", "member"),
  getMemberWorkoutPlans,
);

// Get trainer plans
router.get(
  "/trainer/:trainerId",
  protect,
  authorizeRoles("admin", "trainer"),
  getTrainerWorkoutPlans,
);

// Get single plan
router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "trainer", "member"),
  getWorkoutPlanById,
);

// Update
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "trainer"),
  updateWorkoutPlan,
);

// Delete
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "trainer"),
  deleteWorkoutPlan,
);

module.exports = router;
