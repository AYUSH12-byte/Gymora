const express = require("express");

const {
  loginSuperAdmin,
} = require("../controllers/superAdminAuthController");

const router = express.Router();

router.post("/login", loginSuperAdmin);

module.exports = router;