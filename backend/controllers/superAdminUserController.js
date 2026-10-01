const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Gym = require("../models/Gym");

const assignAdminToGym = async (req, res) => {
  try {
    const { gymId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const gym = await Gym.findOne({
      _id: gymId,
      isDeleted: false,
    });

    if (!gym) {
      return res.status(404).json({
        message: "Gym not found",
      });
    }

    if (gym.status !== "active") {
      return res.status(400).json({
        message: "Cannot assign admin to an inactive gym",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(400).json({
        message: "Only admin users can be assigned to a gym",
      });
    }

    user.gym = gym._id;
    await user.save();

    if (user.email) {
      gym.ownerEmail = user.email;
    }

    if (user.name) {
      gym.ownerName = user.name;
    }

    await gym.save();

    const updatedUser = await User.findById(user._id)
      .select("-password")
      .populate("gym", "name email phone address status");

    res.status(200).json({
      message: "Admin assigned to gym successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Assign admin to gym error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getAdminUsers = async (req, res) => {
  try {
    const admins = await User.find({
      role: "admin",
    })
      .select("-password")
      .populate("gym", "name email status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: admins.length,
      admins,
    });
  } catch (error) {
    console.error("Get admin users error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const removeAdminFromGym = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.userId,
      role: "admin",
    });

    if (!user) {
      return res.status(404).json({
        message: "Admin user not found",
      });
    }

    user.gym = null;

    await user.save();

    res.status(200).json({
      message: "Admin removed from gym successfully",
    });
  } catch (error) {
    console.error("Remove admin from gym error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const createGymAdmin = async (req, res) => {
  try {
    const {
      gymId,
      name,
      email,
      password,
    } = req.body;

    if (!gymId || !name || !email || !password) {
      return res.status(400).json({
        message: "Gym, name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const gym = await Gym.findOne({
      _id: gymId,
      isDeleted: false,
    });

    if (!gym) {
      return res.status(404).json({
        message: "Gym not found",
      });
    }

    if (gym.status !== "active") {
      return res.status(400).json({
        message: "Cannot create admin for an inactive gym",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "admin",
      gym: gym._id,
    });

    gym.ownerName = admin.name;
    gym.ownerEmail = admin.email;

    await gym.save();

    return res.status(201).json({
      message: "Gym admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        gym: admin.gym,
      },
      gym: {
        id: gym._id,
        name: gym.name,
      },
    });
  } catch (error) {
    console.error("Create gym admin error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  assignAdminToGym,
  getAdminUsers,
  removeAdminFromGym,
  createGymAdmin,
};