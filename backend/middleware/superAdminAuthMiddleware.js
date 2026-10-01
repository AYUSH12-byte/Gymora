const jwt = require("jsonwebtoken");

const SuperAdmin = require("../models/SuperAdmin");

const protectSuperAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token required.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Super Admin access required",
      });
    }

    const superAdmin = await SuperAdmin.findById(decoded.id).select(
      "-password",
    );

    if (!superAdmin) {
      return res.status(401).json({
        success: false,
        message: "Super Admin not found",
      });
    }

    if (!superAdmin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Super Admin account is inactive",
      });
    }

    req.superAdmin = superAdmin;

    next();
  } catch (error) {
    console.error("Super Admin Auth Error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = protectSuperAdmin;
