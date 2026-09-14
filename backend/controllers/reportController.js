const Member = require("../models/Member");
const Membership = require("../models/Membership");
const Payment = require("../models/Payment");
const Attendance = require("../models/Attendance");

const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};

    if (startDate || endDate) {
      filter.paidAt = {};

      if (startDate) {
        filter.paidAt.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.paidAt.$lte = end;
      }
    }

    const payments = await Payment.find(filter)
      .populate({
        path: "member",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate("membership")
      .sort({ paidAt: -1 });

    const totalRevenue = payments.reduce(
      (total, payment) => total + payment.amount,
      0
    );

    res.status(200).json({
      success: true,
      totalRevenue,
      totalPayments: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMembershipReport = async (req, res) => {
  try {
    const total = await Membership.countDocuments();

    const active = await Membership.countDocuments({
      status: "active",
    });

    const upcoming = await Membership.countDocuments({
      status: "upcoming",
    });

    const expired = await Membership.countDocuments({
      status: "expired",
    });

    const cancelled = await Membership.countDocuments({
      status: "cancelled",
    });

    const paid = await Membership.countDocuments({
      paymentStatus: "paid",
    });

    const partial = await Membership.countDocuments({
      paymentStatus: "partial",
    });

    const pending = await Membership.countDocuments({
      paymentStatus: "pending",
    });

    res.status(200).json({
      success: true,
      memberships: {
        total,
        active,
        upcoming,
        expired,
        cancelled,
      },
      payments: {
        paid,
        partial,
        pending,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};

    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const attendance = await Attendance.find(filter)
      .populate({
        path: "member",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ date: -1 });

    const totalAttendance = attendance.length;

    const completed = attendance.filter(
      (item) => item.status === "completed"
    ).length;

    const currentlyPresent = attendance.filter(
      (item) => item.checkOut === null
    ).length;

    res.status(200).json({
      success: true,
      summary: {
        totalAttendance,
        completed,
        currentlyPresent,
      },
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMemberReport = async (req, res) => {
  try {
    const totalMembers = await Member.countDocuments();

    const activeMembers = await Member.countDocuments({
      status: "active",
    });

    const inactiveMembers = await Member.countDocuments({
      status: "inactive",
    });

    const totalMembersWithUsers =
      await Member.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      summary: {
        totalMembers,
        activeMembers,
        inactiveMembers,
      },
      members: totalMembersWithUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getRevenueReport,
  getMembershipReport,
  getAttendanceReport,
  getMemberReport,
};