const express = require("express");

const {
  createPackage,
  getPackages,
  getActivePackages,
  getPackageById,
  updatePackage,
  deletePackage,
} = require("../controllers/packageController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin creates package
router.post("/", protect, authorizeRoles("admin"), createPackage);

// Admin sees all packages
router.get("/", protect, authorizeRoles("admin"), getPackages);

// Members and trainers can see active packages
router.get(
  "/active",
  protect,
  authorizeRoles("admin", "trainer", "member"),
  getActivePackages,
);

// Get single package
router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "trainer", "member"),
  getPackageById,
);

// Update package
router.put("/:id", protect, authorizeRoles("admin"), updatePackage);

// Delete package
router.delete("/:id", protect, authorizeRoles("admin"), deletePackage);

module.exports = router;
