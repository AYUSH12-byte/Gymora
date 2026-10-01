const Gym = require("../models/Gym");
const GymSubscription = require("../models/GymSubscription");

const checkGymSubscription = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!req.user.gym) {
      return res.status(403).json({
        message: "No gym is assigned to this account",
      });
    }

    const gym = await Gym.findOne({
      _id: req.user.gym,
      isDeleted: false,
    });

    if (!gym) {
      return res.status(403).json({
        message: "Gym not found or has been deleted",
      });
    }

    if (gym.status !== "active") {
      return res.status(403).json({
        message: "This gym has been deactivated by the main administrator",
      });
    }

    const subscription = await GymSubscription.findOne({
      gym: gym._id,
      status: "active",
    }).populate("plan", "name duration durationUnit price");

    if (!subscription) {
      return res.status(403).json({
        message: "Your gym does not have an active Gymora subscription",
      });
    }

    const now = new Date();

    if (subscription.endDate <= now) {
      subscription.status = "expired";
      await subscription.save();

      return res.status(403).json({
        message: "Your Gymora subscription has expired",
        subscriptionExpired: true,
        endDate: subscription.endDate,
      });
    }

    req.gym = gym;
    req.gymSubscription = subscription;

    next();
  } catch (error) {
    console.error("Gym subscription check error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = checkGymSubscription;
