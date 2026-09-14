const Member = require("../models/Member");
const MembershipPackage = require("../models/MembershipPackage");
const Membership = require("../models/Membership");
const Payment = require("../models/Payment");

// Purchase membership
const purchaseMembership = async (req, res) => {
  try {
    const { packageId, paymentAmount, paymentMethod, transactionId, notes } =
      req.body;

    if (!packageId) {
      return res.status(400).json({
        success: false,
        message: "Package ID is required",
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
    }

    // Get logged-in member
    const member = await Member.findOne({
      user: req.user._id,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member profile not found",
      });
    }

    if (member.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Your member account is inactive",
      });
    }

    // Get package
    const packageData = await MembershipPackage.findById(packageId);

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Membership package not found",
      });
    }

    if (!packageData.isActive) {
      return res.status(400).json({
        success: false,
        message: "This membership package is not available",
      });
    }

    // Check existing active membership
    const activeMembership = await Membership.findOne({
      member: member._id,
      status: "active",
    });

    if (activeMembership) {
      return res.status(400).json({
        success: false,
        message:
          "You already have an active membership. Please wait until it expires before purchasing another membership.",
      });
    }

    // Calculate discount on server
    const originalAmount = packageData.price;

    const discountPercentage = packageData.discount || 0;

    const discountAmount = (originalAmount * discountPercentage) / 100;

    const finalAmount = originalAmount - discountAmount;

    // Validate payment amount
    const amountToPay =
      paymentAmount !== undefined ? Number(paymentAmount) : finalAmount;

    if (Number.isNaN(amountToPay) || amountToPay <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    if (amountToPay > finalAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment cannot exceed ${finalAmount}`,
      });
    }

    // Calculate start date
    const startDate = new Date();

    // Calculate end date
    const endDate = new Date(startDate);

    if (packageData.durationUnit === "days") {
      endDate.setDate(endDate.getDate() + packageData.duration);
    } else if (packageData.durationUnit === "months") {
      endDate.setMonth(endDate.getMonth() + packageData.duration);
    } else if (packageData.durationUnit === "years") {
      endDate.setFullYear(endDate.getFullYear() + packageData.duration);
    }

    // Determine payment status
    let paymentStatus = "pending";

    if (amountToPay >= finalAmount) {
      paymentStatus = "paid";
    } else if (amountToPay > 0) {
      paymentStatus = "partial";
    }

    // Create membership
    const membership = await Membership.create({
      member: member._id,
      package: packageData._id,
      startDate,
      endDate,
      originalAmount,
      discountPercentage,
      discountAmount,
      finalAmount,
      status: "active",
      paymentStatus,
    });

    // Generate receipt number
    const year = new Date().getFullYear();

    const paymentCount = await Payment.countDocuments({
      receiptNumber: {
        $regex: `^REC-${year}-`,
      },
    });

    const receiptNumber = `REC-${year}-${String(paymentCount + 1).padStart(
      4,
      "0",
    )}`;

    // Create payment
    const payment = await Payment.create({
      membership: membership._id,
      member: member._id,
      amount: amountToPay,
      paymentMethod,
      transactionId: transactionId || "",
      receiptNumber,
      notes: notes || "",
    });

    const populatedMembership = await Membership.findById(membership._id)
      .populate("package", "name duration durationUnit price discount")
      .populate({
        path: "member",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    return res.status(201).json({
      success: true,
      message: "Membership purchased successfully",
      membership: populatedMembership,
      payment,
      summary: {
        originalAmount,
        discountPercentage,
        discountAmount,
        finalAmount,
        paidAmount: amountToPay,
        remainingAmount: finalAmount - amountToPay,
        paymentStatus,
      },
    });
  } catch (error) {
    console.error("Purchase Membership Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  purchaseMembership,
};
