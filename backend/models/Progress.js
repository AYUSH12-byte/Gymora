const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    recordedAt: {
      type: Date,
      default: Date.now,
    },

    weight: {
      type: Number,
      required: true,
      min: 0,
    },

    bodyFat: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    chest: {
      type: Number,
      min: 0,
      default: null,
    },

    waist: {
      type: Number,
      min: 0,
      default: null,
    },

    arms: {
      type: Number,
      min: 0,
      default: null,
    },

    thighs: {
      type: Number,
      min: 0,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Progress", progressSchema);