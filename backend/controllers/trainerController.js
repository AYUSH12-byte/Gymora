const User = require("../models/User");
const Trainer = require("../models/Trainer");

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

    const populatedTrainer = await Trainer.findById(trainer._id)
      .populate("user", "name email role isActive");

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

module.exports = {
  createTrainer,
  getTrainers,
  getTrainerById,
  updateTrainer,
  deleteTrainer,
};