const Membership = require("../models/Membership");
const Member = require("../models/Member");
const MembershipPackage = require("../models/MembershipPackage");
const Notification = require("../models/Notification");

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
    await updateExpiredMemberships();

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

// Update expired memberships
const updateExpiredMemberships = async () => {
  try {
    const now = new Date();

    await Membership.updateMany(
      {
        status: "active",
        endDate: {
          $lte: now,
        },
      },
      {
        $set: {
          status: "expired",
        },
      },
    );
  } catch (error) {
    console.error("Membership expiry update error:", error.message);
  }
};

// Renew membership
const renewMembership = async (req, res) => {
  try {
    const { membershipId, startDate } = req.body;

    if (!membershipId) {
      return res.status(400).json({
        success: false,
        message: "Membership ID is required",
      });
    }

    const oldMembership =
      await Membership.findById(membershipId).populate("package");

    if (!oldMembership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found",
      });
    }

    if (oldMembership.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled membership cannot be renewed",
      });
    }

    // Check whether member already has an active membership
    const activeMembership = await Membership.findOne({
      member: oldMembership.member,
      status: "active",
      _id: {
        $ne: oldMembership._id,
      },
    });

    if (activeMembership) {
      return res.status(400).json({
        success: false,
        message: "Member already has an active membership",
      });
    }

    const membershipPackage = oldMembership.package;

    const start = startDate ? new Date(startDate) : new Date();

    // Calculate end date
    const endDate = calculateEndDate(
      start,
      membershipPackage.duration,
      membershipPackage.durationUnit,
    );

    // Calculate amount
    const originalAmount = membershipPackage.price;
    const discountPercentage = membershipPackage.discount || 0;
    const discountAmount = (originalAmount * discountPercentage) / 100;
    const finalAmount = originalAmount - discountAmount;

    // Determine status
    const today = new Date();

    let status = "upcoming";

    if (start <= today && endDate > today) {
      status = "active";
    }

    if (endDate <= today) {
      status = "expired";
    }

    // Create renewed membership
    const renewedMembership = await Membership.create({
      member: oldMembership.member,
      package: membershipPackage._id,
      startDate: start,
      endDate,
      originalAmount,
      discountPercentage,
      discountAmount,
      finalAmount,
      status,
      paymentStatus: "pending",
    });

    // Populate renewed membership
    const populatedMembership = await Membership.findById(renewedMembership._id)
      .populate({
        path: "member",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate("package");

    // Create membership renewed notification
    if (req.user?._id) {
      const memberName = populatedMembership?.member?.user?.name || "Member";

      await Notification.create({
        user: req.user._id,
        type: "membership_renewed",
        title: "Membership Renewed",
        message: `${memberName} renewed his membership.`,
        relatedId: renewedMembership._id,
      });
    }

    res.status(201).json({
      success: true,
      message: "Membership renewed successfully",
      membership: populatedMembership,
    });
  } catch (error) {
    console.error("Renew Membership Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get expiring memberships
const getExpiringMemberships = async (req, res) => {
  try {
    const now = new Date();

    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);
    next7Days.setHours(23, 59, 59, 999);

    const memberships = await Membership.find({
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
      });

    res.status(200).json({
      success: true,
      count: memberships.length,
      message: "Memberships expiring within 7 days",
      memberships,
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
  updateExpiredMemberships,
  renewMembership,
  getExpiringMemberships,
};
