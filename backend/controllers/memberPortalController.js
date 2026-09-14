const Member = require("../models/Member");
const Membership = require("../models/Membership");
const MembershipPackage = require("../models/MembershipPackage");
const WorkoutPlan = require("../models/WorkoutPlan");
const Progress = require("../models/Progress");
const Attendance = require("../models/Attendance");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");

const getMyMemberId = async (userId) => {
  const member = await Member.findOne({
    user: userId,
  });

  return member;
};

// Member dashboard
const getMemberDashboard = async (req, res) => {
  try {
    const member = await getMyMemberId(req.user._id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member profile not found",
      });
    }

    const membership = await Membership.findOne({
      member: member._id,
      status: {
        $in: ["active", "upcoming"],
      },
    })
      .sort({ endDate: -1 })
      .populate("package");

    const workoutPlans = await WorkoutPlan.find({
      member: member._id,
      isActive: true,
    })
      .populate({
        path: "trainer",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 })
      .limit(5);

    const progress = await Progress.find({
      member: member._id,
    })
      .sort({ recordedAt: -1 })
      .limit(5);

    const attendanceCount = await Attendance.countDocuments({
      member: member._id,
    });

    const payments = await Payment.find({
      member: member._id,
    })
      .sort({ paidAt: -1 })
      .limit(5)
      .populate("membership");

    const unreadNotifications = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,

      dashboard: {
        member: {
          id: member._id,
          name: req.user.name,
          email: req.user.email,
          phone: member.phone,
          profileImage: member.profileImage,
        },

        membership,

        workoutPlans,

        recentProgress: progress,

        attendance: {
          totalVisits: attendanceCount,
        },

        recentPayments: payments,

        notifications: {
          unread: unreadNotifications,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Current membership
const getMyMembership = async (req, res) => {
  try {
    const member = await getMyMemberId(req.user._id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member profile not found",
      });
    }

    const memberships = await Membership.find({
      member: member._id,
    })
      .populate("package")
      .sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      memberships,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Available packages
const getAvailablePackages = async (req, res) => {
  try {
    const packages = await MembershipPackage.find({
      isActive: true,
    }).sort({ price: 1 });

    res.status(200).json({
      success: true,
      packages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// My workout plans
const getMyWorkoutPlans = async (req, res) => {
  try {
    const member = await getMyMemberId(req.user._id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member profile not found",
      });
    }

    const workoutPlans = await WorkoutPlan.find({
      member: member._id,
    })
      .populate({
        path: "trainer",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      workoutPlans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// My progress
const getMyProgress = async (req, res) => {
  try {
    const member = await getMyMemberId(req.user._id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member profile not found",
      });
    }

    const progress = await Progress.find({
      member: member._id,
    }).sort({
      recordedAt: -1,
    });

    res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// My attendance
const getMyAttendance = async (req, res) => {
  try {
    const member = await getMyMemberId(req.user._id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member profile not found",
      });
    }

    const attendance = await Attendance.find({
      member: member._id,
    }).sort({
      date: -1,
    });

    res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// My payment history
const getMyPayments = async (req, res) => {
  try {
    const member = await getMyMemberId(req.user._id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member profile not found",
      });
    }

    const payments = await Payment.find({
      member: member._id,
    })
      .populate({
        path: "membership",
        populate: {
          path: "package",
        },
      })
      .sort({
        paidAt: -1,
      });

    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getMemberDashboard,
  getMyMembership,
  getAvailablePackages,
  getMyWorkoutPlans,
  getMyProgress,
  getMyAttendance,
  getMyPayments,
};
