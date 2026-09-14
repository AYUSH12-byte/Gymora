const Member = require("../models/Member");
const Membership = require("../models/Membership");
const Payment = require("../models/Payment");

const generateReceiptNumber = async () => {
  const year = new Date().getFullYear();

  const count = await Payment.countDocuments({
    receiptNumber: {
      $regex: `^REC-${year}-`,
    },
  });

  return `REC-${year}-${String(count + 1).padStart(4, "0")}`;
};

// Get payment summary for logged-in member
const getMyPaymentSummary = async (req, res) => {
  try {
    const member = await Member.findOne({
      user: req.user._id,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member profile not found",
      });
    }

    const memberships = await Membership.find({
      member: member._id,
      status: { $ne: "cancelled" },
    })
      .populate("package", "name duration durationUnit price discount")
      .sort({ createdAt: -1 });

    const summary = [];

    for (const membership of memberships) {
      const payments = await Payment.find({
        membership: membership._id,
      }).sort({ paidAt: -1 });

      const totalPaid = payments.reduce(
        (total, payment) => total + payment.amount,
        0,
      );

      const remainingAmount = Math.max(membership.finalAmount - totalPaid, 0);

      summary.push({
        membership: {
          _id: membership._id,
          package: membership.package,
          startDate: membership.startDate,
          endDate: membership.endDate,
          status: membership.status,
          paymentStatus: membership.paymentStatus,
          originalAmount: membership.originalAmount,
          discountAmount: membership.discountAmount,
          finalAmount: membership.finalAmount,
        },
        paymentSummary: {
          totalAmount: membership.finalAmount,
          paidAmount: totalPaid,
          remainingAmount,
          paymentStatus:
            remainingAmount === 0
              ? "paid"
              : totalPaid > 0
                ? "partial"
                : "pending",
        },
        payments,
      });
    }

    return res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Payment Summary Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Pay remaining membership amount
const payMembershipBalance = async (req, res) => {
  try {
    const { membershipId, amount, paymentMethod, transactionId, notes } =
      req.body;

    if (!membershipId) {
      return res.status(400).json({
        success: false,
        message: "Membership ID is required",
      });
    }

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Payment amount is required",
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
    }

    const paymentAmount = Number(amount);

    if (Number.isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    // Find logged-in member
    const member = await Member.findOne({
      user: req.user._id,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member profile not found",
      });
    }

    // Find membership
    const membership = await Membership.findOne({
      _id: membershipId,
      member: member._id,
    }).populate("package", "name duration durationUnit price discount");

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found or you do not have access to it",
      });
    }

    if (membership.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled membership cannot receive payments",
      });
    }

    // Calculate total amount already paid
    const paymentAggregation = await Payment.aggregate([
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

    const alreadyPaid =
      paymentAggregation.length > 0 ? paymentAggregation[0].totalPaid : 0;

    const remainingAmount = Math.max(membership.finalAmount - alreadyPaid, 0);

    // Already fully paid
    if (remainingAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "This membership is already fully paid",
      });
    }

    // Cannot pay more than remaining
    if (paymentAmount > remainingAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment exceeds remaining balance. Remaining amount is ${remainingAmount}`,
      });
    }

    const newTotalPaid = alreadyPaid + paymentAmount;

    let newPaymentStatus = "partial";

    if (newTotalPaid >= membership.finalAmount) {
      newPaymentStatus = "paid";
    }

    // Generate receipt
    const receiptNumber = await generateReceiptNumber();

    // Create payment
    const payment = await Payment.create({
      membership: membership._id,
      member: member._id,
      amount: paymentAmount,
      paymentMethod,
      transactionId: transactionId || "",
      receiptNumber,
      notes: notes || "",
    });

    // Update membership payment status
    membership.paymentStatus = newPaymentStatus;

    await membership.save();

    const newRemainingAmount = Math.max(
      membership.finalAmount - newTotalPaid,
      0,
    );

    return res.status(201).json({
      success: true,
      message:
        newPaymentStatus === "paid"
          ? "Full membership payment completed successfully"
          : "Installment payment recorded successfully",

      payment,

      summary: {
        membershipId: membership._id,
        totalAmount: membership.finalAmount,
        previousPaidAmount: alreadyPaid,
        currentPayment: paymentAmount,
        totalPaidAmount: newTotalPaid,
        remainingAmount: newRemainingAmount,
        paymentStatus: newPaymentStatus,
      },
    });
  } catch (error) {
    console.error("Membership Balance Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getMyPaymentSummary,
  payMembershipBalance,
};
