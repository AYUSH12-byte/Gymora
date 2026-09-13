const Payment = require("../models/Payment");
const Membership = require("../models/Membership");
const Member = require("../models/Member");

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
    const { membershipId, amount, paymentMethod, transactionId, notes } =
      req.body;

    if (!membershipId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Membership, amount and payment method are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than 0",
      });
    }

    // Find membership
    const membership = await Membership.findById(membershipId);

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found",
      });
    }

    if (membership.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot make payment for cancelled membership",
      });
    }

    // Calculate total already paid
    const paymentSummary = await Payment.aggregate([
      {
        $match: {
          membership: membership._id,
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
      paymentSummary.length > 0 ? paymentSummary[0].totalPaid : 0;

    const remainingAmount = membership.finalAmount - totalPaid;

    if (amount > remainingAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment exceeds remaining amount. Remaining amount is ${remainingAmount}`,
      });
    }

    // Generate receipt number
    const receiptNumber = await generateReceiptNumber();

    // Create payment
    const payment = await Payment.create({
      membership: membership._id,
      member: membership.member,
      amount,
      paymentMethod,
      transactionId,
      receiptNumber,
      notes,
    });

    // Calculate new total
    const newTotalPaid = totalPaid + amount;

    // Update membership payment status
    let paymentStatus = "partial";

    if (newTotalPaid >= membership.finalAmount) {
      paymentStatus = "paid";
    }

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
        },
      });

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      payment: populatedPayment,
      paymentSummary: {
        membershipAmount: membership.finalAmount,
        totalPaid: newTotalPaid,
        remainingAmount: membership.finalAmount - newTotalPaid,
        paymentStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all payments
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
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
      .sort({ paidAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get payments for a membership
const getMembershipPayments = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.membershipId);

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found",
      });
    }

    const payments = await Payment.find({
      membership: membership._id,
    })
      .populate({
        path: "member",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ paidAt: -1 });

    const totalPaid = payments.reduce(
      (total, payment) => total + payment.amount,
      0,
    );

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
      summary: {
        membershipAmount: membership.finalAmount,
        totalPaid,
        remainingAmount: membership.finalAmount - totalPaid,
        paymentStatus: membership.paymentStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single payment
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
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
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    res.status(500).json({
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
