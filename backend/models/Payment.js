const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    membership: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Membership",
      required: true,
    },

    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "card", "online", "bank_transfer"],
      required: true,
    },

    transactionId: {
      type: String,
      trim: true,
      default: "",
    },

    receiptNumber: {
      type: String,
      unique: true,
      required: true,
    },

    paidAt: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Payment", paymentSchema);
