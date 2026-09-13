const express = require("express");

const {
  createTrainer,
  getTrainers,
  getTrainerById,
  updateTrainer,
  deleteTrainer,
} = require("../controllers/trainerController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, authorizeRoles("admin"), createTrainer);

router.get("/", protect, authorizeRoles("admin", "trainer"), getTrainers);

router.get("/:id", protect, authorizeRoles("admin", "trainer"), getTrainerById);

router.put("/:id", protect, authorizeRoles("admin"), updateTrainer);

router.delete("/:id", protect, authorizeRoles("admin"), deleteTrainer);

module.exports = router;
