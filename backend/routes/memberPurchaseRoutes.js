const express = require("express");

const {
  purchaseMembership,
} = require("../controllers/memberPurchaseController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/purchase", protect, authorizeRoles("member"), purchaseMembership);

module.exports = router;
