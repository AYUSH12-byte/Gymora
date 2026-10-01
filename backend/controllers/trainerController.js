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

    if (!req.user?.gym) {
      return res.status(403).json({
        success: false,
        message: "No gym is assigned to this account",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: "trainer",
      gym: req.user.gym,
    });

    const trainer = await Trainer.create({
      user: user._id,
      gym: req.user.gym,
      phone,
      specialization,
      experience,
      salary,
      joiningDate,
      bio,
    });

    const populatedTrainer = await Trainer.findById(
      trainer._id
    )
      .populate(
        "user",
        "name email role isActive gym"
      )
      .populate(
        "gym",
        "name email phone address status"
      );

    res.status(201).json({
      success: true,
      message: "Trainer created successfully",
      trainer: populatedTrainer,
    });
  } catch (error) {
    console.error("Create trainer error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all trainers for logged-in user's gym
const getTrainers = async (req, res) => {
  try {
    if (!req.user?.gym) {
      return res.status(403).json({
        success: false,
        message: "No gym is assigned to this account",
      });
    }

    const trainers = await Trainer.find({
      gym: req.user.gym,
    })
      .populate(
        "user",
        "name email role isActive gym"
      )
      .populate(
        "gym",
        "name email phone address status"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: trainers.length,
      trainers,
    });
  } catch (error) {
    console.error("Get trainers error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single trainer
const getTrainerById = async (req, res) => {
  try {
    if (!req.user?.gym) {
      return res.status(403).json({
        success: false,
        message: "No gym is assigned to this account",
      });
    }

    const trainer = await Trainer.findOne({
      _id: req.params.id,
      gym: req.user.gym,
    })
      .populate(
        "user",
        "name email role isActive gym"
      )
      .populate(
        "gym",
        "name email phone address status"
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
    console.error("Get trainer by ID error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update trainer
const updateTrainer = async (req, res) => {
  try {
    if (!req.user?.gym) {
      return res.status(403).json({
        success: false,
        message: "No gym is assigned to this account",
      });
    }

    const trainer = await Trainer.findOne({
      _id: req.params.id,
      gym: req.user.gym,
    });

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found",
      });
    }

    const {
      name,
      email,
      phone,
      specialization,
      experience,
      salary,
      joiningDate,
      bio,
      status,
    } = req.body;

    const user = await User.findById(trainer.user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Trainer user account not found",
      });
    }

    if (
      email !== undefined &&
      email.toLowerCase() !== user.email
    ) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      user.email = email.toLowerCase();
    }

    if (name !== undefined) {
      user.name = name;
    }

    await user.save();

    if (phone !== undefined) {
      trainer.phone = phone;
    }

    if (specialization !== undefined) {
      trainer.specialization = specialization;
    }

    if (experience !== undefined) {
      trainer.experience = Number(experience);
    }

    if (salary !== undefined) {
      trainer.salary = Number(salary);
    }

    if (joiningDate !== undefined) {
      trainer.joiningDate = joiningDate;
    }

    if (bio !== undefined) {
      trainer.bio = bio;
    }

    if (status !== undefined) {
      trainer.status = status;
    }

    // Never allow gym to be changed from request body
    trainer.gym = req.user.gym;

    await trainer.save();

    const updatedTrainer = await Trainer.findById(
      trainer._id
    )
      .populate(
        "user",
        "name email role isActive gym"
      )
      .populate(
        "gym",
        "name email phone address status"
      );

    res.status(200).json({
      success: true,
      message: "Trainer updated successfully",
      trainer: updatedTrainer,
    });
  } catch (error) {
    console.error("Update trainer error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete trainer
const deleteTrainer = async (req, res) => {
  try {
    if (!req.user?.gym) {
      return res.status(403).json({
        success: false,
        message: "No gym is assigned to this account",
      });
    }

    const trainer = await Trainer.findOne({
      _id: req.params.id,
      gym: req.user.gym,
    });

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found",
      });
    }

    await User.findByIdAndDelete(trainer.user);

    await Trainer.findByIdAndDelete(trainer._id);

    res.status(200).json({
      success: true,
      message: "Trainer deleted successfully",
    });
  } catch (error) {
    console.error("Delete trainer error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get trainer dashboard
const getTrainerDashboard = async (req, res) => {
  try {
    if (!req.user?.gym) {
      return res.status(403).json({
        success: false,
        message: "No gym is assigned to this account",
      });
    }

    const trainer = await Trainer.findOne({
      user: req.user._id,
      gym: req.user.gym,
    }).populate(
      "user",
      "name email role isActive gym"
    );

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer profile not found",
      });
    }

    const workoutPlans = await WorkoutPlan.find({
      trainer: trainer._id,
    })
      .populate({
        path: "member",
        match: {
          gym: req.user.gym,
        },
        populate: {
          path: "user",
          select: "name email isActive",
        },
      })
      .sort({ createdAt: -1 });

    const validWorkoutPlans = workoutPlans.filter(
      (plan) => plan.member
    );

    const memberIds = [
      ...new Set(
        validWorkoutPlans
          .map((plan) => plan.member?._id?.toString())
          .filter(Boolean)
      ),
    ];

    const members = await Member.find({
      _id: { $in: memberIds },
      gym: req.user.gym,
    })
      .populate(
        "user",
        "name email isActive"
      )
      .sort({ createdAt: -1 });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayAttendance = await Attendance.find({
      member: { $in: memberIds },
      gym: req.user.gym,
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

    const activeWorkoutPlans = validWorkoutPlans.filter(
      (plan) => plan.isActive
    ).length;

    const inactiveWorkoutPlans =
      validWorkoutPlans.length - activeWorkoutPlans;

    const activeMembers = members.filter(
      (member) => member.status === "active"
    ).length;

    const inactiveMembers =
      members.length - activeMembers;

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
          specialization:
            trainer.specialization || "",
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
          total: validWorkoutPlans.length,
          active: activeWorkoutPlans,
          inactive: inactiveWorkoutPlans,
        },

        attendance: {
          today: todayAttendance.length,
          present: todayPresent,
        },

        assignedMembers: members,

        workoutPlansList: validWorkoutPlans,

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

// Get members assigned to logged-in trainer
const getTrainerMembers = async (req, res) => {
  try {
    if (!req.user?.gym) {
      return res.status(403).json({
        success: false,
        message: "No gym is assigned to this account",
      });
    }

    const trainer = await Trainer.findOne({
      user: req.user._id,
      gym: req.user.gym,
    });

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer profile not found",
      });
    }

    const workoutPlans = await WorkoutPlan.find({
      trainer: trainer._id,
    }).select("member");

    const memberIds = [
      ...new Set(
        workoutPlans
          .map((plan) => plan.member?.toString())
          .filter(Boolean)
      ),
    ];

    if (memberIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        members: [],
      });
    }

    const members = await Member.find({
      _id: { $in: memberIds },
      gym: req.user.gym,
    })
      .populate(
        "user",
        "name email role isActive"
      )
      .sort({ createdAt: -1 });

    const membersWithPlans =
      await Promise.all(
        members.map(async (member) => {
          const plans = await WorkoutPlan.find({
            trainer: trainer._id,
            member: member._id,
          }).select(
            "name description difficulty goal startDate endDate isActive exercises"
          );

          return {
            ...member.toObject(),
            workoutPlans: plans,
          };
        })
      );

    res.status(200).json({
      success: true,
      count: membersWithPlans.length,
      members: membersWithPlans,
    });
  } catch (error) {
    console.error(
      "Get trainer members error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get trainer's assigned workout plans
const getTrainerWorkoutPlans = async (
  req,
  res
) => {
  try {
    if (!req.user?.gym) {
      return res.status(403).json({
        success: false,
        message: "No gym is assigned to this account",
      });
    }

    const trainer = await Trainer.findOne({
      user: req.user._id,
      gym: req.user.gym,
    });

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer profile not found",
      });
    }

    const workoutPlans = await WorkoutPlan.find({
      trainer: trainer._id,
    })
      .populate({
        path: "member",
        match: {
          gym: req.user.gym,
        },
        populate: {
          path: "user",
          select: "name email isActive",
        },
      })
      .sort({ createdAt: -1 });

    const filteredWorkoutPlans =
      workoutPlans.filter(
        (plan) => plan.member
      );

    res.status(200).json({
      success: true,
      count: filteredWorkoutPlans.length,
      workoutPlans: filteredWorkoutPlans,
    });
  } catch (error) {
    console.error(
      "Get trainer workout plans error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get trainer's assigned members attendance
const getTrainerAttendance = async (
  req,
  res
) => {
  try {
    if (!req.user?.gym) {
      return res.status(403).json({
        success: false,
        message: "No gym is assigned to this account",
      });
    }

    const trainer = await Trainer.findOne({
      user: req.user._id,
      gym: req.user.gym,
    });

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer profile not found",
      });
    }

    const workoutPlans = await WorkoutPlan.find({
      trainer: trainer._id,
    }).select("member");

    const memberIds = [
      ...new Set(
        workoutPlans
          .map((plan) => plan.member?.toString())
          .filter(Boolean)
      ),
    ];

    if (memberIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        attendance: [],
      });
    }

    const attendance = await Attendance.find({
      member: {
        $in: memberIds,
      },
      gym: req.user.gym,
    })
      .populate({
        path: "member",
        populate: {
          path: "user",
          select: "name email isActive",
        },
      })
      .sort({
        date: -1,
        checkIn: -1,
      });

    res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error(
      "Get trainer attendance error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get logged-in trainer profile
const getTrainerProfile = async (
  req,
  res
) => {
  try {
    if (!req.user?.gym) {
      return res.status(403).json({
        success: false,
        message: "No gym is assigned to this account",
      });
    }

    const trainer = await Trainer.findOne({
      user: req.user._id,
      gym: req.user.gym,
    })
      .populate(
        "user",
        "name email role isActive gym"
      )
      .populate(
        "gym",
        "name email phone address status"
      );

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer profile not found",
      });
    }

    res.status(200).json({
      success: true,
      trainer,
    });
  } catch (error) {
    console.error(
      "Get trainer profile error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update logged-in trainer profile
const updateTrainerProfile = async (
  req,
  res
) => {
  try {
    if (!req.user?.gym) {
      return res.status(403).json({
        success: false,
        message: "No gym is assigned to this account",
      });
    }

    const trainer = await Trainer.findOne({
      user: req.user._id,
      gym: req.user.gym,
    });

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer profile not found",
      });
    }

    const {
      name,
      phone,
      specialization,
      experience,
      bio,
    } = req.body;

    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) {
      user.name = name;
    }

    await user.save();

    if (phone !== undefined) {
      trainer.phone = phone;
    }

    if (specialization !== undefined) {
      trainer.specialization = specialization;
    }

    if (experience !== undefined) {
      trainer.experience = Number(experience);
    }

    if (bio !== undefined) {
      trainer.bio = bio;
    }

    // Prevent changing gym from profile update
    trainer.gym = req.user.gym;

    await trainer.save();

    const updatedTrainer =
      await Trainer.findById(trainer._id)
        .populate(
          "user",
          "name email role isActive gym"
        )
        .populate(
          "gym",
          "name email phone address status"
        );

    res.status(200).json({
      success: true,
      message:
        "Trainer profile updated successfully",
      trainer: updatedTrainer,
    });
  } catch (error) {
    console.error(
      "Update trainer profile error:",
      error
    );

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
  getTrainerMembers,
  getTrainerWorkoutPlans,
  getTrainerAttendance,
  getTrainerProfile,
  updateTrainerProfile,
};