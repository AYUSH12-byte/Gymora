const User = require("../models/User");
const Member = require("../models/Member");
const Trainer = require("../models/Trainer");
const Membership = require("../models/Membership");
const Payment = require("../models/Payment");
const Attendance = require("../models/Attendance");

const getDashboardOverview = async (req, res) => {
  try {
    const now = new Date();

    // Start of today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // End of today
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Next 7 days
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);
    next7Days.setHours(23, 59, 59, 999);

    // Run queries together
    const [
      totalMembers,
      activeMembers,
      inactiveMembers,

      totalTrainers,
      activeTrainers,
      inactiveTrainers,

      activeMemberships,
      upcomingMemberships,
      expiredMemberships,

      totalRevenueResult,

      totalMembershipValueResult,

      todayAttendance,
      currentlyCheckedIn,

      expiringMemberships,

      recentPayments,
      recentMembers,
    ] = await Promise.all([
      // Members
      Member.countDocuments(),

      Member.countDocuments({
        status: "active",
      }),

      Member.countDocuments({
        status: "inactive",
      }),

      // Trainers
      Trainer.countDocuments(),

      Trainer.countDocuments({
        status: "active",
      }),

      Trainer.countDocuments({
        status: "inactive",
      }),

      // Memberships
      Membership.countDocuments({
        status: "active",
      }),

      Membership.countDocuments({
        status: "upcoming",
      }),

      Membership.countDocuments({
        status: "expired",
      }),

      // Total revenue
      Payment.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount",
            },
          },
        },
      ]),

      // Total membership value
      Membership.aggregate([
        {
          $match: {
            status: {
              $ne: "cancelled",
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$finalAmount",
            },
          },
        },
      ]),

      // Today's attendance
      Attendance.countDocuments({
        checkIn: {
          $gte: startOfToday,
          $lte: endOfToday,
        },
      }),

      // Currently checked in
      Attendance.countDocuments({
        checkIn: {
          $gte: startOfToday,
          $lte: endOfToday,
        },
        checkOut: null,
      }),

      // Expiring within 7 days
      Membership.find({
        status: "active",
        endDate: {
          $gte: now,
          $lte: next7Days,
        },
      })
        .populate({
          path: "member",
          populate: {
            path: "user",
            select: "name email",
          },
        })
        .populate("package")
        .sort({
          endDate: 1,
        }),

      // Recent payments
      Payment.find()
        .populate({
          path: "member",
          populate: {
            path: "user",
            select: "name email",
          },
        })
        .populate({
          path: "membership",
          populate: {
            path: "package",
          },
        })
        .sort({
          paidAt: -1,
        })
        .limit(5),

      // Recent members
      Member.find()
        .populate("user", "name email role isActive")
        .sort({
          createdAt: -1,
        })
        .limit(5),
    ]);

    const totalRevenue =
      totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    const totalMembershipValue =
      totalMembershipValueResult.length > 0
        ? totalMembershipValueResult[0].total
        : 0;

    const pendingPayment = totalMembershipValue - totalRevenue;

    res.status(200).json({
      success: true,

      dashboard: {
        members: {
          total: totalMembers,
          active: activeMembers,
          inactive: inactiveMembers,
        },

        trainers: {
          total: totalTrainers,
          active: activeTrainers,
          inactive: inactiveTrainers,
        },

        memberships: {
          active: activeMemberships,
          upcoming: upcomingMemberships,
          expired: expiredMemberships,
        },

        payments: {
          totalRevenue,
          totalMembershipValue,
          pendingPayment: Math.max(pendingPayment, 0),
        },

        attendance: {
          today: todayAttendance,
          currentlyCheckedIn,
        },

        expiringMemberships: {
          count: expiringMemberships.length,
          memberships: expiringMemberships,
        },

        recentPayments,

        recentMembers,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardOverview,
};
