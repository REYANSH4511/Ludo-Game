const { Schema, model } = require("mongoose");

const bankAccountDetailsSchema = new Schema({
  bankName: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  ifscCode: {
    type: String,
    required: true,
  },
});

const userDetailsSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  mobileNo: {
    type: String,
    required: true,
  },
});

const transactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userDetails: userDetailsSchema,
    type: {
      type: String,
      enum: ["deposit", "withdraw"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["upi", "bankAccount"],
    },
    upiId: {
      type: String,
    },
    bankAccountDetails: bankAccountDetailsSchema,
    status: {
      type: "string",
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    utrNo: {
      type: String,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    screenShot: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = model("transaction", transactionSchema);

module.exports = Transaction;
