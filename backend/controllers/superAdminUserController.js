const User = require("../models/User");
const Gym = require("../models/Gym");

// Create a new gym admin
const createGymAdmin = async (req, res) => {
  try {
    const { gymId, name, email, password } = req.body;

    if (!gymId || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Gym, name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const gym = await Gym.findOne({
      _id: gymId,
      isDeleted: false,
    });

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: "Gym not found",
      });
    }

    if (gym.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Cannot create admin for an inactive gym",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    const existingGymAdmin = await User.findOne({
      gym: gym._id,
      role: "admin",
    });

    if (existingGymAdmin) {
      return res.status(409).json({
        success: false,
        message: "This gym already has an admin",
      });
    }

    const admin = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "admin",
      gym: gym._id,
    });

    gym.ownerName = admin.name;
    gym.ownerEmail = admin.email;

    await gym.save();

    return res.status(201).json({
      success: true,
      message: "Gym admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        gym: {
          id: gym._id,
          name: gym.name,
        },
      },
    });
  } catch (error) {
    console.error("Create gym admin error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get all gym admins
const getAdminUsers = async (req, res) => {
  try {
    const admins = await User.find({
      role: "admin",
      gym: { $ne: null },
    })
      .select("-password")
      .populate(
        "gym",
        "name email phone address ownerName ownerEmail status",
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: admins.length,
      admins,
    });
  } catch (error) {
    console.error("Get gym admins error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Assign an existing admin to a gym
const assignAdminToGym = async (req, res) => {
  try {
    const { gymId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const gym = await Gym.findOne({
      _id: gymId,
      isDeleted: false,
    });

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: "Gym not found",
      });
    }

    if (gym.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Cannot assign admin to an inactive gym",
      });
    }

    const admin = await User.findOne({
      _id: userId,
      role: "admin",
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found",
      });
    }

    if (admin.gym) {
      return res.status(409).json({
        success: false,
        message: "This admin is already assigned to a gym",
      });
    }

    const existingGymAdmin = await User.findOne({
      gym: gym._id,
      role: "admin",
    });

    if (existingGymAdmin) {
      return res.status(409).json({
        success: false,
        message: "This gym already has an admin",
      });
    }

    admin.gym = gym._id;

    await admin.save();

    gym.ownerName = admin.name;
    gym.ownerEmail = admin.email;

    await gym.save();

    return res.status(200).json({
      success: true,
      message: "Admin assigned to gym successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        gym: {
          id: gym._id,
          name: gym.name,
        },
      },
    });
  } catch (error) {
    console.error("Assign admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Remove admin from gym
const removeAdminFromGym = async (req, res) => {
  try {
    const { userId } = req.params;

    const admin = await User.findOne({
      _id: userId,
      role: "admin",
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found",
      });
    }

    if (!admin.gym) {
      return res.status(400).json({
        success: false,
        message: "Admin is not assigned to any gym",
      });
    }

    const gym = await Gym.findById(admin.gym);

    admin.gym = null;

    await admin.save();

    if (gym) {
      gym.ownerName = "";
      gym.ownerEmail = "";

      await gym.save();
    }

    return res.status(200).json({
      success: true,
      message: "Admin removed from gym successfully",
    });
  } catch (error) {
    console.error("Remove admin from gym error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createGymAdmin,
  getAdminUsers,
  assignAdminToGym,
  removeAdminFromGym,
};