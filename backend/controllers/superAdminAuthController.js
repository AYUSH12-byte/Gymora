const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SuperAdmin = require("../models/SuperAdmin");

const generateToken = (id) => {
  return jwt.sign(
    {
      id,
      role: "super_admin",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

// Login
const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const superAdmin = await SuperAdmin.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!superAdmin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!superAdmin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Super Admin account is inactive",
      });
    }

    const passwordMatch = await bcrypt.compare(password, superAdmin.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(superAdmin._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      superAdmin: {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: superAdmin.role,
        isActive: superAdmin.isActive,
      },
    });
  } catch (error) {
    console.error("Super Admin Login Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  loginSuperAdmin,
};
