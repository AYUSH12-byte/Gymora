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

// Register Super Admin
const registerSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing Super Admin
    const existingSuperAdmin = await SuperAdmin.findOne({
      email: normalizedEmail,
    });

    if (existingSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: "Super Admin with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Super Admin
    const superAdmin = await SuperAdmin.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "super_admin",
      isActive: true,
    });

    // Generate token
    const token = generateToken(superAdmin._id);

    return res.status(201).json({
      success: true,
      message: "Super Admin registered successfully",

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
    console.error("Super Admin Register Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login Super Admin
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

    const passwordMatch = await bcrypt.compare(
      password,
      superAdmin.password,
    );

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
  registerSuperAdmin,
  loginSuperAdmin,
};