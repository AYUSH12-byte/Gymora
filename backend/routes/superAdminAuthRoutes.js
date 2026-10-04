const express = require("express");

const {
  registerSuperAdmin,
  loginSuperAdmin,
} = require("../controllers/superAdminAuthController");

const router = express.Router();

router.post("/register", registerSuperAdmin);
router.post("/login", loginSuperAdmin);

module.exports = router;