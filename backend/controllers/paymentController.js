const Payment = require("../models/Payment");
const Membership = require("../models/Membership");
const Member = require("../models/Member");
const Notification = require("../models/Notification");

// Generate receipt number
const generateReceiptNumber = async () => {
  const year = new Date().getFullYear();

  const count = await Payment.countDocuments({
    receiptNumber: {
      $regex: `^REC-${year}-`,
    },
  });

  const nextNumber = String(count + 1).padStart(4, "0");

  return `REC-${year}-${nextNumber}`;
};

// Create payment
const createPayment = async (req, res) => {
  try {
    const {
      membershipId,
      amount,
      paymentMethod,
      transactionId,
      notes,
    } = req.body;

    // Validate gym assignment
    if (!req.user?.gym) {
      return res.status(403).json({
        success: false,
        message: "No gym is assigned to this account",
      });
    }

    // Basic validation
    if (!membershipId || amount === undefined || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Membership, amount and payment method are required",
      });
    }

    // Convert amount to number
    const paymentAmount = Number(amount);

    if (Number.isNaN(paymentAmount)) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be a valid number",
      });
    }

    if (paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than 0",
      });
    }

    // Validate payment method
    const allowedPaymentMethods = [
      "cash",
      "card",
      "online",
      "bank_transfer",
    ];

    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // Find membership only inside current gym
    const membership = await Membership.findOne({
      _id: membershipId,
      gym: req.user.gym,
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found in your gym",
      });
    }

    // Validate member belongs to current gym
    const member = await Member.findOne({
      _id: membership.member,
      gym: req.user.gym,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found in your gym",
      });
    }

    // Cancelled membership cannot receive payment
    if (membership.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot make payment for cancelled membership",
      });
    }

    // Check membership amount
    if (
      membership.finalAmount === undefined ||
      membership.finalAmount === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Membership final amount is not available",
      });
    }

    // Calculate total already paid for this gym
    const paymentSummary = await Payment.aggregate([
      {
        $match: {
          membership: membership._id,
          gym: req.user.gym,
        },
      },
      {
        $group: {
          _id: null,
          totalPaid: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const totalPaid =
      paymentSummary.length > 0
        ? paymentSummary[0].totalPaid
        : 0;

    // Calculate remaining amount
    const remainingAmount = membership.finalAmount - totalPaid;

    // Already fully paid
    if (remainingAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "This membership has already been fully paid",
      });
    }

    // Prevent overpayment
    if (paymentAmount > remainingAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment exceeds remaining amount. Maximum payment allowed is ${remainingAmount}`,
        paymentSummary: {
          membershipAmount: membership.finalAmount,
          totalPaid,
          remainingAmount,
        },
      });
    }

    // Generate receipt number
    const receiptNumber = await generateReceiptNumber();

    // Create payment with current gym
    const payment = await Payment.create({
      gym: req.user.gym,
      membership: membership._id,
      member: membership.member,
      amount: paymentAmount,
      paymentMethod,
      transactionId: transactionId || "",
      receiptNumber,
      notes: notes || "",
    });

    // Calculate new total paid
    const newTotalPaid = totalPaid + paymentAmount;

    // Calculate remaining balance
    const newRemainingAmount =
      membership.finalAmount - newTotalPaid;

    // Determine payment status
    let paymentStatus = "pending";

    if (newTotalPaid >= membership.finalAmount) {
      paymentStatus = "paid";
    } else if (newTotalPaid > 0) {
      paymentStatus = "partial";
    }

    // Update membership payment status
    membership.paymentStatus = paymentStatus;

    await membership.save();

    // Populate payment
    const populatedPayment = await Payment.findById(payment._id)
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
          select:
            "name duration durationUnit price discount description",
        },
      });

    // Create payment received notification
    if (req.user?._id) {
      const memberName =
        populatedPayment?.member?.user?.name || "Member";

      await Notification.create({
        user: req.user._id,
        type: "payment_received",
        title: "Payment Received",
        message: `Rs. ${paymentAmount.toLocaleString()} payment received from ${memberName}.`,
        relatedId: payment._id,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Payment recorded successfully",

      payment: populatedPayment,

      paymentSummary: {
        membershipAmount: membership.finalAmount,
        totalPaid: newTotalPaid,
        remainingAmount: newRemainingAmount,
        paymentStatus,
      },
    });
  } catch (error) {
    console.error("Create Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all payments
const getPayments = async (req, res) => {
  try {
    // Validate gym assignment
    if (!req.user?.gym) {
      return res.status(403).json({
        success: false,
        message: "No gym is assigned to this account",
      });
    }

    // Get payments only from current gym
    const payments = await Payment.find({
      gym: req.user.gym,
    })
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
          select:
            "name duration durationUnit price discount description",
        },
      })
      .sort({ paidAt: -1 });

    // Calculate total revenue
    const totalRevenue = payments.reduce(
      (total, payment) => total + payment.amount,
      0,
    );

    return res.status(200).json({
      success: true,
      count: payments.length,
      totalRevenue,
      payments,
    });
  } catch (error) {
    console.error("Get Payments Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get payments for a membership
const getMembershipPayments = async (req, res) => {
  try {
    // Validate gym assignment
    if (!req.user?.gym) {
      return res.status(403).json({
        success: false,
        message: "No gym is assigned to this account",
      });
    }

    // Find membership only inside current gym
    const membership = await Membership.findOne({
      _id: req.params.membershipId,
      gym: req.user.gym,
    }).populate(
      "package",
      "name duration durationUnit price discount",
    );

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found in your gym",
      });
    }

    // Get payments only from current gym
    const payments = await Payment.find({
      membership: membership._id,
      gym: req.user.gym,
    })
      .populate({
        path: "member",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ paidAt: -1 });

    // Calculate total paid
    const totalPaid = payments.reduce(
      (total, payment) => total + payment.amount,
      0,
    );

    // Calculate remaining amount
    const remainingAmount = Math.max(
      membership.finalAmount - totalPaid,
      0,
    );

    // Calculate correct status
    let paymentStatus = "pending";

    if (totalPaid >= membership.finalAmount) {
      paymentStatus = "paid";
    } else if (totalPaid > 0) {
      paymentStatus = "partial";
    }

    // Sync membership payment status if required
    if (membership.paymentStatus !== paymentStatus) {
      membership.paymentStatus = paymentStatus;
      await membership.save();
    }

    return res.status(200).json({
      success: true,
      count: payments.length,

      membership: {
        id: membership._id,
        finalAmount: membership.finalAmount,
        status: membership.status,
        paymentStatus,
        startDate: membership.startDate,
        endDate: membership.endDate,
        package: membership.package,
      },

      payments,

      summary: {
        membershipAmount: membership.finalAmount,
        totalPaid,
        remainingAmount,
        paymentStatus,
      },
    });
  } catch (error) {
    console.error("Get Membership Payments Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single payment
const getPaymentById = async (req, res) => {
  try {
    // Validate gym assignment
    if (!req.user?.gym) {
      return res.status(403).json({
        success: false,
        message: "No gym is assigned to this account",
      });
    }

    // Get payment only from current gym
    const payment = await Payment.findOne({
      _id: req.params.id,
      gym: req.user.gym,
    })
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
          select:
            "name duration durationUnit price discount description",
        },
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Get Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPayment,
  getPayments,
  getMembershipPayments,
  getPaymentById,
};