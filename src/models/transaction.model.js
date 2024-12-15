const { Schema, model } = require("mongoose");

const transactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["deposit", "withdraw"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: "string",
      enum: ["pending", "approved", "rejected"],
      default: "pending",
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
