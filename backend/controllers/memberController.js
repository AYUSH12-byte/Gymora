const User = require("../models/User");
const Member = require("../models/Member");

// Create member
const createMember = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      gender,
      dateOfBirth,
      emergencyContact,
    } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and phone are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Create user account
    const user = await User.create({
      name,
      email,
      password,
      role: "member",
    });

    // Create member profile
    const member = await Member.create({
      user: user._id,
      phone,
      address,
      gender,
      dateOfBirth,
      emergencyContact,
    });

    res.status(201).json({
      success: true,
      message: "Member created successfully",
      member,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all members
const getMembers = async (req, res) => {
  try {
    const members = await Member.find()
      .populate("user", "name email role isActive")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single member
const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).populate(
      "user",
      "name email role isActive",
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    res.status(200).json({
      success: true,
      member,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createMember,
  getMembers,
  getMemberById,
};
