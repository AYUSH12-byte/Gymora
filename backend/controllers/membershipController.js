const Membership = require("../models/Membership");
const Member = require("../models/Member");
const MembershipPackage = require("../models/MembershipPackage");

// Calculate end date
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

// Create membership
const createMembership = async (req, res) => {
  try {
    const { memberId, packageId, startDate } = req.body;

    if (!memberId || !packageId || !startDate) {
      return res.status(400).json({
        success: false,
        message: "Member, package and start date are required",
      });
    }

    // Find member
    const member = await Member.findById(memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    // Find package
    const membershipPackage = await MembershipPackage.findById(packageId);

    if (!membershipPackage) {
      return res.status(404).json({
        success: false,
        message: "Membership package not found",
      });
    }

    if (!membershipPackage.isActive) {
      return res.status(400).json({
        success: false,
        message: "This membership package is inactive",
      });
    }

    // Check existing active membership
    const existingMembership = await Membership.findOne({
      member: memberId,
      status: "active",
    });

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: "Member already has an active membership",
      });
    }

    const start = new Date(startDate);

    // Calculate discount
    const originalAmount = membershipPackage.price;

    const discountPercentage = membershipPackage.discount || 0;

    const discountAmount = (originalAmount * discountPercentage) / 100;

    const finalAmount = originalAmount - discountAmount;

    // Calculate end date
    const endDate = calculateEndDate(
      start,
      membershipPackage.duration,
      membershipPackage.durationUnit,
    );

    // Determine status
    const today = new Date();

    let status = "upcoming";

    if (start <= today && endDate > today) {
      status = "active";
    }

    if (endDate <= today) {
      status = "expired";
    }

    const membership = await Membership.create({
      member: memberId,
      package: packageId,
      startDate: start,
      endDate,
      originalAmount,
      discountPercentage,
      discountAmount,
      finalAmount,
      status,
      paymentStatus: "pending",
    });

    const populatedMembership = await Membership.findById(membership._id)
      .populate({
        path: "member",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate("package");

    res.status(201).json({
      success: true,
      message: "Membership created successfully",
      membership: populatedMembership,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all memberships
const getMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find()
      .populate({
        path: "member",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate("package")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: memberships.length,
      memberships,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get member memberships
const getMemberMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find({
      member: req.params.memberId,
    })
      .populate("package")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: memberships.length,
      memberships,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single membership
const getMembershipById = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id)
      .populate({
        path: "member",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate("package");

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found",
      });
    }

    res.status(200).json({
      success: true,
      membership,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createMembership,
  getMemberships,
  getMemberMemberships,
  getMembershipById,
};
