const User = require("../models/User");
const Trainer = require("../models/Trainer");
const WorkoutPlan = require("../models/WorkoutPlan");
const Member = require("../models/Member");
const Attendance = require("../models/Attendance");

// Create trainer
const createTrainer = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      experience,
      salary,
      joiningDate,
      bio,
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

    const user = await User.create({
      name,
      email,
      password,
      role: "trainer",
    });

    const trainer = await Trainer.create({
      user: user._id,
      phone,
      specialization,
      experience,
      salary,
      joiningDate,
      bio,
    });

    const populatedTrainer = await Trainer.findById(trainer._id).populate(
      "user",
      "name email role isActive"
    );

    res.status(201).json({
      success: true,
      message: "Trainer created successfully",
      trainer: populatedTrainer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all trainers
const getTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find()
      .populate("user", "name email role isActive")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: trainers.length,
      trainers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single trainer
const getTrainerById = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id).populate(
      "user",
      "name email role isActive"
    );

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found",
      });
    }

    res.status(200).json({
      success: true,
      trainer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update trainer
const updateTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("user", "name email role isActive");

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Trainer updated successfully",
      trainer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete trainer
const deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found",
      });
    }

    await User.findByIdAndDelete(trainer.user);

    await Trainer.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Trainer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get trainer dashboard
const getTrainerDashboard = async (req, res) => {
  try {
    // Find trainer profile connected to logged-in user
    const trainer = await Trainer.findOne({
      user: req.user._id,
    }).populate("user", "name email role isActive");

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer profile not found",
      });
    }

    // Find all workout plans assigned to this trainer
    const workoutPlans = await WorkoutPlan.find({
      trainer: trainer._id,
    })
      .populate({
        path: "member",
        populate: {
          path: "user",
          select: "name email isActive",
        },
      })
      .sort({ createdAt: -1 });

    // Get unique assigned member IDs
    const memberIds = [
      ...new Set(
        workoutPlans
          .map((plan) => plan.member?._id?.toString())
          .filter(Boolean)
      ),
    ];

    // Get assigned members
    const members = await Member.find({
      _id: { $in: memberIds },
    })
      .populate("user", "name email isActive")
      .sort({ createdAt: -1 });

    // Today's date range
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Attendance of trainer's assigned members today
    const todayAttendance = await Attendance.find({
      member: { $in: memberIds },
      date: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    })
      .populate({
        path: "member",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ checkIn: -1 });

    // Count active workout plans
    const activeWorkoutPlans = workoutPlans.filter(
      (plan) => plan.isActive
    ).length;

    // Count inactive workout plans
    const inactiveWorkoutPlans = workoutPlans.length - activeWorkoutPlans;

    // Count active members
    const activeMembers = members.filter(
      (member) => member.status === "active"
    ).length;

    // Count inactive members
    const inactiveMembers = members.length - activeMembers;

    // Today's present/completed attendance
    const todayPresent = todayAttendance.filter(
      (attendance) =>
        attendance.status === "present" ||
        attendance.status === "completed"
    ).length;

    res.status(200).json({
      success: true,

      dashboard: {
        trainer: {
          id: trainer._id,
          name: trainer.user?.name || "Trainer",
          email: trainer.user?.email || "",
          phone: trainer.phone,
          specialization: trainer.specialization || "",
          experience: trainer.experience || 0,
          joiningDate: trainer.joiningDate,
          status: trainer.status,
          bio: trainer.bio || "",
        },

        members: {
          total: members.length,
          active: activeMembers,
          inactive: inactiveMembers,
        },

        workoutPlans: {
          total: workoutPlans.length,
          active: activeWorkoutPlans,
          inactive: inactiveWorkoutPlans,
        },

        attendance: {
          today: todayAttendance.length,
          present: todayPresent,
        },

        assignedMembers: members,

        workoutPlansList: workoutPlans,

        todayAttendance,
      },
    });
  } catch (error) {
    console.error("Trainer dashboard error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createTrainer,
  getTrainers,
  getTrainerById,
  updateTrainer,
  deleteTrainer,
  getTrainerDashboard,
};