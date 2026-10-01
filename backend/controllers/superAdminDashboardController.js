const Gym = require("../models/Gym");
const User = require("../models/User");
const Member = require("../models/Member");
const Trainer = require("../models/Trainer");
const GymSubscription = require("../models/GymSubscription");

const getSuperAdminDashboard = async (req, res) => {
  try {
    const [
      totalGyms,
      activeGyms,
      inactiveGyms,
      totalMembers,
      totalTrainers,
      activeSubscriptions,
      expiredSubscriptions,
      pendingSubscriptions,
      paidSubscriptions,
      revenueResult,
    ] = await Promise.all([
      Gym.countDocuments({
        isDeleted: false,
      }),

      Gym.countDocuments({
        status: "active",
        isDeleted: false,
      }),

      Gym.countDocuments({
        status: "inactive",
        isDeleted: false,
      }),

      Member.countDocuments(),

      Trainer.countDocuments(),

      GymSubscription.countDocuments({
        status: "active",
      }),

      GymSubscription.countDocuments({
        status: "expired",
      }),

      GymSubscription.countDocuments({
        paymentStatus: "pending",
      }),

      GymSubscription.countDocuments({
        paymentStatus: "paid",
      }),

      GymSubscription.aggregate([
        {
          $match: {
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount",
            },
          },
        },
      ]),
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const recentGyms = await Gym.find({
      isDeleted: false,
    })
      .select("name email phone address ownerName ownerEmail status createdAt")
      .sort({
        createdAt: -1,
      })
      .limit(5);

    const recentSubscriptions = await GymSubscription.find()
      .populate("gym", "name email status")
      .populate("plan", "name duration durationUnit price")
      .sort({
        createdAt: -1,
      })
      .limit(5);

    return res.status(200).json({
      success: true,
      dashboard: {
        gyms: {
          total: totalGyms,
          active: activeGyms,
          inactive: inactiveGyms,
        },

        users: {
          totalMembers,
          totalTrainers,
        },

        subscriptions: {
          active: activeSubscriptions,
          expired: expiredSubscriptions,
          pendingPayment: pendingSubscriptions,
          paid: paidSubscriptions,
        },

        revenue: {
          total: totalRevenue,
        },

        recentGyms,
        recentSubscriptions,
      },
    });
  } catch (error) {
    console.error("Super admin dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getSuperAdminDashboard,
};
