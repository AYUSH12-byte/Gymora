const express = require("express");

const {
  createProgress,
  getProgress,
  getMemberProgress,
  getProgressById,
  updateProgress,
  deleteProgress,
} = require("../controllers/progressController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const checkMemberOwnership = require("../middleware/memberOwnership");

const router = express.Router();

router.post("/", protect, authorizeRoles("admin", "trainer"), createProgress);

router.get("/", protect, authorizeRoles("admin", "trainer"), getProgress);

router.get(
  "/member/:memberId",
  protect,
  authorizeRoles("admin", "trainer", "member"),
  checkMemberOwnership,
  getMemberProgress,
);

router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "trainer", "member"),
  getProgressById,
);

router.put("/:id", protect, authorizeRoles("admin", "trainer"), updateProgress);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "trainer"),
  deleteProgress,
);

module.exports = router;
