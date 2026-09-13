const WorkoutPlan = require("../models/WorkoutPlan");
const Member = require("../models/Member");
const Trainer = require("../models/Trainer");

// Create workout plan
const createWorkoutPlan = async (req, res) => {
  try {
    const {
      name,
      description,
      difficulty,
      goal,
      memberId,
      trainerId,
      exercises,
      startDate,
      endDate,
    } = req.body;

    if (!name || !memberId || !trainerId || !startDate) {
      return res.status(400).json({
        success: false,
        message: "Name, member, trainer and start date are required",
      });
    }

    // Check member
    const member = await Member.findById(memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    // Check trainer
    const trainer = await Trainer.findById(trainerId);

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found",
      });
    }

    if (trainer.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Trainer is inactive",
      });
    }

    const workoutPlan = await WorkoutPlan.create({
      name,
      description,
      difficulty,
      goal,
      member: memberId,
      trainer: trainerId,
      exercises,
      startDate,
      endDate,
    });

    const populatedPlan = await WorkoutPlan.findById(workoutPlan._id)
      .populate({
        path: "member",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "trainer",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    res.status(201).json({
      success: true,
      message: "Workout plan created successfully",
      workoutPlan: populatedPlan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all workout plans
const getWorkoutPlans = async (req, res) => {
  try {
    const plans = await WorkoutPlan.find()
      .populate({
        path: "member",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "trainer",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: plans.length,
      workoutPlans: plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get plans for a member
const getMemberWorkoutPlans = async (req, res) => {
  try {
    const member = await Member.findById(req.params.memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    const plans = await WorkoutPlan.find({
      member: member._id,
    })
      .populate({
        path: "trainer",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: plans.length,
      workoutPlans: plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get plans created by trainer
const getTrainerWorkoutPlans = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.trainerId);

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found",
      });
    }

    const plans = await WorkoutPlan.find({
      trainer: trainer._id,
    })
      .populate({
        path: "member",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: plans.length,
      workoutPlans: plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single workout plan
const getWorkoutPlanById = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id)
      .populate({
        path: "member",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "trainer",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Workout plan not found",
      });
    }

    res.status(200).json({
      success: true,
      workoutPlan: plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update workout plan
const updateWorkoutPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Workout plan not found",
      });
    }

    const populatedPlan = await WorkoutPlan.findById(plan._id)
      .populate({
        path: "member",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "trainer",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    res.status(200).json({
      success: true,
      message: "Workout plan updated successfully",
      workoutPlan: populatedPlan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete workout plan
const deleteWorkoutPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findByIdAndDelete(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Workout plan not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Workout plan deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createWorkoutPlan,
  getWorkoutPlans,
  getMemberWorkoutPlans,
  getTrainerWorkoutPlans,
  getWorkoutPlanById,
  updateWorkoutPlan,
  deleteWorkoutPlan,
};
