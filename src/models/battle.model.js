const { Schema, model } = require("mongoose");

const resultSchema = new Schema({
  acceptedUser: {
    matchStatus: {
      type: String,
      enum: ["WON", "LOSS", "CANCELLED"],
    },
    screenShot: {
      type: String,
    },
  },
  createdUser: {
    matchStatus: {
      type: String,
      enum: ["WON", "LOSS", "CANCELLED"],
    },
    screenShot: {
      type: String,
    },
  },
});

const battleSchema = new Schema(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    roomNo: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["OPEN", "PLAYING", "CLOSED"],
      default: "OPEN",
    },
    entryFee: {
      type: Number,
      required: true,
    },
    winnerAmount: {
      type: Number,
    },
    acceptedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    matchStatus: {
      type: String,
      enum: ["WON", "LOSS", "CANCELLED", "PENDING"],
      default: "PENDING",
    },
    screenShot: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED"],
      default: "PENDING",
    },
    winner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    loser: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    resultUpatedBy: resultSchema,
  },
  {
    timestamps: true,
  }
);

const Battle = model("battle", battleSchema);

module.exports = Battle;
