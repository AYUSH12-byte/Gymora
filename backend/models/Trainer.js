const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    specialization: {
      type: String,
      trim: true,
    },

    experience: {
      type: Number,
      min: 0,
      default: 0,
    },

    salary: {
      type: Number,
      min: 0,
      default: 0,
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    bio: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Trainer", trainerSchema);
