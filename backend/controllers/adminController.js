const User = require("../models/User");
const Member = require("../models/Member");
const Trainer = require("../models/Trainer");
const Membership = require("../models/Membership");
const Payment = require("../models/Payment");
const Attendance = require("../models/Attendance");

const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalMembers,
      activeMembers,
      totalTrainers,
      activeTrainers,
      activeMemberships,
      expiredMemberships,
      upcomingMemberships,
      todayAttendance,
      recentPayments,
      recentMembers,
    ] = await Promise.all([
      Member.countDocuments(),

      Member.countDocuments({
        status: "active",
      }),

      Trainer.countDocuments(),

      Trainer.countDocuments({
        status: "active",
      }),

      Membership.countDocuments({
        status: "active",
      }),

      Membership.countDocuments({
        status: "expired",
      }),

      Membership.countDocuments({
        status: "upcoming",
      }),

      Attendance.countDocuments({
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),

      Payment.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate({
          path: "member",
          populate: {
            path: "user",
            select: "name email",
          },
        }),

      Member.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("user", "name email role"),
    ]);

    const revenueResult = await Payment.aggregate([
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.status(200).json({
      success: true,

      dashboard: {
        members: {
          total: totalMembers,
          active: activeMembers,
          inactive: totalMembers - activeMembers,
        },

        trainers: {
          total: totalTrainers,
          active: activeTrainers,
          inactive: totalTrainers - activeTrainers,
        },

        memberships: {
          active: activeMemberships,
          expired: expiredMemberships,
          upcoming: upcomingMemberships,
        },

        attendance: {
          today: todayAttendance,
        },

        revenue: {
          total: totalRevenue,
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

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Change user active status
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account",
      });
    }

    user.isActive = !user.isActive;

    await user.save();

    res.status(200).json({
      success: true,
      message: user.isActive
        ? "User activated successfully"
        : "User deactivated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
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
  getAdminDashboard,
  getUsers,
  toggleUserStatus,
};
