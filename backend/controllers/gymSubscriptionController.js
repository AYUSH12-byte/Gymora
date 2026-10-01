const GymSubscription = require("../models/GymSubscription");
const Gym = require("../models/Gym");
const SubscriptionPlan = require("../models/SubscriptionPlan");

const calculateEndDate = (startDate, duration, durationUnit) => {
  const endDate = new Date(startDate);

  if (durationUnit === "days") {
    endDate.setDate(endDate.getDate() + duration);
  }

  if (durationUnit === "months") {
    endDate.setMonth(endDate.getMonth() + duration);
  }

  if (durationUnit === "years") {
    endDate.setFullYear(endDate.getFullYear() + duration);
  }

  return endDate;
};

const assignSubscription = async (req, res) => {
  try {
    const {
      gymId,
      planId,
      startDate,
      paymentStatus = "pending",
      transactionId = "",
      notes = "",
    } = req.body;

    if (!gymId || !planId || !startDate) {
      return res.status(400).json({
        message: "Gym, subscription plan, and start date are required",
      });
    }

    const gym = await Gym.findOne({
      _id: gymId,
      isDeleted: false,
    });

    if (!gym) {
      return res.status(404).json({
        message: "Gym not found",
      });
    }

    if (gym.status !== "active") {
      return res.status(400).json({
        message: "Cannot assign subscription to an inactive gym",
      });
    }

    const plan = await SubscriptionPlan.findById(planId);

    if (!plan) {
      return res.status(404).json({
        message: "Subscription plan not found",
      });
    }

    if (plan.status !== "active") {
      return res.status(400).json({
        message: "Cannot assign an inactive subscription plan",
      });
    }

    const existingSubscription = await GymSubscription.findOne({
      gym: gymId,
      status: "active",
      endDate: { $gte: new Date() },
    });

    if (existingSubscription) {
      return res.status(400).json({
        message:
          "Gym already has an active subscription. Please renew or cancel the existing subscription first.",
      });
    }

    const parsedStartDate = new Date(startDate);

    if (Number.isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({
        message: "Invalid start date",
      });
    }

    const endDate = calculateEndDate(
      parsedStartDate,
      plan.duration,
      plan.durationUnit,
    );

    const subscription = await GymSubscription.create({
      gym: gymId,
      plan: planId,
      startDate: parsedStartDate,
      endDate,
      amount: plan.price,
      paymentStatus,
      status: "active",
      transactionId,
      notes,
      createdBy: req.superAdmin._id,
    });

    const populatedSubscription = await GymSubscription.findById(
      subscription._id,
    )
      .populate("gym", "name email phone status")
      .populate(
        "plan",
        "name description duration durationUnit price features maxMembers maxTrainers",
      )
      .populate("createdBy", "name email");

    res.status(201).json({
      message: "Subscription assigned successfully",
      subscription: populatedSubscription,
    });
  } catch (error) {
    console.error("Assign subscription error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getSubscriptions = async (req, res) => {
  try {
    const { status, paymentStatus, gymId } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (gymId) {
      filter.gym = gymId;
    }

    const subscriptions = await GymSubscription.find(filter)
      .populate("gym", "name email phone status")
      .populate(
        "plan",
        "name description duration durationUnit price features maxMembers maxTrainers",
      )
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: subscriptions.length,
      subscriptions,
    });
  } catch (error) {
    console.error("Get subscriptions error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getSubscriptionById = async (req, res) => {
  try {
    const subscription = await GymSubscription.findById(req.params.id)
      .populate("gym", "name email phone address ownerName ownerEmail status")
      .populate(
        "plan",
        "name description duration durationUnit price features maxMembers maxTrainers",
      )
      .populate("createdBy", "name email");

    if (!subscription) {
      return res.status(404).json({
        message: "Subscription not found",
      });
    }

    res.status(200).json({
      subscription,
    });
  } catch (error) {
    console.error("Get subscription error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getGymCurrentSubscription = async (req, res) => {
  try {
    const subscription = await GymSubscription.findOne({
      gym: req.params.gymId,
      status: "active",
      endDate: { $gte: new Date() },
    })
      .populate("gym", "name email phone status")
      .populate(
        "plan",
        "name description duration durationUnit price features maxMembers maxTrainers",
      );

    if (!subscription) {
      return res.status(404).json({
        message: "No active subscription found for this gym",
      });
    }

    res.status(200).json({
      subscription,
    });
  } catch (error) {
    console.error("Get gym subscription error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const renewSubscription = async (req, res) => {
  try {
    const {
      planId,
      startDate,
      paymentStatus = "pending",
      transactionId = "",
      notes = "",
    } = req.body;

    if (!planId || !startDate) {
      return res.status(400).json({
        message: "Subscription plan and start date are required",
      });
    }

    const oldSubscription = await GymSubscription.findById(req.params.id);

    if (!oldSubscription) {
      return res.status(404).json({
        message: "Subscription not found",
      });
    }

    const gym = await Gym.findOne({
      _id: oldSubscription.gym,
      isDeleted: false,
    });

    if (!gym) {
      return res.status(404).json({
        message: "Gym not found",
      });
    }

    if (gym.status !== "active") {
      return res.status(400).json({
        message: "Cannot renew subscription for an inactive gym",
      });
    }

    const plan = await SubscriptionPlan.findById(planId);

    if (!plan) {
      return res.status(404).json({
        message: "Subscription plan not found",
      });
    }

    if (plan.status !== "active") {
      return res.status(400).json({
        message: "Cannot use an inactive subscription plan",
      });
    }

    const parsedStartDate = new Date(startDate);

    if (Number.isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({
        message: "Invalid start date",
      });
    }

    const endDate = calculateEndDate(
      parsedStartDate,
      plan.duration,
      plan.durationUnit,
    );

    oldSubscription.status = "cancelled";
    await oldSubscription.save();

    const newSubscription = await GymSubscription.create({
      gym: oldSubscription.gym,
      plan: planId,
      startDate: parsedStartDate,
      endDate,
      amount: plan.price,
      paymentStatus,
      status: "active",
      transactionId,
      notes,
      createdBy: req.superAdmin._id,
    });

    const populatedSubscription = await GymSubscription.findById(
      newSubscription._id,
    )
      .populate("gym", "name email phone status")
      .populate(
        "plan",
        "name description duration durationUnit price features maxMembers maxTrainers",
      )
      .populate("createdBy", "name email");

    res.status(201).json({
      message: "Subscription renewed successfully",
      subscription: populatedSubscription,
    });
  } catch (error) {
    console.error("Renew subscription error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const updateSubscriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["active", "expired", "cancelled", "suspended"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid subscription status",
      });
    }

    const subscription = await GymSubscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        message: "Subscription not found",
      });
    }

    subscription.status = status;

    await subscription.save();

    res.status(200).json({
      message: `Subscription ${status} successfully`,
      subscription,
    });
  } catch (error) {
    console.error("Update subscription status error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, transactionId } = req.body;

    const allowedStatuses = ["paid", "pending", "failed"];

    if (!allowedStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        message: "Invalid payment status",
      });
    }

    const subscription = await GymSubscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        message: "Subscription not found",
      });
    }

    subscription.paymentStatus = paymentStatus;

    if (transactionId !== undefined) {
      subscription.transactionId = transactionId;
    }

    await subscription.save();

    res.status(200).json({
      message: "Payment status updated successfully",
      subscription,
    });
  } catch (error) {
    console.error("Update payment status error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getGymSubscriptionSummary = async (req, res) => {
  try {
    const { gymId } = req.params;

    const gym = await Gym.findOne({
      _id: gymId,
      isDeleted: false,
    }).select("name email phone address status");

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: "Gym not found",
      });
    }

    const subscription = await GymSubscription.findOne({
      gym: gym._id,
    })
      .populate(
        "plan",
        "name description duration durationUnit price features maxMembers maxTrainers",
      )
      .populate(
        "createdBy",
        "name email",
      )
      .sort({
        endDate: -1,
      });

    if (!subscription) {
      return res.status(200).json({
        success: true,
        gym,
        subscription: null,
        summary: {
          hasSubscription: false,
          status: "none",
          daysRemaining: 0,
          expired: false,
        },
      });
    }

    const now = new Date();

    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    const daysRemaining = Math.max(
      Math.ceil(
        (new Date(subscription.endDate) - now) /
          millisecondsPerDay,
      ),
      0,
    );

    const expired =
      new Date(subscription.endDate) <= now;

    return res.status(200).json({
      success: true,

      gym,

      subscription,

      summary: {
        hasSubscription: true,
        status: subscription.status,
        paymentStatus: subscription.paymentStatus,
        daysRemaining,
        expired,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        amount: subscription.amount,
      },
    });
  } catch (error) {
    console.error(
      "Get gym subscription summary error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  assignSubscription,
  getSubscriptions,
  getSubscriptionById,
  getGymCurrentSubscription,
  renewSubscription,
  updateSubscriptionStatus,
  updatePaymentStatus,
  getGymSubscriptionSummary,
};
