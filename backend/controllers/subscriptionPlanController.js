const SubscriptionPlan = require("../models/SubscriptionPlan");

// Create Subscription Plan
const createSubscriptionPlan = async (req, res) => {
  try {
    const {
      name,
      description,
      duration,
      durationUnit,
      price,
      features,
      maxMembers,
      maxTrainers,
    } = req.body;

    if (!name || duration === undefined || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Plan name, duration, and price are required",
      });
    }

    if (Number(duration) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Duration must be greater than 0",
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    const existingPlan = await SubscriptionPlan.findOne({
      name: name.trim(),
    });

    if (existingPlan) {
      return res.status(409).json({
        success: false,
        message: "A subscription plan with this name already exists",
      });
    }

    const plan = await SubscriptionPlan.create({
      name: name.trim(),
      description: description || "",
      duration: Number(duration),
      durationUnit: durationUnit || "months",
      price: Number(price),
      features: Array.isArray(features) ? features : [],
      maxMembers:
        maxMembers !== undefined && maxMembers !== null && maxMembers !== ""
          ? Number(maxMembers)
          : null,
      maxTrainers:
        maxTrainers !== undefined && maxTrainers !== null && maxTrainers !== ""
          ? Number(maxTrainers)
          : null,
      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: "Subscription plan created successfully",
      plan,
    });
  } catch (error) {
    console.error("Create Subscription Plan Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Subscription Plans
const getSubscriptionPlans = async (req, res) => {
  try {
    const { search, status } = req.query;

    const filter = {};

    if (status && ["active", "inactive"].includes(status)) {
      filter.status = status;
    }

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    const plans = await SubscriptionPlan.find(filter)
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: plans.length,
      plans,
    });
  } catch (error) {
    console.error("Get Subscription Plans Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Subscription Plan
const getSubscriptionPlanById = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id).lean();

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    return res.status(200).json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("Get Subscription Plan Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Subscription Plan
const updateSubscriptionPlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    const {
      name,
      description,
      duration,
      durationUnit,
      price,
      features,
      maxMembers,
      maxTrainers,
    } = req.body;

    if (name !== undefined) {
      const trimmedName = name.trim();

      const duplicatePlan = await SubscriptionPlan.findOne({
        name: trimmedName,
        _id: {
          $ne: plan._id,
        },
      });

      if (duplicatePlan) {
        return res.status(409).json({
          success: false,
          message: "Another subscription plan already uses this name",
        });
      }

      plan.name = trimmedName;
    }

    if (description !== undefined) {
      plan.description = description;
    }

    if (duration !== undefined) {
      if (Number(duration) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Duration must be greater than 0",
        });
      }

      plan.duration = Number(duration);
    }

    if (durationUnit !== undefined) {
      if (!["days", "months", "years"].includes(durationUnit)) {
        return res.status(400).json({
          success: false,
          message: "Invalid duration unit",
        });
      }

      plan.durationUnit = durationUnit;
    }

    if (price !== undefined) {
      if (Number(price) < 0) {
        return res.status(400).json({
          success: false,
          message: "Price cannot be negative",
        });
      }

      plan.price = Number(price);
    }

    if (features !== undefined) {
      plan.features = Array.isArray(features) ? features : [];
    }

    if (maxMembers !== undefined) {
      plan.maxMembers =
        maxMembers === null || maxMembers === "" ? null : Number(maxMembers);
    }

    if (maxTrainers !== undefined) {
      plan.maxTrainers =
        maxTrainers === null || maxTrainers === "" ? null : Number(maxTrainers);
    }

    await plan.save();

    return res.status(200).json({
      success: true,
      message: "Subscription plan updated successfully",
      plan,
    });
  } catch (error) {
    console.error("Update Subscription Plan Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Activate Subscription Plan
const activateSubscriptionPlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    plan.status = "active";

    await plan.save();

    return res.status(200).json({
      success: true,
      message: "Subscription plan activated successfully",
      plan,
    });
  } catch (error) {
    console.error("Activate Subscription Plan Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Deactivate Subscription Plan
const deactivateSubscriptionPlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    plan.status = "inactive";

    await plan.save();

    return res.status(200).json({
      success: true,
      message: "Subscription plan deactivated successfully",
      plan,
    });
  } catch (error) {
    console.error("Deactivate Subscription Plan Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate subscription plan",
    });
  }
};

// Delete Subscription Plan
const deleteSubscriptionPlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    await SubscriptionPlan.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Subscription plan deleted successfully",
    });
  } catch (error) {
    console.error("Delete Subscription Plan Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createSubscriptionPlan,
  getSubscriptionPlans,
  getSubscriptionPlanById,
  updateSubscriptionPlan,
  activateSubscriptionPlan,
  deactivateSubscriptionPlan,
  deleteSubscriptionPlan,
};
