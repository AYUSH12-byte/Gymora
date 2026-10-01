const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    duration: {
      type: Number,
      required: true,
      min: 1,
    },

    durationUnit: {
      type: String,
      enum: ["days", "months", "years"],
      default: "months",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    features: {
      type: [String],
      default: [],
    },

    maxMembers: {
      type: Number,
      default: null,
    },

    maxTrainers: {
      type: Number,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "SubscriptionPlan",
  subscriptionPlanSchema,
);