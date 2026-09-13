const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    sets: {
      type: Number,
      required: true,
      min: 1,
    },

    reps: {
      type: Number,
      required: true,
      min: 1,
    },

    duration: {
      type: Number,
      min: 0,
      default: 0,
    },

    restTime: {
      type: Number,
      min: 0,
      default: 60,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false },
);

const workoutPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    goal: {
      type: String,
      enum: ["weight_loss", "muscle_gain", "strength", "fitness", "endurance"],
      default: "fitness",
    },

    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },

    exercises: {
      type: [exerciseSchema],
      default: [],
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("WorkoutPlan", workoutPlanSchema);
